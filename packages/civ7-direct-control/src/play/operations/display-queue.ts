import { Type } from "typebox";

import { Civ7DirectControlError } from "../../direct-control-error.js";
import { jsLiteral } from "../../runtime/command-serialization.js";
import { jsonPayloadFromCommandResult } from "../../session/command-result.js";
import { executeCiv7AppUiCommand } from "../../session/execute.js";
import type {
  Civ7CommandResult,
  Civ7DirectControlOptions,
  Civ7TunerState,
} from "../../session/types.js";
import { sleep } from "../../timing.js";

// Live-verified against a running Civ7 game on 2026-06-11 (fresh session, three runs):
// every popup-like screen (wonder-discovery cinematics, unlock popups, triumph/challenge
// popups, narrative events, diplomacy dialogs, ...) is a request in the official
// DisplayQueueManager — the App UI singleton at
// .civ7/outputs/resources/Base/modules/core/ui/context-manager/display-queue-manager.js.
// Its close paths run each category's registered handler teardown (e.g. the Cinematic
// handler's releaseCinematic() pops the dynamic camera, fog override, and VFX group),
// so DQM state — not DOM emptiness — is the truth source for "closed".
//
// The manager is an ES module, NOT a global: it is only reachable from exec via the
// shared module registry (`import("/core/ui/context-manager/display-queue-manager.js")`).
// That import is async while exec returns synchronously, so the bridge below memoizes
// the manager on `globalThis` in one exec and operates on it in the next.

/** Where the memoized DisplayQueueManager reference lives inside the App UI context. */
export const CIV7_DISPLAY_QUEUE_BRIDGE_GLOBAL = "__civ7DirectControlDqm";

/** Display categories observed live in DisplayQueueManager.registeredHandlers. */
export const CIV7_KNOWN_DISPLAY_CATEGORIES: ReadonlyArray<string> = [
  "ShellDialogBox",
  "GameDialogBox",
  "UnlockPopup",
  "PopupSequencer",
  "SystemMessage",
  "TutorialManager",
  "WatchOutManager",
  "AgeProgressionPopup",
  "Narrative",
  "TechCivicPopup",
  "TrimpuhCompletePopup",
  "DiplomaticResponseUIData",
  "DiplomacyDialog",
  "DiplomacyDeal",
  "EndgameScreen",
  "Cinematic",
  "VictoryAchieved",
];

export const DEFAULT_CIV7_DISPLAY_BRIDGE_ATTEMPTS = 6;
export const CIV7_DISPLAY_BRIDGE_RETRY_MS = 500;

const civ7TunerStateSchema = Type.Object(
  {
    id: Type.String(),
    name: Type.String(),
  },
  { additionalProperties: false }
);

export const Civ7DisplayRequestSchema = Type.Object(
  {
    category: Type.String(),
    id: Type.Union([Type.Number(), Type.Null()]),
  },
  { additionalProperties: false }
);

export type Civ7DisplayRequest = Readonly<{
  category: string;
  id: number | null;
}>;

export const Civ7DisplayQueueSnapshotSchema = Type.Object(
  {
    host: Type.String(),
    port: Type.Number(),
    state: civ7TunerStateSchema,
    active: Type.Array(Civ7DisplayRequestSchema),
    suspended: Type.Array(Civ7DisplayRequestSchema),
    isSuspended: Type.Boolean(),
    handlerCategories: Type.Array(Type.String()),
  },
  { additionalProperties: false }
);

export type Civ7DisplayQueueSnapshot = Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
  active: ReadonlyArray<Civ7DisplayRequest>;
  suspended: ReadonlyArray<Civ7DisplayRequest>;
  isSuspended: boolean;
  handlerCategories: ReadonlyArray<string>;
}>;

export type Civ7CloseDisplaysInput = Readonly<{
  /** Categories to close. Omitted = close every queued/active/suspended request. */
  categories?: ReadonlyArray<string>;
}>;

export const Civ7ClosedDisplaysRowSchema = Type.Object(
  {
    category: Type.String(),
    closed: Type.Integer({ minimum: 1 }),
  },
  { additionalProperties: false }
);

export type Civ7ClosedDisplaysRow = Readonly<{
  category: string;
  closed: number;
}>;

export const Civ7CloseDisplaysResultSchema = Type.Object(
  {
    host: Type.String(),
    port: Type.Number(),
    state: civ7TunerStateSchema,
    closed: Type.Array(Civ7ClosedDisplaysRowSchema),
    closedTotal: Type.Integer({ minimum: 0 }),
    remainingActive: Type.Array(Civ7DisplayRequestSchema),
    remainingSuspended: Type.Array(Civ7DisplayRequestSchema),
  },
  { additionalProperties: false }
);

