import { Type } from "typebox";

import { jsLiteral } from "../../runtime/command-serialization.js";
import { Civ7RuntimeProbeSchema, probeHelperSource } from "../../runtime/probe.js";
import { jsonPayloadFromCommandResult } from "../../session/command-result.js";
import { executeCiv7AppUiCommand } from "../../session/execute.js";
import { sleep } from "../../timing.js";
import { boundedInteger } from "../../validation.js";
import { Civ7MapLocationSchema } from "../map/types.js";

import type { Civ7RuntimeProbe } from "../../runtime/probe.js";
import type {
  Civ7CommandResult,
  Civ7DirectControlOptions,
  Civ7TunerState,
} from "../../session/types.js";
import type { Civ7MapLocation } from "../map/types.js";

// Live-verified against a running Civ7 game on 2026-06-11
// (docs/projects/placement-realignment/evidence/milestone-b-2026-06-11.md, placement stack):
// map-reveal / wonder-discovery cinematics are DisplayQueueManager screens in the App UI
// scripting state. One mounts at a time; closing one mounts the next after a beat
// (~2s settle was reliable). Seven wonder cinematics were drained by name in one live run
// (Zhangjiajie, Iguazú Falls, Gullfoss, Uluru, Machapuchare, Redwood Forest, Torres del Paine).
//
// Official handler provenance:
// .civ7/outputs/resources/Base/modules/base-standard/ui/cinematic/cinematic-manager.chunk.js
// — DisplayQueueManager.close(...) (line ~198); exit restores
// InterfaceMode.switchTo(previousMode) / InterfaceMode.switchToDefault() (lines ~379-380).
// InterfaceMode is an ES module, NOT a global: it is only reachable from exec via the shared
// module registry — import('/core/ui/interface-modes/interface-modes.js').then(...) — which is
// async, so its result is observable only via console.log. It is used for advisory logging
// only, never for return payloads.

/** DOM selector for the mounted cinematic screen's close button (live-verified). */
export const CIV7_CINEMATIC_CLOSE_BUTTON_SELECTOR = "fxs-hero-button.cinematic-moment__close-button";
/** DOM selector for the cinematic title header; textContent is the wonder name (live-verified). */
export const CIV7_CINEMATIC_TITLE_SELECTOR = ".cinematic-moment_title-header";
/** Drain check selector: zero matches means no cinematic-moment DOM remains (live-verified). */
export const CIV7_CINEMATIC_MOMENT_SELECTOR = "[class*=cinematic-moment]";

export const DEFAULT_CIV7_CINEMATIC_MAX_DISMISSALS = 20;
export const MAX_CIV7_CINEMATIC_MAX_DISMISSALS = 100;
export const DEFAULT_CIV7_CINEMATIC_SETTLE_MS = 2_000;
export const MAX_CIV7_CINEMATIC_SETTLE_MS = 60_000;

export type Civ7CinematicDismissalInput = Readonly<{
  maxDismissals?: number;
  settleMs?: number;
  restoreCameraPlot?: Civ7MapLocation;
}>;

export const Civ7CinematicDismissalInputSchema = Type.Object({
  maxDismissals: Type.Optional(Type.Integer({ minimum: 1, maximum: MAX_CIV7_CINEMATIC_MAX_DISMISSALS })),
  settleMs: Type.Optional(Type.Integer({ minimum: 0, maximum: MAX_CIV7_CINEMATIC_SETTLE_MS })),
  restoreCameraPlot: Type.Optional(Civ7MapLocationSchema),
}, { additionalProperties: false });

export type Civ7CinematicDismissalRow = Readonly<{
  iteration: number;
  title: string | null;
}>;

export const Civ7CinematicDismissalRowSchema = Type.Object({
  iteration: Type.Integer({ minimum: 1 }),
  title: Type.Union([Type.String(), Type.Null()]),
}, { additionalProperties: false });

export type Civ7CinematicCameraRestoreResult = Readonly<{
  plot: Civ7MapLocation;
  lookAt: Civ7RuntimeProbe<boolean>;
}>;

export const Civ7CinematicCameraRestoreResultSchema = Type.Object({
  plot: Civ7MapLocationSchema,
  lookAt: Civ7RuntimeProbeSchema(Type.Boolean()),
}, { additionalProperties: false });

const civ7TunerStateSchema = Type.Object({
  id: Type.String(),
  name: Type.String(),
}, { additionalProperties: false });

export const Civ7CinematicDismissalResultSchema = Type.Object({
  host: Type.String(),
  port: Type.Number(),
  state: civ7TunerStateSchema,
  dismissals: Type.Array(Civ7CinematicDismissalRowSchema),
  drained: Type.Boolean(),
  iterations: Type.Integer({ minimum: 1 }),
  domClearCount: Type.Integer({ minimum: 0 }),
  cameraRestore: Type.Union([Civ7CinematicCameraRestoreResultSchema, Type.Null()]),
  notes: Type.Array(Type.String()),
}, { additionalProperties: false });

