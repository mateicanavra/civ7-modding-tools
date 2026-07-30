import type { Civ7DirectControlErrorShape } from "@civ7/direct-control/error";

import type { Civ7ControlOrpcDirectControlFacade } from "../service-types";

type TurnCompletionCheckInput = Parameters<
  Civ7ControlOrpcDirectControlFacade["checkCiv7TurnCompletion"]
>[0];
type TurnCompletionSendInput = Parameters<
  Civ7ControlOrpcDirectControlFacade["sendCiv7TurnCompletion"]
>[0];
type TurnCompletionCheckResult = Awaited<
  ReturnType<Civ7ControlOrpcDirectControlFacade["checkCiv7TurnCompletion"]>
>;
type TurnCompletionSendResult = Awaited<
  ReturnType<Civ7ControlOrpcDirectControlFacade["sendCiv7TurnCompletion"]>
>;
type TurnCompletionSnapshot = TurnCompletionCheckResult["snapshot"];
type RuntimeProbe<T> = Readonly<{ ok: true; value: T } | { ok: false; error: string }>;

type Civ7ActionPanel = Readonly<{
  canEndTurn?: () => unknown;
  sendEndTurn?: () => unknown;
}>;

export type Civ7GameUiActionPanelTarget = Readonly<{
  document?: {
    querySelector?: (selector: string) => Readonly<{ maybeComponent?: unknown }> | null;
  };
}>;

export type Civ7GameUiTurnCompletionTarget = Civ7GameUiActionPanelTarget &
  Readonly<{
    Game?: {
      turn?: unknown;
    };
    GameContext?: {
      localPlayerID?: unknown;
      hasSentTurnComplete?: () => unknown;
    };
  }>;

/** Reports whether the action panel can expose its native end-turn admission decision. */
export function civ7GameUiActionPanelCanEndTurnAvailable(
  target: Civ7GameUiActionPanelTarget
): boolean {
  try {
    return typeof actionPanel(target)?.canEndTurn === "function";
  } catch {
    return false;
  }
}

/** Reports whether the action panel can supply an exact turn-completion check. */
export function civ7GameUiTurnCompletionCheckAvailable(
  target: Civ7GameUiTurnCompletionTarget
): boolean {
  try {
    return (
      Number.isInteger(target.GameContext?.localPlayerID) &&
      target.Game != null &&
      typeof target.GameContext?.hasSentTurnComplete === "function" &&
      civ7GameUiActionPanelCanEndTurnAvailable(target)
    );
  } catch {
    return false;
  }
}

/** Reports whether the action panel can send turn completion after an exact check. */
export function civ7GameUiTurnCompletionSendAvailable(
  target: Civ7GameUiTurnCompletionTarget
): boolean {
  try {
    return (
      civ7GameUiTurnCompletionCheckAvailable(target) &&
      typeof actionPanel(target)?.sendEndTurn === "function"
    );
  } catch {
    return false;
  }
}

/** Captures the raw native action-panel admission snapshot without dispatching. */
export async function checkCiv7GameUiTurnCompletion(
  _input: TurnCompletionCheckInput,
  target: Civ7GameUiTurnCompletionTarget = globalThis as Civ7GameUiTurnCompletionTarget
): Promise<TurnCompletionCheckResult> {
  return {
    snapshot: readTurnCompletionSnapshot(target),
  };
}

/** Sends through the native action panel after its service-admitted snapshot is unchanged. */
export async function sendCiv7GameUiTurnCompletion(
  input: TurnCompletionSendInput,
  target: Civ7GameUiTurnCompletionTarget = globalThis as Civ7GameUiTurnCompletionTarget
): Promise<TurnCompletionSendResult> {
  let sendInvoked = false;
  try {
    const before = readTurnCompletionSnapshot(target);
    if (!turnCompletionGuardMatches(input.expected, before)) {
      throw new Error("Turn completion admission evidence changed or is unavailable.");
    }
    if (!nativeTurnCompletionAdmissionHolds(before)) {
      throw new Error("Native turn completion admission is not currently satisfied.");
    }

    const panel = requireActionPanel(target);
    const sendEndTurn = panel.sendEndTurn;
    if (typeof sendEndTurn !== "function") {
      throw new Error("The .action-panel component sendEndTurn method is unavailable.");
    }
    sendInvoked = true;
    sendEndTurn.call(panel);
    return {
      sent: true,
      before,
      after: readTurnCompletionSnapshot(target),
    };
  } catch (cause) {
    throw turnCompletionDispatchError(cause, sendInvoked ? "dispatched" : "not-dispatched");
  }
}

