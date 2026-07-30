import type { Civ7DirectControlErrorShape } from "@civ7/direct-control/error";
import type {
  Civ7FirstMeetResponseCheckResult,
  Civ7FirstMeetResponseInput,
  Civ7FirstMeetResponseSendInput,
  Civ7FirstMeetResponseSendResult,
  Civ7FirstMeetResponseSnapshot,
} from "@civ7/direct-control/play/diplomacy/first-meet-response";

import type { Civ7ControlOrpcComponentId } from "../service-types";
import type { Civ7GameUiAttentionTarget } from "./attention";
import { readCiv7GameUiActionPanelCanEndTurn } from "./turn-completion";

type RuntimeProbe<T> = Readonly<{ ok: true; value: T } | { ok: false; error: string }>;
type FirstMeetResponse = Civ7FirstMeetResponseInput["response"];
type FirstMeetResponseValidation =
  | Extract<Civ7FirstMeetResponseSendResult, { sent: true }>["validation"]
  | Extract<Civ7FirstMeetResponseSendResult, { sent: false }>["validation"];
type FirstMeetBlockingNotification = Exclude<
  Extract<Civ7FirstMeetResponseSnapshot["blockingNotification"], { ok: true }>["value"],
  null
>;

export type Civ7GameUiFirstMeetTarget = Civ7GameUiAttentionTarget &
  Readonly<{
    DiplomacyPlayerFirstMeets?: {
      PLAYER_REALATIONSHIP_FIRSTMEET_FRIENDLY?: unknown;
      PLAYER_REALATIONSHIP_FIRSTMEET_NEUTRAL?: unknown;
      PLAYER_REALATIONSHIP_FIRSTMEET_UNFRIENDLY?: unknown;
    };
    EndTurnBlockingTypes?: {
      NONE?: unknown;
    };
    Game?: Civ7GameUiAttentionTarget["Game"] & {
      PlayerOperations?: {
        canStart?: (
          playerId: number,
          operationType: unknown,
          args: unknown,
          queue?: boolean
        ) => unknown;
        sendRequest?: (playerId: number, operationType: unknown, args: unknown) => unknown;
      };
    };
    PlayerOperationTypes?: {
      RESPOND_DIPLOMATIC_FIRST_MEET?: unknown;
    };
  }>;

type FirstMeetNotifications = NonNullable<
  NonNullable<Civ7GameUiFirstMeetTarget["Game"]>["Notifications"]
>;
type FirstMeetOperations = NonNullable<
  NonNullable<Civ7GameUiFirstMeetTarget["Game"]>["PlayerOperations"]
>;

const firstMeetResponseRuntimeKeys = {
  friendly: "PLAYER_REALATIONSHIP_FIRSTMEET_FRIENDLY",
  neutral: "PLAYER_REALATIONSHIP_FIRSTMEET_NEUTRAL",
  unfriendly: "PLAYER_REALATIONSHIP_FIRSTMEET_UNFRIENDLY",
} as const;

/** Reports whether the controller can check an exact native first-meet response. */
export function civ7GameUiFirstMeetResponseCheckAvailable(
  target: Civ7GameUiFirstMeetTarget
): boolean {
  return (
    Number.isInteger(target.GameContext?.localPlayerID) &&
    Object.values(firstMeetResponseRuntimeKeys).every((key) =>
      Number.isInteger(target.DiplomacyPlayerFirstMeets?.[key])
    ) &&
    validFirstMeetBlockerType(target.EndTurnBlockingTypes?.NONE) &&
    typeof target.Game?.PlayerOperations?.canStart === "function" &&
    target.PlayerOperationTypes?.RESPOND_DIPLOMATIC_FIRST_MEET !== undefined
  );
}

/** Reports whether the controller can send an exact native first-meet response. */
export function civ7GameUiFirstMeetResponseSendAvailable(
  target: Civ7GameUiFirstMeetTarget
): boolean {
  return (
    civ7GameUiFirstMeetResponseCheckAvailable(target) &&
    typeof target.Game?.PlayerOperations?.sendRequest === "function"
  );
}