export type Civ7CloseDisplaysResult = Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
  closed: ReadonlyArray<Civ7ClosedDisplaysRow>;
  closedTotal: number;
  remainingActive: ReadonlyArray<Civ7DisplayRequest>;
  remainingSuspended: ReadonlyArray<Civ7DisplayRequest>;
}>;

export type Civ7DisplayQueueHoldResult = Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
  /** Queue suspension state after the call. */
  isSuspended: boolean;
}>;

export type DisplayQueueDependencies = Readonly<{
  executeAppUiCommand: (
    options: Civ7DirectControlOptions & Readonly<{ command: string }>
  ) => Promise<Civ7CommandResult>;
  jsLiteral: (value: unknown) => string;
  parsePayload: <T>(result: Civ7CommandResult, label: string) => T;
  sleep: (ms: number) => Promise<void>;
}>;

const defaultDisplayQueueDependencies: DisplayQueueDependencies = {
  executeAppUiCommand: executeCiv7AppUiCommand,
  jsLiteral,
  parsePayload: <T>(result: Civ7CommandResult, label: string) =>
    jsonPayloadFromCommandResult(result, label) as T,
  sleep,
};

type BridgePayload = Readonly<{ ready: boolean }>;

/**
 * Memoizes the DisplayQueueManager on `globalThis` inside the App UI context.
 * Safe to call repeatedly; later operations assume the bridge is present.
 */
export async function ensureCiv7DisplayQueueBridge(
  options: Civ7DirectControlOptions = {},
  dependencies: DisplayQueueDependencies = defaultDisplayQueueDependencies
): Promise<void> {
  for (let attempt = 0; attempt < DEFAULT_CIV7_DISPLAY_BRIDGE_ATTEMPTS; attempt += 1) {
    const payload = dependencies.parsePayload<BridgePayload>(
      await dependencies.executeAppUiCommand({
        ...options,
        command: buildDisplayQueueBridgeCommand(),
      }),
      "Civ7 display-queue bridge"
    );
    if (payload.ready) return;
    await dependencies.sleep(CIV7_DISPLAY_BRIDGE_RETRY_MS);
  }
  throw new Civ7DirectControlError(
    "command-failed",
    "Civ7 display-queue bridge never became ready (module-registry import did not resolve)"
  );
}

export async function readCiv7DisplayQueue(
  options: Civ7DirectControlOptions = {},
  dependencies: DisplayQueueDependencies = defaultDisplayQueueDependencies
): Promise<Civ7DisplayQueueSnapshot> {
  await ensureCiv7DisplayQueueBridge(options, dependencies);
  const result = await dependencies.executeAppUiCommand({
    ...options,
    command: buildDisplayQueueReadCommand(),
  });
  const payload = dependencies.parsePayload<
    Omit<Civ7DisplayQueueSnapshot, "host" | "port" | "state">
  >(result, "Civ7 display-queue read");
  return { host: result.host, port: result.port, state: result.state, ...payload };
}

/**
 * Closes queued/active/suspended display requests through the official
 * DisplayQueueManager.closeMatching path, which runs each category handler's
 * real teardown. Returns DQM state as the truth source — no DOM checks.
 */
export async function closeCiv7Displays(
  input: Civ7CloseDisplaysInput = {},
  options: Civ7DirectControlOptions = {},
  dependencies: DisplayQueueDependencies = defaultDisplayQueueDependencies
): Promise<Civ7CloseDisplaysResult> {
  await ensureCiv7DisplayQueueBridge(options, dependencies);
  const result = await dependencies.executeAppUiCommand({
    ...options,
    command: buildCloseDisplaysCommand(input.categories ?? null, dependencies),
  });
  const payload = dependencies.parsePayload<
    Omit<Civ7CloseDisplaysResult, "host" | "port" | "state">
  >(result, "Civ7 display close");
  return { host: result.host, port: result.port, state: result.state, ...payload };
}

/**
 * Suspends the display queue: new requests park in suspendedRequests and never
 * mount. Pair with resumeCiv7DisplayQueue; closeCiv7Displays purges suspended
 * requests too, so suspend → mutate → close → resume shows nothing at all.
 */
export async function suspendCiv7DisplayQueue(
  options: Civ7DirectControlOptions = {},
  dependencies: DisplayQueueDependencies = defaultDisplayQueueDependencies
): Promise<Civ7DisplayQueueHoldResult> {
  await ensureCiv7DisplayQueueBridge(options, dependencies);
  const result = await dependencies.executeAppUiCommand({
    ...options,
    command: buildDisplayQueueHoldCommand("suspend"),
  });
  const payload = dependencies.parsePayload<{ isSuspended: boolean }>(
    result,
    "Civ7 display-queue suspend"
  );
  return {
    host: result.host,
    port: result.port,
    state: result.state,
    isSuspended: payload.isSuspended,
  };
}