export type Civ7CinematicDismissalResult = Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
  dismissals: ReadonlyArray<Civ7CinematicDismissalRow>;
  drained: boolean;
  iterations: number;
  domClearCount: number;
  cameraRestore: Civ7CinematicCameraRestoreResult | null;
  notes: ReadonlyArray<string>;
}>;

type Civ7CinematicDismissalProbePayload = Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
  cinematicPresent: boolean;
  dismissedTitle: string | null;
  activate: Civ7RuntimeProbe<boolean> | null;
  click: Civ7RuntimeProbe<boolean> | null;
  remainingSelectorCount: number;
}>;

type Civ7CinematicDrainCheckPayload = Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
  domClearCount: number;
}>;

type Civ7CinematicCameraRestorePayload = Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
  lookAt: Civ7RuntimeProbe<boolean>;
}>;

type CinematicDismissalDependencies = Readonly<{
  boundedInteger: (value: number, min: number, max: number, label: string) => number;
  executeAppUiCommand: (
    options: Civ7DirectControlOptions & Readonly<{ command: string }>,
  ) => Promise<Civ7CommandResult>;
  jsLiteral: (value: unknown) => string;
  parseProbePayload: (result: Civ7CommandResult, label: string) => Civ7CinematicDismissalProbePayload;
  parseDrainCheckPayload: (result: Civ7CommandResult, label: string) => Civ7CinematicDrainCheckPayload;
  parseCameraRestorePayload: (result: Civ7CommandResult, label: string) => Civ7CinematicCameraRestorePayload;
  sleep: (ms: number) => Promise<void>;
}>;

const CIV7_CINEMATIC_DISMISSAL_NOTES: ReadonlyArray<string> = [
  "Cinematic moments are DisplayQueueManager screens in the App UI scripting state; one mounts at a time and closing one mounts the next after a settle beat.",
  "Dismissal mirrors the live-verified synthetic close: dispatch CustomEvent('action-activate', { bubbles: true }) on the close button, then btn.click() when present.",
  "Official handler: cinematic-manager.chunk.js DisplayQueueManager.close (~line 198); exit restores InterfaceMode.switchTo(previousMode)/switchToDefault (~lines 379-380).",
  "After a synthetic DOM close the cinematic's dynamic camera may linger; restoreCameraPlot performs the safe Camera.lookAtPlot restore instead of blind Camera.popCamera loops.",
];

export async function dismissCiv7CinematicMoments(
  input: Civ7CinematicDismissalInput = {},
  options: Civ7DirectControlOptions = {},
  dependencies: CinematicDismissalDependencies = defaultCinematicDismissalDependencies,
): Promise<Civ7CinematicDismissalResult> {
  const maxDismissals = dependencies.boundedInteger(
    input.maxDismissals ?? DEFAULT_CIV7_CINEMATIC_MAX_DISMISSALS,
    1,
    MAX_CIV7_CINEMATIC_MAX_DISMISSALS,
    "maxDismissals",
  );
  const settleMs = dependencies.boundedInteger(
    input.settleMs ?? DEFAULT_CIV7_CINEMATIC_SETTLE_MS,
    0,
    MAX_CIV7_CINEMATIC_SETTLE_MS,
    "settleMs",
  );
  if (input.restoreCameraPlot) {
    dependencies.boundedInteger(input.restoreCameraPlot.x, 0, 1_000_000, "restoreCameraPlot.x");
    dependencies.boundedInteger(input.restoreCameraPlot.y, 0, 1_000_000, "restoreCameraPlot.y");
  }

  const dismissals: Civ7CinematicDismissalRow[] = [];
  let iterations = 0;
  for (;;) {
    const probe = dependencies.parseProbePayload(
      await dependencies.executeAppUiCommand({
        ...options,
        command: buildCinematicDismissalProbeCommand(dependencies),
      }),
      "Civ7 cinematic dismissal probe",
    );
    iterations += 1;
    if (!probe.cinematicPresent) break;
    dismissals.push({ iteration: iterations, title: probe.dismissedTitle });
    if (dismissals.length >= maxDismissals) break;
    // Closing one cinematic mounts the next DisplayQueueManager screen after a beat
    // (~2s settle was reliable live), so wait before probing again.
    await dependencies.sleep(settleMs);
  }

  // Let the last synthetic close settle before the final DOM-clear verification.
  if (dismissals.length > 0) await dependencies.sleep(settleMs);
  const verification = dependencies.parseDrainCheckPayload(
    await dependencies.executeAppUiCommand({
      ...options,
      command: buildCinematicDrainCheckCommand(),
    }),
    "Civ7 cinematic drain check",
  );

  let cameraRestore: Civ7CinematicCameraRestoreResult | null = null;
  if (input.restoreCameraPlot) {
    const camera = dependencies.parseCameraRestorePayload(
      await dependencies.executeAppUiCommand({
        ...options,
        command: buildCinematicCameraRestoreCommand(input.restoreCameraPlot, dependencies),
      }),
      "Civ7 cinematic camera restore",
    );
    cameraRestore = { plot: input.restoreCameraPlot, lookAt: camera.lookAt };
  }

  return {
    host: verification.host,
    port: verification.port,
    state: verification.state,
    dismissals,
    drained: verification.domClearCount === 0,
    iterations,
    domClearCount: verification.domClearCount,
    cameraRestore,
    notes: CIV7_CINEMATIC_DISMISSAL_NOTES,
  };
}

