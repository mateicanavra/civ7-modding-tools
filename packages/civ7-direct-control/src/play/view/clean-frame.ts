import { Type } from "typebox";

import { Civ7DirectControlError } from "../../direct-control-error.js";
import { jsLiteral } from "../../runtime/command-serialization.js";
import { jsonPayloadFromCommandResult } from "../../session/command-result.js";
import { executeCiv7AppUiCommand } from "../../session/execute.js";
import { sleep } from "../../timing.js";

import type {
  Civ7CommandResult,
  Civ7DirectControlOptions,
  Civ7TunerState,
} from "../../session/types.js";

// Live-verified against a running Civ7 game on 2026-06-11: the only machinery
// that hides the in-game HUD and world overlays is the ViewManager rules
// engine (core/ui/views/view-manager.js). Each registered view declares rules
// (harness hidden/shown, ui-hide-*/ui-show-* world events) and the `current`
// setter applies them as a verified transition: exitView -> applyRules ->
// switchView(harness template) -> enterView.
//
// The game's own screenshot affordances are NOT usable for clean frames:
// INTERFACEMODE_SCREENSHOT maps to the stub ScreenshotView whose rules keep
// everything visible and whose enterView injects placeholder "foo"/"bar"
// buttons into the harness. The Cinematic view has the right hidden-rule set
// but drags cinematic input/harness semantics along. So we register our own
// view with the Cinematic rule set, an "empty" harness template, and no other
// behavior — every hide/show runs through the official rules engine, which
// keeps ViewManager's rule-state bookkeeping consistent for the restore.
//
// Like DisplayQueueManager, ViewManager is an ES module, not a global: it is
// only reachable from exec via the shared module registry
// (`import("/core/ui/views/view-manager.js")` — note: the `.chunk.js` paths in
// our extracted resources are artifacts of the extraction pipeline and do NOT
// resolve in the live VFS). The import is async while exec returns
// synchronously, so the bridge memoizes the module on `globalThis` in one exec
// and operates on it in the next.

/** Where the memoized view-manager module lives inside the App UI context. */
export const CIV7_VIEW_MANAGER_BRIDGE_GLOBAL = "__civ7DirectControlViewManager";

/** Name of the hidden-rules view this package registers in the view pool. */
export const CIV7_CLEAN_FRAME_VIEW_NAME = "DirectControlCleanFrame";

/** Where the pre-clean-frame view name is parked for the restore. */
export const CIV7_CLEAN_FRAME_PREVIOUS_VIEW_GLOBAL =
  "__civ7DirectControlCleanFramePreviousView";

/** Flag read by the registered view's enterView to also hide 3D units. */
export const CIV7_CLEAN_FRAME_HIDE_UNITS_GLOBAL =
  "__civ7DirectControlCleanFrameHideUnits";

/**
 * World-system rule names hidden by the clean-frame view — the Cinematic
 * view's live rule set (the gold standard for "nothing over the map").
 */
export const CIV7_CLEAN_FRAME_HIDDEN_WORLD_RULES: ReadonlyArray<string> = [
  "city-banners",
  "district-health-bars",
  "plot-icons",
  "plot-tooltips",
  "plot-vfx",
  "unit-flags",
  "unit-info-panel",
  "small-narratives",
];

export const DEFAULT_CIV7_VIEW_BRIDGE_ATTEMPTS = 6;
export const CIV7_VIEW_BRIDGE_RETRY_MS = 500;

const civ7TunerStateSchema = Type.Object({
  id: Type.String(),
  name: Type.String(),
}, { additionalProperties: false });

export type Civ7CleanFrameEnterInput = Readonly<{
  /** Also hide 3D unit models (WorldUI.setUnitVisibility) for map-only frames. */
  hideUnits?: boolean;
}>;

export const Civ7CleanFrameEnterResultSchema = Type.Object({
  host: Type.String(),
  port: Type.Number(),
  state: civ7TunerStateSchema,
  switched: Type.Boolean(),
  viewBefore: Type.String(),
  view: Type.String(),
  harnessHidden: Type.Boolean(),
  hideUnits: Type.Boolean(),
}, { additionalProperties: false });