/** Checks exact native first-meet admission without mutating game or UI state. */
export async function checkCiv7GameUiFirstMeetResponse(
  input: Civ7FirstMeetResponseInput,
  target: Civ7GameUiFirstMeetTarget = globalThis as Civ7GameUiFirstMeetTarget
): Promise<Civ7FirstMeetResponseCheckResult> {
  try {
    const metPlayerId = requireFirstMeetInteger(input.metPlayerId, "metPlayerId");
    const response = requireFirstMeetResponse(input.response);
    const snapshot = readFirstMeetResponseSnapshot(metPlayerId, response, target);
    const runtime = requireFirstMeetOperation(target);
    const validation = checkFirstMeetResponseWith(runtime, snapshot);
    return {
      valid: validation.valid,
      result: validation.result,
      snapshot,
    };
  } catch (cause) {
    throw firstMeetResponseDispatchError(cause, "not-dispatched");
  }
}

/** Sends the exact native first-meet operation once after its complete snapshot still matches. */
export async function sendCiv7GameUiFirstMeetResponse(
  input: Civ7FirstMeetResponseSendInput,
  target: Civ7GameUiFirstMeetTarget = globalThis as Civ7GameUiFirstMeetTarget
): Promise<Civ7FirstMeetResponseSendResult> {
  let sendInvoked = false;
  try {
    const metPlayerId = requireFirstMeetInteger(input.metPlayerId, "metPlayerId");
    const response = requireFirstMeetResponse(input.response);
    const expected = input.expected;
    const before = readFirstMeetResponseSnapshot(metPlayerId, response, target);
    if (!firstMeetResponseSnapshotMatches(expected, before)) {
      throw new Error("First-meet response admission evidence changed before dispatch.");
    }

    const runtime = requireFirstMeetOperation(target);
    const localPlayerId = before.localPlayerId;
    const operationType = runtime.operationType;
    const validation = checkFirstMeetResponseWith(runtime, before);
    if (!validation.valid) {
      return {
        sent: false,
        validation,
        before,
        after: readFirstMeetResponseSnapshot(metPlayerId, response, target),
      };
    }

    const sendRequest = runtime.operations.sendRequest;
    if (typeof sendRequest !== "function") {
      throw new Error("Game.PlayerOperations.sendRequest is unavailable.");
    }
    const args = firstMeetResponseArgs(before);
    sendInvoked = true;
    Reflect.apply(sendRequest, runtime.operations, [localPlayerId, operationType, args]);
    return {
      sent: true,
      validation,
      before,
      after: readFirstMeetResponseSnapshot(metPlayerId, response, target),
    };
  } catch (cause) {
    throw firstMeetResponseDispatchError(cause, sendInvoked ? "dispatched" : "not-dispatched");
  }
}

function readFirstMeetResponseSnapshot(
  metPlayerId: number,
  response: FirstMeetResponse,
  target: Civ7GameUiFirstMeetTarget
): Civ7FirstMeetResponseSnapshot {
  const localPlayerId = requireFirstMeetInteger(
    target.GameContext?.localPlayerID,
    "GameContext.localPlayerID"
  );
  const responseType = resolveFirstMeetResponseType(response, target);
  const noneBlockerType = requireFirstMeetBlockerType(target.EndTurnBlockingTypes?.NONE);
  const canEndTurn = firstMeetProbe(() => readCiv7GameUiActionPanelCanEndTurn(target));
  let pairedNotifications: FirstMeetNotifications | undefined;
  const blocker = firstMeetProbe(() => {
    const notifications = target.Game?.Notifications;
    pairedNotifications = notifications;
    const readBlocker = notifications?.getEndTurnBlockingType;
    if (typeof readBlocker !== "function") {
      throw new Error("Game.Notifications.getEndTurnBlockingType is unavailable.");
    }
    return requireFirstMeetBlockerType(Reflect.apply(readBlocker, notifications, [localPlayerId]));
  });
  const blockingNotification: Civ7FirstMeetResponseSnapshot["blockingNotification"] = blocker.ok
    ? firstMeetProbe(() =>
        Object.is(blocker.value, noneBlockerType)
          ? null
          : readFirstMeetBlockingNotification(localPlayerId, blocker.value, pairedNotifications)
      )
    : {
        ok: false,
        error: "Blocking notification is unavailable because the blocker read failed.",
      };

  return {
    localPlayerId,
    metPlayerId,
    response,
    responseType,
    noneBlockerType,
    canEndTurn,
    blocker,
    blockingNotification,
  };
}

