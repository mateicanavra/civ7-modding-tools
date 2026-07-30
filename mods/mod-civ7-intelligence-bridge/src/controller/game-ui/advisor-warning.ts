import type { Civ7DirectControlErrorShape } from "@civ7/direct-control/error";

import type {
  Civ7ControlOrpcAdvisorWarningViewedCheckResult,
  Civ7ControlOrpcAdvisorWarningViewedSendResult,
  Civ7ControlOrpcComponentId,
  Civ7ControlOrpcDirectControlFacade,
} from "../service-types";

type AdvisorWarningViewedCheckInput = Parameters<
  Civ7ControlOrpcDirectControlFacade["checkCiv7AdvisorWarningViewed"]
>[0];
type AdvisorWarningViewedSendInput = Parameters<
  Civ7ControlOrpcDirectControlFacade["sendCiv7AdvisorWarningViewed"]
>[0];
type AdvisorWarningViewedSnapshot = Civ7ControlOrpcAdvisorWarningViewedCheckResult["snapshot"];
type AdvisorWarningViewedValidation = Civ7ControlOrpcAdvisorWarningViewedSendResult["validation"];
type RuntimeProbe<T> = Readonly<{ ok: true; value: T } | { ok: false; error: string }>;

export type Civ7GameUiAdvisorWarningTarget = Readonly<{
  GameContext?: {
    localPlayerID?: unknown;
  };
  Game?: {
    Notifications?: {
      find?: (id: Civ7ControlOrpcComponentId) => unknown;
      getType?: (id: Civ7ControlOrpcComponentId) => unknown;
      getTypeName?: (type: unknown) => unknown;
      getIdsForPlayer?: (playerId: number) => unknown;
    };
    PlayerOperations?: {
      canStart?: (
        playerId: number,
        operationType: unknown,
        args: Readonly<{ Target: Civ7ControlOrpcComponentId }>,
        queue?: boolean
      ) => unknown;
      sendRequest?: (
        playerId: number,
        operationType: unknown,
        args: Readonly<{ Target: Civ7ControlOrpcComponentId }>
      ) => unknown;
    };
  };
  PlayerOperationTypes?: {
    VIEWED_ADVISOR_WARNING?: unknown;
  };
}>;

/** Reports whether the exact native advisor-warning check APIs are present. */
export function civ7GameUiAdvisorWarningViewedCheckAvailable(
  target: Civ7GameUiAdvisorWarningTarget
): boolean {
  const notifications = target.Game?.Notifications;
  return (
    Number.isInteger(target.GameContext?.localPlayerID) &&
    typeof notifications?.find === "function" &&
    typeof notifications.getType === "function" &&
    typeof notifications.getTypeName === "function" &&
    typeof notifications.getIdsForPlayer === "function" &&
    typeof target.Game?.PlayerOperations?.canStart === "function" &&
    target.PlayerOperationTypes?.VIEWED_ADVISOR_WARNING !== undefined
  );
}

/** Reports whether the exact native advisor-warning send APIs are present. */
export function civ7GameUiAdvisorWarningViewedSendAvailable(
  target: Civ7GameUiAdvisorWarningTarget
): boolean {
  return (
    civ7GameUiAdvisorWarningViewedCheckAvailable(target) &&
    typeof target.Game?.PlayerOperations?.sendRequest === "function"
  );
}

/** Checks VIEWED_ADVISOR_WARNING without mutating UI or notification state. */
export async function checkCiv7GameUiAdvisorWarningViewed(
  input: AdvisorWarningViewedCheckInput,
  target: Civ7GameUiAdvisorWarningTarget = globalThis as Civ7GameUiAdvisorWarningTarget
): Promise<Civ7ControlOrpcAdvisorWarningViewedCheckResult> {
  try {
    const advisorTarget = requireComponentId(input.target, "target");
    const snapshot = readAdvisorWarningSnapshot(advisorTarget, target);
    const validation = checkAdvisorWarning(advisorTarget, snapshot.localPlayerId, target);
    return {
      valid: validation.valid,
      result: validation.result,
      snapshot,
    };
  } catch (cause) {
    throw advisorWarningDispatchError(cause, "not-dispatched");
  }
}