export type Civ7CleanFrameEnterResult = Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
  /** setCurrentByName accepted the transition. */
  switched: boolean;
  /** View that was current before the clean frame (the restore target). */
  viewBefore: string;
  /** View current after the call — the readback truth source. */
  view: string;
  /** HUD harness hidden after the call — the readback truth source. */
  harnessHidden: boolean;
  hideUnits: boolean;
}>;

export const Civ7CleanFrameExitResultSchema = Type.Object({
  host: Type.String(),
  port: Type.Number(),
  state: civ7TunerStateSchema,
  switched: Type.Boolean(),
  view: Type.String(),
  harnessHidden: Type.Boolean(),
}, { additionalProperties: false });

export type Civ7CleanFrameExitResult = Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
  switched: boolean;
  view: string;
  harnessHidden: boolean;
}>;

export type CleanFrameDependencies = Readonly<{
  executeAppUiCommand: (
    options: Civ7DirectControlOptions & Readonly<{ command: string }>,
  ) => Promise<Civ7CommandResult>;
  jsLiteral: (value: unknown) => string;
  parsePayload: <T>(result: Civ7CommandResult, label: string) => T;
  sleep: (ms: number) => Promise<void>;
}>;

const defaultCleanFrameDependencies: CleanFrameDependencies = {
  executeAppUiCommand: executeCiv7AppUiCommand,
  jsLiteral,
  parsePayload: <T,>(result: Civ7CommandResult, label: string) =>
    jsonPayloadFromCommandResult(result, label) as T,
  sleep,
};

type BridgePayload = Readonly<{ ready: boolean }>;

/**
 * Memoizes the view-manager module on `globalThis` inside the App UI context.
 * Safe to call repeatedly; later operations assume the bridge is present.
 */
export async function ensureCiv7ViewManagerBridge(
  options: Civ7DirectControlOptions = {},
  dependencies: CleanFrameDependencies = defaultCleanFrameDependencies,
): Promise<void> {
  for (let attempt = 0; attempt < DEFAULT_CIV7_VIEW_BRIDGE_ATTEMPTS; attempt += 1) {
    const payload = dependencies.parsePayload<BridgePayload>(
      await dependencies.executeAppUiCommand({
        ...options,
        command: buildViewManagerBridgeCommand(),
      }),
      "Civ7 view-manager bridge",
    );
    if (payload.ready) return;
    await dependencies.sleep(CIV7_VIEW_BRIDGE_RETRY_MS);
  }
  throw new Civ7DirectControlError(
    "command-failed",
    "Civ7 view-manager bridge never became ready (module-registry import did not resolve)",
  );
}

/**
 * Switches the live game into the hidden-rules clean-frame view: HUD harness
 * hidden, every world overlay (banners, flags, icons, tooltips, vfx,
 * narratives) hidden through the official rules engine, optionally 3D units
 * too. Records the previous view for {@link exitCiv7CleanFrame}; the readback
 * fields are the truth source, not the switch request.
 */
export async function enterCiv7CleanFrame(
  input: Civ7CleanFrameEnterInput = {},
  options: Civ7DirectControlOptions = {},
  dependencies: CleanFrameDependencies = defaultCleanFrameDependencies,
): Promise<Civ7CleanFrameEnterResult> {
  await ensureCiv7ViewManagerBridge(options, dependencies);
  const hideUnits = input.hideUnits === true;
  const result = await dependencies.executeAppUiCommand({
    ...options,
    command: buildCleanFrameEnterCommand(hideUnits, dependencies),
  });
  const payload = dependencies.parsePayload<
    Omit<Civ7CleanFrameEnterResult, "host" | "port" | "state" | "hideUnits">
  >(result, "Civ7 clean-frame enter");
  return {
    host: result.host,
    port: result.port,
    state: result.state,
    ...payload,
    hideUnits,
  };
}

/**
 * Restores the view recorded by {@link enterCiv7CleanFrame} (falls back to
 * "World") — the same official transition re-applies the previous view's
 * show rules and harness template. exitView on the clean-frame view always
 * restores 3D unit visibility.
 */