function readFirstMeetBlockingNotification(
  localPlayerId: number,
  blockerType: number | string,
  notifications: FirstMeetNotifications | undefined
): FirstMeetBlockingNotification | null {
  if (notifications == null) {
    throw new Error("Game.Notifications is unavailable.");
  }
  const findBlocking = notifications.findEndTurnBlocking;
  if (typeof findBlocking !== "function") {
    throw new Error("Game.Notifications.findEndTurnBlocking is unavailable.");
  }
  const rawId = Reflect.apply(findBlocking, notifications, [localPlayerId, blockerType]);
  if (rawId == null) return null;
  const id = firstMeetComponentId(rawId);
  if (id == null) {
    throw new Error("Game.Notifications.findEndTurnBlocking returned an invalid ComponentID.");
  }
  const find = notifications.find;
  if (typeof find !== "function") {
    throw new Error("Game.Notifications.find is unavailable.");
  }
  const notification = Reflect.apply(find, notifications, [rawId]);
  if (notification == null || typeof notification !== "object") {
    throw new Error("Game.Notifications.find returned no blocking notification.");
  }
  const type = requireFirstMeetBlockerType(Reflect.get(notification, "Type"));
  const getTypeName = notifications.getTypeName;
  if (typeof getTypeName !== "function") {
    throw new Error("Game.Notifications.getTypeName is unavailable.");
  }
  const typeNameValue = Reflect.apply(getTypeName, notifications, [type]);
  const typeName = typeof typeNameValue === "string" ? typeNameValue : null;
  return {
    id,
    type,
    typeName,
    metPlayerId: firstMeetObservablePlayerId(notification),
  };
}

function resolveFirstMeetResponseType(
  response: FirstMeetResponse,
  target: Civ7GameUiFirstMeetTarget
): number {
  const key = firstMeetResponseRuntimeKeys[response];
  return requireFirstMeetInteger(
    target.DiplomacyPlayerFirstMeets?.[key],
    `DiplomacyPlayerFirstMeets.${key}`
  );
}

function firstMeetResponseArgs(
  snapshot: Civ7FirstMeetResponseSnapshot
): Readonly<{ Player1: number; Player2: number; Type: number }> {
  return {
    Player1: snapshot.localPlayerId,
    Player2: snapshot.metPlayerId,
    Type: snapshot.responseType,
  };
}

function requireFirstMeetOperation(target: Civ7GameUiFirstMeetTarget): Readonly<{
  operations: FirstMeetOperations;
  canStart: (playerId: number, operationType: unknown, args: unknown, queue?: boolean) => unknown;
  operationType: unknown;
}> {
  const operations = target.Game?.PlayerOperations;
  const canStart = operations?.canStart;
  if (operations == null || typeof canStart !== "function") {
    throw new Error("Game.PlayerOperations.canStart is unavailable.");
  }
  const operationType = target.PlayerOperationTypes?.RESPOND_DIPLOMATIC_FIRST_MEET;
  if (operationType === undefined) {
    throw new Error("PlayerOperationTypes.RESPOND_DIPLOMATIC_FIRST_MEET is unavailable.");
  }
  return {
    operations,
    canStart,
    operationType,
  };
}

function checkFirstMeetResponseWith(
  runtime: ReturnType<typeof requireFirstMeetOperation>,
  snapshot: Civ7FirstMeetResponseSnapshot
): FirstMeetResponseValidation {
  const args = firstMeetResponseArgs(snapshot);
  const rawResult = Reflect.apply(runtime.canStart, runtime.operations, [
    snapshot.localPlayerId,
    runtime.operationType,
    args,
    false,
  ]);
  const valid = exactFirstMeetCanStartSuccess(rawResult);
  const result = snapshotFirstMeetJsonResult(rawResult, "Game.PlayerOperations.canStart");
  return valid ? { valid: true, result } : { valid: false, result };
}

function exactFirstMeetCanStartSuccess(result: unknown): boolean {
  if (result == null || typeof result !== "object" || Array.isArray(result)) {
    throw new Error(
      "Game.PlayerOperations.canStart returned unrecognized RESPOND_DIPLOMATIC_FIRST_MEET evidence."
    );
  }
  const success = Reflect.get(result, "Success");
  if (typeof success !== "boolean") {
    throw new Error(
      "Game.PlayerOperations.canStart returned a non-boolean RESPOND_DIPLOMATIC_FIRST_MEET Success field."
    );
  }
  return success;
}