/** Sends VIEWED_ADVISOR_WARNING at most once after its exact snapshot remains unchanged. */
export async function sendCiv7GameUiAdvisorWarningViewed(
  input: AdvisorWarningViewedSendInput,
  target: Civ7GameUiAdvisorWarningTarget = globalThis as Civ7GameUiAdvisorWarningTarget
): Promise<Civ7ControlOrpcAdvisorWarningViewedSendResult> {
  let sendInvoked = false;
  try {
    const advisorTarget = requireComponentId(input.target, "target");
    const before = readAdvisorWarningSnapshot(advisorTarget, target);
    if (!advisorWarningSnapshotMatches(input.expected, before)) {
      throw new Error("Advisor-warning admission evidence changed before dispatch.");
    }

    const validation = checkAdvisorWarning(advisorTarget, before.localPlayerId, target);
    if (!validation.valid) {
      return {
        sent: false,
        validation,
        before,
        after: readAdvisorWarningSnapshot(advisorTarget, target),
      };
    }

    const operations = target.Game?.PlayerOperations;
    const sendRequest = operations?.sendRequest;
    if (typeof sendRequest !== "function") {
      throw new Error("Game.PlayerOperations.sendRequest is unavailable.");
    }
    const operationType = requireAdvisorWarningOperationType(target);
    const args = advisorWarningArgs(advisorTarget);
    sendInvoked = true;
    sendRequest.call(operations, before.localPlayerId, operationType, args);
    return {
      sent: true,
      validation,
      before,
      after: readAdvisorWarningSnapshot(advisorTarget, target),
    };
  } catch (cause) {
    throw advisorWarningDispatchError(cause, sendInvoked ? "dispatched" : "not-dispatched");
  }
}

function checkAdvisorWarning(
  advisorTarget: Civ7ControlOrpcComponentId,
  localPlayerId: number,
  target: Civ7GameUiAdvisorWarningTarget
): AdvisorWarningViewedValidation {
  const operations = requirePlayerOperations(target);
  const rawResult = operations.canStart(
    localPlayerId,
    requireAdvisorWarningOperationType(target),
    advisorWarningArgs(advisorTarget),
    false
  );
  const valid = exactCanStartSuccess(rawResult);
  const result = snapshotJsonResult<AdvisorWarningViewedValidation["result"]>(
    rawResult,
    "Game.PlayerOperations.canStart"
  );
  return valid ? { valid: true, result } : { valid: false, result };
}

function readAdvisorWarningSnapshot(
  advisorTarget: Civ7ControlOrpcComponentId,
  target: Civ7GameUiAdvisorWarningTarget
): AdvisorWarningViewedSnapshot {
  const localPlayerId = requireInteger(
    target.GameContext?.localPlayerID,
    "GameContext.localPlayerID"
  );
  const notifications = requireNotifications(target);
  const find = notifications.find;
  if (typeof find !== "function") {
    throw new Error("Game.Notifications.find is unavailable.");
  }
  const exists = find.call(notifications, advisorTarget) != null;

  return {
    target: snapshotComponentId(advisorTarget),
    localPlayerId,
    exists,
    typeName: readNotificationTypeName(advisorTarget, exists, notifications),
    activeQueue: probe(() =>
      notificationQueueContains(advisorTarget, localPlayerId, notifications)
    ),
  };
}

function readNotificationTypeName(
  advisorTarget: Civ7ControlOrpcComponentId,
  exists: boolean,
  notifications: NonNullable<NonNullable<Civ7GameUiAdvisorWarningTarget["Game"]>["Notifications"]>
): string | null {
  if (!exists) return null;
  const getType = notifications.getType;
  if (typeof getType !== "function") {
    throw new Error("Game.Notifications.getType is unavailable.");
  }
  const getTypeName = notifications.getTypeName;
  if (typeof getTypeName !== "function") {
    throw new Error("Game.Notifications.getTypeName is unavailable.");
  }
  const value = getTypeName.call(notifications, getType.call(notifications, advisorTarget));
  if (value == null) return null;
  if (typeof value !== "string") {
    throw new Error("Game.Notifications.getTypeName returned a non-string value.");
  }
  return value;
}

function notificationQueueContains(
  advisorTarget: Civ7ControlOrpcComponentId,
  localPlayerId: number,
  notifications: NonNullable<NonNullable<Civ7GameUiAdvisorWarningTarget["Game"]>["Notifications"]>
): boolean {
  const getIdsForPlayer = notifications.getIdsForPlayer;
  if (typeof getIdsForPlayer !== "function") {
    throw new Error("Game.Notifications.getIdsForPlayer is unavailable.");
  }
  const ids = getIdsForPlayer.call(notifications, localPlayerId);
  if (!Array.isArray(ids)) {
    throw new Error("Game.Notifications.getIdsForPlayer returned a non-array value.");
  }
  return ids.some((id) => componentIdEqual(id, advisorTarget));
}