/** Reads the action panel's native turn-completion admission decision. */
export function readCiv7GameUiActionPanelCanEndTurn(target: Civ7GameUiActionPanelTarget): boolean {
  const panel = requireActionPanel(target);
  const canEndTurn = panel.canEndTurn;
  if (typeof canEndTurn !== "function") {
    throw new Error("The .action-panel component canEndTurn method is unavailable.");
  }
  const value = canEndTurn.call(panel);
  if (typeof value !== "boolean") {
    throw new Error("The .action-panel component canEndTurn method returned a non-boolean value.");
  }
  return value;
}

function readTurnCompletionSnapshot(
  target: Civ7GameUiTurnCompletionTarget
): TurnCompletionSnapshot {
  return {
    localPlayerId: requireInteger(target.GameContext?.localPlayerID, "GameContext.localPlayerID"),
    turn: probe(() => requireFiniteNumber(target.Game?.turn, "Game.turn")),
    hasSentTurnComplete: probe(() => {
      const hasSentTurnComplete = target.GameContext?.hasSentTurnComplete;
      if (typeof hasSentTurnComplete !== "function") {
        throw new Error("GameContext.hasSentTurnComplete is unavailable.");
      }
      const value = hasSentTurnComplete.call(target.GameContext);
      if (typeof value !== "boolean") {
        throw new Error("GameContext.hasSentTurnComplete returned a non-boolean value.");
      }
      return value;
    }),
    canEndTurn: probe(() => readCiv7GameUiActionPanelCanEndTurn(target)),
  };
}

function actionPanel(target: Civ7GameUiActionPanelTarget): Civ7ActionPanel | null {
  const querySelector = target.document?.querySelector;
  if (typeof querySelector !== "function") {
    throw new Error("document.querySelector is unavailable.");
  }
  const root = querySelector.call(target.document, ".action-panel");
  const component = root?.maybeComponent;
  return component != null && typeof component === "object" ? (component as Civ7ActionPanel) : null;
}

function requireActionPanel(target: Civ7GameUiActionPanelTarget): Civ7ActionPanel {
  const panel = actionPanel(target);
  if (panel == null) {
    throw new Error("The .action-panel component is unavailable.");
  }
  return panel;
}

function turnCompletionGuardMatches(
  expected: TurnCompletionSnapshot,
  observed: TurnCompletionSnapshot
): boolean {
  return (
    expected != null &&
    expected.localPlayerId === observed.localPlayerId &&
    matchingReadableProbe(expected.turn, observed.turn) &&
    matchingReadableProbe(expected.hasSentTurnComplete, observed.hasSentTurnComplete) &&
    matchingReadableProbe(expected.canEndTurn, observed.canEndTurn)
  );
}

function matchingReadableProbe(
  expected: RuntimeProbe<unknown> | null | undefined,
  observed: RuntimeProbe<unknown>
): boolean {
  return expected?.ok === true && observed.ok && Object.is(expected.value, observed.value);
}

function nativeTurnCompletionAdmissionHolds(snapshot: TurnCompletionSnapshot): boolean {
  return (
    snapshot.hasSentTurnComplete.ok &&
    snapshot.hasSentTurnComplete.value === false &&
    snapshot.canEndTurn.ok &&
    snapshot.canEndTurn.value === true
  );
}

function requireInteger(value: unknown, label: string): number {
  if (!Number.isInteger(value)) throw new Error(`${label} must be an integer.`);
  return value as number;
}

function requireFiniteNumber(value: unknown, label: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`${label} must be a finite number.`);
  }
  return value;
}

function turnCompletionDispatchError(
  cause: unknown,
  dispatchStatus: "not-dispatched" | "dispatched"
): Civ7DirectControlErrorShape {
  const message = cause instanceof Error ? cause.message : String(cause);
  const error = new Error(message, { cause }) as Error & {
    name: "Civ7DirectControlError";
  };
  error.name = "Civ7DirectControlError";
  return Object.assign(error, {
    code: "command-failed" as const,
    dispatchStatus,
  });
}

function probe<T>(read: () => T): RuntimeProbe<T> {
  try {
    return { ok: true, value: read() };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