function requireFirstMeetResponse(value: unknown): FirstMeetResponse {
  if (value === "friendly" || value === "neutral" || value === "unfriendly") return value;
  throw new Error("response must be friendly, neutral, or unfriendly.");
}

function requireFirstMeetInteger(value: unknown, label: string): number {
  if (!Number.isInteger(value)) throw new Error(`${label} must be an integer.`);
  return value as number;
}

function requireFirstMeetBlockerType(value: unknown): number | string {
  if (Number.isInteger(value)) return value as number;
  if (typeof value === "string" && value.trim().length > 0) {
    return value;
  }
  throw new Error(
    "Game.Notifications.getEndTurnBlockingType returned an unsupported blocker identity."
  );
}

function validFirstMeetBlockerType(value: unknown): boolean {
  return Number.isInteger(value) || (typeof value === "string" && value.trim().length > 0);
}

function firstMeetObservablePlayerId(notification: unknown): number | null {
  if (notification == null || typeof notification !== "object") return null;
  const value = Reflect.get(notification, "Player");
  if (value == null) return null;
  if (!Number.isInteger(value)) {
    throw new Error("The blocking notification returned a non-integer met-player identity.");
  }
  return value as number;
}

function firstMeetComponentId(value: unknown): Civ7ControlOrpcComponentId | null {
  if (value == null || (typeof value !== "object" && typeof value !== "function")) return null;
  const owner = firstMeetComponentIdField(value, "owner");
  const id = firstMeetComponentIdField(value, "id");
  if (owner == null || id == null) return null;
  const type = firstMeetComponentIdField(value, "type");
  return type == null ? { owner, id } : { owner, id, type };
}

function firstMeetComponentIdField(value: object, field: "owner" | "id" | "type"): number | null {
  const candidate = Reflect.get(value, field);
  return typeof candidate === "number" && Number.isFinite(candidate) ? candidate : null;
}

function snapshotFirstMeetJsonResult(
  value: unknown,
  label: string
): FirstMeetResponseValidation["result"] {
  const serialized = JSON.stringify(value);
  if (serialized === undefined) throw new Error(`${label} returned non-JSON evidence.`);
  return JSON.parse(serialized) as FirstMeetResponseValidation["result"];
}

function firstMeetResponseSnapshotMatches(
  expected: Civ7FirstMeetResponseSnapshot | null | undefined,
  observed: Civ7FirstMeetResponseSnapshot
): boolean {
  return (
    expected != null &&
    expected.localPlayerId === observed.localPlayerId &&
    expected.metPlayerId === observed.metPlayerId &&
    expected.response === observed.response &&
    expected.responseType === observed.responseType &&
    Object.is(expected.noneBlockerType, observed.noneBlockerType) &&
    firstMeetProbesMatch(expected.canEndTurn, observed.canEndTurn, Object.is) &&
    firstMeetProbesMatch(expected.blocker, observed.blocker, Object.is) &&
    firstMeetProbesMatch(
      expected.blockingNotification,
      observed.blockingNotification,
      firstMeetBlockingNotificationsMatch
    )
  );
}

function firstMeetProbesMatch<T>(
  expected: RuntimeProbe<T> | null | undefined,
  observed: RuntimeProbe<T>,
  valuesMatch: (left: T, right: T) => boolean
): boolean {
  if (expected == null || expected.ok !== observed.ok) return false;
  if (!expected.ok) return !observed.ok && expected.error === observed.error;
  return observed.ok && valuesMatch(expected.value, observed.value);
}

function firstMeetBlockingNotificationsMatch(
  left: FirstMeetBlockingNotification | null,
  right: FirstMeetBlockingNotification | null
): boolean {
  if (left == null || right == null) return left == null && right == null;
  return (
    firstMeetComponentIdsMatch(left.id, right.id) &&
    left.type === right.type &&
    left.typeName === right.typeName &&
    left.metPlayerId === right.metPlayerId
  );
}

function firstMeetComponentIdsMatch(
  left: Civ7ControlOrpcComponentId | null | undefined,
  right: Civ7ControlOrpcComponentId | null | undefined
): boolean {
  return (
    left != null &&
    right != null &&
    left.owner === right.owner &&
    left.id === right.id &&
    (left.type ?? null) === (right.type ?? null)
  );
}

function firstMeetResponseDispatchError(
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

function firstMeetProbe<T>(read: () => T): RuntimeProbe<T> {
  try {
    return { ok: true, value: read() };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