export function buildCinematicDismissalProbeCommand(
  dependencies: Pick<CinematicDismissalDependencies, "jsLiteral">,
): string {
  // Probe + dismiss in a single App UI exec. The synthetic close that worked live is
  // CustomEvent("action-activate", { bubbles: true }) followed by btn.click() when present.
  return `(() => {
    ${probeHelperSource()}
    const dismissCinematicMoment = () => {
      const remainingSelectorCount = () => document.querySelectorAll(${dependencies.jsLiteral(CIV7_CINEMATIC_MOMENT_SELECTOR)}).length;
      const closeButton = document.querySelector(${dependencies.jsLiteral(CIV7_CINEMATIC_CLOSE_BUTTON_SELECTOR)});
      if (!closeButton) {
        return {
          cinematicPresent: false,
          dismissedTitle: null,
          activate: null,
          click: null,
          remainingSelectorCount: remainingSelectorCount(),
        };
      }
      const dismissedTitle = document.querySelector(${dependencies.jsLiteral(CIV7_CINEMATIC_TITLE_SELECTOR)})?.textContent ?? null;
      const activate = probe(() => {
        closeButton.dispatchEvent(new CustomEvent("action-activate", { bubbles: true }));
        return true;
      });
      const click = probe(() => {
        if (typeof closeButton.click !== "function") return false;
        closeButton.click();
        return true;
      });
      return {
        cinematicPresent: true,
        dismissedTitle,
        activate,
        click,
        remainingSelectorCount: remainingSelectorCount(),
      };
    };
    return JSON.stringify(dismissCinematicMoment());
  })()`;
}

export function buildCinematicDrainCheckCommand(): string {
  return `(() => {
    const readCinematicDrainCheck = () => ({
      domClearCount: document.querySelectorAll(${jsLiteral(CIV7_CINEMATIC_MOMENT_SELECTOR)}).length,
    });
    return JSON.stringify(readCinematicDrainCheck());
  })()`;
}

export function buildCinematicCameraRestoreCommand(
  plot: Civ7MapLocation,
  dependencies: Pick<CinematicDismissalDependencies, "jsLiteral">,
): string {
  // Camera.lookAtPlot / Camera.popCamera are App UI globals (live-verified). After a synthetic
  // DOM close the cinematic's dynamic camera may linger; Camera.lookAtPlot is the safe restore
  // primitive (no blind popCamera loops). The InterfaceMode import below is advisory logging
  // only: InterfaceMode is an ES module reachable solely via the shared module registry, the
  // import is async, and its result is observable only via console.log — never in payloads.
  return `(() => {
    ${probeHelperSource()}
    const restoreCinematicCamera = (plot) => {
      const lookAt = probe(() => {
        Camera.lookAtPlot(plot.x, plot.y);
        return true;
      });
      probe(() => {
        import("/core/ui/interface-modes/interface-modes.js")
          .then((m) => console.log("[civ7-direct-control] cinematic camera restore: InterfaceMode " + (m?.InterfaceMode ? "module-available" : "module-missing")))
          .catch((err) => console.log("[civ7-direct-control] cinematic camera restore: InterfaceMode advisory failed: " + String(err)));
        return true;
      });
      return { lookAt };
    };
    return JSON.stringify(restoreCinematicCamera(${dependencies.jsLiteral(plot)}));
  })()`;
}

const defaultCinematicDismissalDependencies: CinematicDismissalDependencies = {
  boundedInteger,
  executeAppUiCommand: executeCiv7AppUiCommand,
  jsLiteral,
  parseProbePayload: (result, label) =>
    jsonPayloadFromCommandResult<Civ7CinematicDismissalProbePayload>(result, label),
  parseDrainCheckPayload: (result, label) =>
    jsonPayloadFromCommandResult<Civ7CinematicDrainCheckPayload>(result, label),
  parseCameraRestorePayload: (result, label) =>
    jsonPayloadFromCommandResult<Civ7CinematicCameraRestorePayload>(result, label),
  sleep,
};