function advisorWarningSnapshotMatches(
  expected: AdvisorWarningViewedSnapshot | null | undefined,
  observed: AdvisorWarningViewedSnapshot
): boolean {
  return (
    expected != null &&
    componentIdEqual(expected.target, observed.target) &&
    expected.localPlayerId === observed.localPlayerId &&
    expected.exists === observed.exists &&
    expected.typeName === observed.typeName &&
    matchingReadableProbe(expected.activeQueue, observed.activeQueue)
  );
}

function matchingReadableProbe(
  expected: RuntimeProbe<unknown> | null | undefined,
  observed: RuntimeProbe<unknown>
): boolean {
  return expected?.ok === true && observed.ok && Object.is(expected.value, observed.value);
}

function advisorWarningArgs(
  target: Civ7ControlOrpcComponentId
): Readonly<{ Target: Civ7ControlOrpcComponentId }> {
  return { Target: target };
}

function requireAdvisorWarningOperationType(target: Civ7GameUiAdvisorWarningTarget): unknown {
  const operationType = target.PlayerOperationTypes?.VIEWED_ADVISOR_WARNING;
  if (operationType === undefined) {
    throw new Error("PlayerOperationTypes.VIEWED_ADVISOR_WARNING is unavailable.");
  }
  return operationType;
}

function requirePlayerOperations(target: Civ7GameUiAdvisorWarningTarget): {
  canStart: (
    playerId: number,
    operationType: unknown,
    args: Readonly<{ Target: Civ7ControlOrpcComponentId }>,
    queue?: boolean
  ) => unknown;
} {
  const operations = target.Game?.PlayerOperations;
  const canStart = operations?.canStart;
  if (typeof canStart !== "function") {
    throw new Error("Game.PlayerOperations.canStart is unavailable.");
  }
  return {
    canStart: (playerId, operationType, args, queue) =>
      canStart.call(operations, playerId, operationType, args, queue),
  };
}

function requireNotifications(
  target: Civ7GameUiAdvisorWarningTarget
): NonNullable<NonNullable<Civ7GameUiAdvisorWarningTarget["Game"]>["Notifications"]> {
  const notifications = target.Game?.Notifications;
  if (notifications == null) throw new Error("Game.Notifications is unavailable.");
  return notifications;
}

function exactCanStartSuccess(result: unknown): boolean {
  if (result == null || typeof result !== "object" || Array.isArray(result)) {
    throw new Error("Game.PlayerOperations.canStart returned an unrecognized result.");
  }
  const success = Reflect.get(result, "Success");
  if (typeof success !== "boolean") {
    throw new Error("Game.PlayerOperations.canStart returned a non-boolean Success field.");
  }
  return success;
}

function requireComponentId(value: unknown, label: string): Civ7ControlOrpcComponentId {
  if (value == null || typeof value !== "object") {
    throw new Error(`${label} must be a Civ7 ComponentID object.`);
  }
  const record = value as Readonly<Record<string, unknown>>;
  if (!Number.isInteger(record.owner) || !Number.isInteger(record.id)) {
    throw new Error(`${label} must have integer owner and id fields.`);
  }
  if (record.type !== undefined && !Number.isInteger(record.type)) {
    throw new Error(`${label}.type must be an integer when provided.`);
  }
  return value as Civ7ControlOrpcComponentId;
}

function snapshotComponentId(value: Civ7ControlOrpcComponentId): Civ7ControlOrpcComponentId {
  return value.type === undefined
    ? { owner: value.owner, id: value.id }
    : { owner: value.owner, id: value.id, type: value.type };
}

function componentIdEqual(left: unknown, right: unknown): boolean {
  const leftId = componentIdOrNull(left);
  const rightId = componentIdOrNull(right);
  return (
    leftId != null &&
    rightId != null &&
    leftId.owner === rightId.owner &&
    leftId.id === rightId.id &&
    leftId.type === rightId.type
  );
}

function componentIdOrNull(value: unknown): Civ7ControlOrpcComponentId | null {
  try {
    return requireComponentId(value, "ComponentID");
  } catch {
    return null;
  }
}

function requireInteger(value: unknown, label: string): number {
  if (!Number.isInteger(value)) throw new Error(`${label} is unavailable.`);
  return value as number;
}

function snapshotJsonResult<T>(value: unknown, label: string): T {
  const serialized = JSON.stringify(value);
  if (serialized === undefined) throw new Error(`${label} returned non-JSON evidence.`);
  return JSON.parse(serialized) as T;
}

function advisorWarningDispatchError(
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