export async function exitCiv7CleanFrame(
  options: Civ7DirectControlOptions = {},
  dependencies: CleanFrameDependencies = defaultCleanFrameDependencies,
): Promise<Civ7CleanFrameExitResult> {
  await ensureCiv7ViewManagerBridge(options, dependencies);
  const result = await dependencies.executeAppUiCommand({
    ...options,
    command: buildCleanFrameExitCommand(),
  });
  const payload = dependencies.parsePayload<
    Omit<Civ7CleanFrameExitResult, "host" | "port" | "state">
  >(result, "Civ7 clean-frame exit");
  return { host: result.host, port: result.port, state: result.state, ...payload };
}

export function buildViewManagerBridgeCommand(): string {
  return `(() => {
    const bridged = globalThis[${jsLiteral(CIV7_VIEW_MANAGER_BRIDGE_GLOBAL)}];
    if (bridged) return JSON.stringify({ ready: true });
    import("/core/ui/views/view-manager.js")
      .then((m) => { globalThis[${jsLiteral(CIV7_VIEW_MANAGER_BRIDGE_GLOBAL)}] = m; })
      .catch((err) => console.error("[civ7-direct-control] view-manager bridge import failed: " + String(err)));
    return JSON.stringify({ ready: false });
  })()`;
}

export function buildCleanFrameEnterCommand(
  hideUnits: boolean,
  dependencies: Pick<CleanFrameDependencies, "jsLiteral">,
): string {
  const worldRules = CIV7_CLEAN_FRAME_HIDDEN_WORLD_RULES
    .map((name) =>
      `{ name: ${dependencies.jsLiteral(name)}, type: U.World, visible: "false" }`
    )
    .join(",\n        ");
  // views.set (not addHandler) so re-registration is idempotent: addHandler
  // refuses duplicates, and the registered closure must always reflect the
  // current package version, not whichever one registered first.
  return `(() => {
    const m = globalThis[${jsLiteral(CIV7_VIEW_MANAGER_BRIDGE_GLOBAL)}];
    const vm = m.default;
    const U = m.UISystem;
    globalThis[${jsLiteral(CIV7_CLEAN_FRAME_HIDE_UNITS_GLOBAL)}] = ${dependencies.jsLiteral(hideUnits)};
    vm.views.set(${jsLiteral(CIV7_CLEAN_FRAME_VIEW_NAME)}, {
      getName: () => ${jsLiteral(CIV7_CLEAN_FRAME_VIEW_NAME)},
      getInputContext: () => InputContext.World,
      getHarnessTemplate: () => "empty",
      enterView: () => {
        if (globalThis[${jsLiteral(CIV7_CLEAN_FRAME_HIDE_UNITS_GLOBAL)}] === true) WorldUI.setUnitVisibility(false);
      },
      exitView: () => { WorldUI.setUnitVisibility(true); },
      addEnterCallback: () => {},
      addExitCallback: () => {},
      getRules: () => [
        { name: "harness", type: U.HUD, visible: "false" },
        ${worldRules}
      ],
    });
    const viewBefore = vm.current.getName();
    if (viewBefore !== ${jsLiteral(CIV7_CLEAN_FRAME_VIEW_NAME)}) {
      globalThis[${jsLiteral(CIV7_CLEAN_FRAME_PREVIOUS_VIEW_GLOBAL)}] = viewBefore;
    }
    const switched = vm.setCurrentByName(${jsLiteral(CIV7_CLEAN_FRAME_VIEW_NAME)});
    return JSON.stringify({
      switched,
      viewBefore,
      view: vm.current.getName(),
      harnessHidden: vm.isHarnessHidden === true,
    });
  })()`;
}

export function buildCleanFrameExitCommand(): string {
  return `(() => {
    const vm = globalThis[${jsLiteral(CIV7_VIEW_MANAGER_BRIDGE_GLOBAL)}].default;
    const previous = globalThis[${jsLiteral(CIV7_CLEAN_FRAME_PREVIOUS_VIEW_GLOBAL)}];
    const target = typeof previous === "string" && previous.length > 0 ? previous : "World";
    const switched = vm.setCurrentByName(target);
    globalThis[${jsLiteral(CIV7_CLEAN_FRAME_PREVIOUS_VIEW_GLOBAL)}] = undefined;
    return JSON.stringify({
      switched,
      view: vm.current.getName(),
      harnessHidden: vm.isHarnessHidden === true,
    });
  })()`;
}