export async function resumeCiv7DisplayQueue(
  options: Civ7DirectControlOptions = {},
  dependencies: DisplayQueueDependencies = defaultDisplayQueueDependencies
): Promise<Civ7DisplayQueueHoldResult> {
  await ensureCiv7DisplayQueueBridge(options, dependencies);
  const result = await dependencies.executeAppUiCommand({
    ...options,
    command: buildDisplayQueueHoldCommand("resume"),
  });
  const payload = dependencies.parsePayload<{ isSuspended: boolean }>(
    result,
    "Civ7 display-queue resume"
  );
  return {
    host: result.host,
    port: result.port,
    state: result.state,
    isSuspended: payload.isSuspended,
  };
}

export function buildDisplayQueueBridgeCommand(): string {
  return `(() => {
    const bridged = globalThis[${jsLiteral(CIV7_DISPLAY_QUEUE_BRIDGE_GLOBAL)}];
    if (bridged) return JSON.stringify({ ready: true });
    import("/core/ui/context-manager/display-queue-manager.js")
      .then((m) => { globalThis[${jsLiteral(CIV7_DISPLAY_QUEUE_BRIDGE_GLOBAL)}] = m.DisplayQueueManager ?? m.default; })
      .catch((err) => console.error("[civ7-direct-control] display-queue bridge import failed: " + String(err)));
    return JSON.stringify({ ready: false });
  })()`;
}

// NOTE: DisplayQueueManager.isSuspended is a METHOD (live-verified; treating it
// as a property silently inverted suspend/resume guards once already).
const displayQueueSnapshotSource = `
    const requestRow = (r) => ({ category: String(r.category), id: typeof r.id === "number" ? r.id : null });
    const queueIsSuspended = (dqm) => typeof dqm.isSuspended === "function" ? Boolean(dqm.isSuspended()) : Boolean(dqm._isSuspended);
    const snapshotQueue = (dqm) => ({
      active: dqm.activeDisplays.map(requestRow),
      suspended: (dqm.suspendedRequests ?? []).map(requestRow),
      isSuspended: queueIsSuspended(dqm),
      handlerCategories: dqm.registeredHandlers ? [...dqm.registeredHandlers.keys()] : [],
    });`;

export function buildDisplayQueueReadCommand(): string {
  return `(() => {
    ${displayQueueSnapshotSource}
    const dqm = globalThis[${jsLiteral(CIV7_DISPLAY_QUEUE_BRIDGE_GLOBAL)}];
    return JSON.stringify(snapshotQueue(dqm));
  })()`;
}

export function buildCloseDisplaysCommand(
  categories: ReadonlyArray<string> | null,
  dependencies: Pick<DisplayQueueDependencies, "jsLiteral">
): string {
  return `(() => {
    ${displayQueueSnapshotSource}
    const dqm = globalThis[${jsLiteral(CIV7_DISPLAY_QUEUE_BRIDGE_GLOBAL)}];
    const requested = ${dependencies.jsLiteral(categories)};
    const present = [...new Set([
      ...dqm.activeDisplays.map((r) => String(r.category)),
      ...(dqm.suspendedRequests ?? []).map((r) => String(r.category)),
    ])];
    const targets = requested === null ? present : requested.filter((c) => present.includes(c));
    const closed = [];
    let closedTotal = 0;
    for (const category of targets) {
      const removed = dqm.closeMatching(category);
      if (removed.length > 0) {
        closed.push({ category, closed: removed.length });
        closedTotal += removed.length;
      }
    }
    const after = snapshotQueue(dqm);
    return JSON.stringify({
      closed,
      closedTotal,
      remainingActive: after.active,
      remainingSuspended: after.suspended,
    });
  })()`;
}

export function buildDisplayQueueHoldCommand(action: "suspend" | "resume"): string {
  // suspend()/resume() carry their own internal idempotence guards; the
  // readback below is the verification, not a guess.
  return `(() => {
    ${displayQueueSnapshotSource}
    const dqm = globalThis[${jsLiteral(CIV7_DISPLAY_QUEUE_BRIDGE_GLOBAL)}];
    ${
      action === "suspend"
        ? `if (!queueIsSuspended(dqm)) dqm.suspend();`
        : `if (queueIsSuspended(dqm)) dqm.resume();`
    }
    return JSON.stringify({ isSuspended: queueIsSuspended(dqm) });
  })()`;
}
