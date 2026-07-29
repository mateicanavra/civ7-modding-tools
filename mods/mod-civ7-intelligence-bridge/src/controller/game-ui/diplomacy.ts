import type { Civ7DirectControlErrorShape } from "@civ7/direct-control/error";
import type {
  Civ7DiplomacyResponseCheckResult,
  Civ7DiplomacyResponseInput,
  Civ7DiplomacyResponseSendInput,
  Civ7DiplomacyResponseSendResult,
  Civ7DiplomacyResponseSnapshot,
} from "@civ7/direct-control/play/diplomacy/response";

import type { Civ7ControlOrpcComponentId } from "../service-types";
import type { Civ7GameUiAttentionTarget } from "./attention";
import { readCiv7GameUiActionPanelCanEndTurn } from "./turn-completion";

type RuntimeProbe<T> = Readonly<{ ok: true; value: T } | { ok: false; error: string }>;
type DiplomacyResponseValidation =
  | Extract<Civ7DiplomacyResponseSendResult, { sent: true }>["validation"]
  | Extract<Civ7DiplomacyResponseSendResult, { sent: false }>["validation"];
type DiplomacyResponseData = Extract<
  Civ7DiplomacyResponseSnapshot["responseData"],
  { ok: true }
>["value"];
type DiplomacyBlockingNotification = Exclude<
  Extract<Civ7DiplomacyResponseSnapshot["blockingNotification"], { ok: true }>["value"],
  null
>;

export type Civ7GameUiDiplomacyTarget = Civ7GameUiAttentionTarget &
  Readonly<{
    DiplomacyActionTypes?: {
      DIPLOMACY_ACTION_DENOUNCE_MILITARY_PRESENCE?: unknown;
    };
    DiplomaticResponseTypes?: {
      DIPLOMACY_RESPONSE_REJECT?: unknown;
    };
    EndTurnBlockingTypes?: {
      NONE?: unknown;
    };
    Game?: Civ7GameUiAttentionTarget["Game"] & {
      Diplomacy?: {
        getResponseDataForUI?: (actionId: number) => unknown;
        getDiplomaticEventData?: (actionId: number) => unknown;
      };
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
      RESPOND_DIPLOMATIC_ACTION?: unknown;
    };
  }>;

type DiplomacyNotifications = NonNullable<
  NonNullable<Civ7GameUiDiplomacyTarget["Game"]>["Notifications"]
>;
type DiplomacyOperations = NonNullable<
  NonNullable<Civ7GameUiDiplomacyTarget["Game"]>["PlayerOperations"]
>;

/** Reports whether the controller can check an exact native diplomacy response. */
export function civ7GameUiDiplomacyResponseCheckAvailable(
  target: Civ7GameUiDiplomacyTarget
): boolean {
  return (
    Number.isInteger(target.GameContext?.localPlayerID) &&
    Number.isInteger(target.DiplomacyActionTypes?.DIPLOMACY_ACTION_DENOUNCE_MILITARY_PRESENCE) &&
    Number.isInteger(target.DiplomaticResponseTypes?.DIPLOMACY_RESPONSE_REJECT) &&
    validDiplomacyBlockerType(target.EndTurnBlockingTypes?.NONE) &&
    typeof target.Game?.PlayerOperations?.canStart === "function" &&
    target.PlayerOperationTypes?.RESPOND_DIPLOMATIC_ACTION !== undefined
  );
}

/** Reports whether the controller can send an exact native diplomacy response. */
export function civ7GameUiDiplomacyResponseSendAvailable(
  target: Civ7GameUiDiplomacyTarget
): boolean {
  return (
    civ7GameUiDiplomacyResponseCheckAvailable(target) &&
    typeof target.Game?.PlayerOperations?.sendRequest === "function"
  );
}

/** Checks exact native diplomacy-response admission without mutating game or UI state. */
export async function checkCiv7GameUiDiplomacyResponse(
  input: Civ7DiplomacyResponseInput,
  target: Civ7GameUiDiplomacyTarget = globalThis as Civ7GameUiDiplomacyTarget
): Promise<Civ7DiplomacyResponseCheckResult> {
  try {
    const actionId = requireDiplomacyInteger(input.actionId, "actionId");
    const responseType = requireDiplomacyInteger(input.responseType, "responseType");
    const snapshot = readDiplomacyResponseSnapshot(actionId, responseType, target);
    const runtime = requireDiplomacyOperation(target);
    const validation = checkDiplomacyResponseWith(runtime, snapshot);
    return {
      valid: validation.valid,
      result: validation.result,
      snapshot,
    };
  } catch (cause) {
    throw diplomacyResponseDispatchError(cause, "not-dispatched");
  }
}

/** Sends the exact native diplomacy operation once after its complete snapshot still matches. */
export async function sendCiv7GameUiDiplomacyResponse(
  input: Civ7DiplomacyResponseSendInput,
  target: Civ7GameUiDiplomacyTarget = globalThis as Civ7GameUiDiplomacyTarget
): Promise<Civ7DiplomacyResponseSendResult> {
  let sendInvoked = false;
  try {
    const actionId = requireDiplomacyInteger(input.actionId, "actionId");
    const responseType = requireDiplomacyInteger(input.responseType, "responseType");
    const expected = input.expected;
    const before = readDiplomacyResponseSnapshot(actionId, responseType, target);
    if (!diplomacyResponseSnapshotMatches(expected, before)) {
      throw new Error("Diplomacy response admission evidence changed before dispatch.");
    }

    const runtime = requireDiplomacyOperation(target);
    const localPlayerId = before.localPlayerId;
    const operationType = runtime.operationType;
    const validation = checkDiplomacyResponseWith(runtime, before);
    if (!validation.valid) {
      return {
        sent: false,
        validation,
        before,
        after: before,
      };
    }

    const sendRequest = runtime.operations.sendRequest;
    if (typeof sendRequest !== "function") {
      throw new Error("Game.PlayerOperations.sendRequest is unavailable.");
    }
    const args = diplomacyResponseArgs(before);
    sendInvoked = true;
    Reflect.apply(sendRequest, runtime.operations, [localPlayerId, operationType, args]);
    return {
      sent: true,
      validation,
      before,
      after: readDiplomacyResponseSnapshot(actionId, responseType, target),
    };
  } catch (cause) {
    throw diplomacyResponseDispatchError(cause, sendInvoked ? "dispatched" : "not-dispatched");
  }
}

function readDiplomacyResponseSnapshot(
  actionId: number,
  responseType: number,
  target: Civ7GameUiDiplomacyTarget
): Civ7DiplomacyResponseSnapshot {
  const localPlayerId = requireDiplomacyInteger(
    target.GameContext?.localPlayerID,
    "GameContext.localPlayerID"
  );
  const denounceMilitaryPresenceActionType = requireDiplomacyInteger(
    target.DiplomacyActionTypes?.DIPLOMACY_ACTION_DENOUNCE_MILITARY_PRESENCE,
    "DiplomacyActionTypes.DIPLOMACY_ACTION_DENOUNCE_MILITARY_PRESENCE"
  );
  const rejectionResponseType = requireDiplomacyInteger(
    target.DiplomaticResponseTypes?.DIPLOMACY_RESPONSE_REJECT,
    "DiplomaticResponseTypes.DIPLOMACY_RESPONSE_REJECT"
  );
  const noneBlockerType = requireDiplomacyBlockerType(target.EndTurnBlockingTypes?.NONE);
  const responseData = diplomacyProbe(() => readDiplomacyResponseData(actionId, target));
  const eventActionType = diplomacyProbe(() => readDiplomacyEventActionType(actionId, target));
  const canEndTurn = diplomacyProbe(() => readCiv7GameUiActionPanelCanEndTurn(target));
  const blockingEvidence = readDiplomacyBlockingEvidence(localPlayerId, noneBlockerType, target);

  return {
    localPlayerId,
    actionId,
    responseType,
    denounceMilitaryPresenceActionType,
    rejectionResponseType,
    noneBlockerType,
    responseData,
    eventActionType,
    canEndTurn,
    ...blockingEvidence,
  };
}

function readDiplomacyResponseData(
  actionId: number,
  target: Civ7GameUiDiplomacyTarget
): DiplomacyResponseData {
  const diplomacy = target.Game?.Diplomacy;
  const read = diplomacy?.getResponseDataForUI;
  if (typeof read !== "function") {
    throw new Error("Game.Diplomacy.getResponseDataForUI is unavailable.");
  }
  const data = Reflect.apply(read, diplomacy, [actionId]);
  if (data == null || typeof data !== "object") {
    throw new Error("Game.Diplomacy.getResponseDataForUI returned no response data.");
  }
  const responseList = Reflect.get(data, "responseList");
  if (!Array.isArray(responseList)) {
    throw new Error("Diplomacy responseList is unavailable.");
  }
  const observedActionId = Reflect.get(data, "actionID");
  return {
    actionId: Number.isInteger(observedActionId) ? (observedActionId as number) : null,
    offeredResponseTypes: responseList.map((response, index) =>
      requireDiplomacyInteger(
        response == null || typeof response !== "object"
          ? undefined
          : Reflect.get(response, "responseType"),
        `Diplomacy responseList[${index}]`
      )
    ),
  };
}

function readDiplomacyEventActionType(actionId: number, target: Civ7GameUiDiplomacyTarget): number {
  const diplomacy = target.Game?.Diplomacy;
  const read = diplomacy?.getDiplomaticEventData;
  if (typeof read !== "function") {
    throw new Error("Game.Diplomacy.getDiplomaticEventData is unavailable.");
  }
  const data = Reflect.apply(read, diplomacy, [actionId]);
  return requireDiplomacyInteger(
    data == null || typeof data !== "object" ? undefined : Reflect.get(data, "actionType"),
    "Diplomatic event actionType"
  );
}

function readDiplomacyBlockingEvidence(
  localPlayerId: number,
  noneBlockerType: number | string,
  target: Civ7GameUiDiplomacyTarget
): Pick<Civ7DiplomacyResponseSnapshot, "blocker" | "blockingNotification"> {
  let pairedNotifications: DiplomacyNotifications | undefined;
  const blocker = diplomacyProbe(() => {
    const notifications = target.Game?.Notifications;
    pairedNotifications = notifications;
    const read = notifications?.getEndTurnBlockingType;
    if (typeof read !== "function") {
      throw new Error("Game.Notifications.getEndTurnBlockingType is unavailable.");
    }
    return requireDiplomacyBlockerType(Reflect.apply(read, notifications, [localPlayerId]));
  });
  const blockingNotification: Civ7DiplomacyResponseSnapshot["blockingNotification"] = blocker.ok
    ? diplomacyProbe(() =>
        Object.is(blocker.value, noneBlockerType)
          ? null
          : readDiplomacyBlockingNotification(localPlayerId, blocker.value, pairedNotifications)
      )
    : {
        ok: false,
        error: "Blocking notification is unavailable because the blocker read failed.",
      };
  return { blocker, blockingNotification };
}

function readDiplomacyBlockingNotification(
  localPlayerId: number,
  blockerType: number | string,
  notifications: DiplomacyNotifications | undefined
): DiplomacyBlockingNotification | null {
  if (notifications == null) {
    throw new Error("Game.Notifications is unavailable.");
  }
  const findBlocking = notifications.findEndTurnBlocking;
  if (typeof findBlocking !== "function") {
    throw new Error("Game.Notifications.findEndTurnBlocking is unavailable.");
  }
  const rawId = Reflect.apply(findBlocking, notifications, [localPlayerId, blockerType]);
  if (rawId == null) return null;
  const id = diplomacyComponentId(rawId);
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
  const type = requireDiplomacyBlockerType(Reflect.get(notification, "Type"));
  const getTypeName = notifications.getTypeName;
  if (typeof getTypeName !== "function") {
    throw new Error("Game.Notifications.getTypeName is unavailable.");
  }
  const typeNameValue = Reflect.apply(getTypeName, notifications, [type]);
  const notificationTarget = Reflect.get(notification, "Target");
  const observedActionId =
    notificationTarget == null || typeof notificationTarget !== "object"
      ? undefined
      : Reflect.get(notificationTarget, "id");
  return {
    id,
    type,
    typeName: typeof typeNameValue === "string" ? typeNameValue : null,
    actionId: Number.isInteger(observedActionId) ? (observedActionId as number) : null,
  };
}

function requireDiplomacyOperation(target: Civ7GameUiDiplomacyTarget): Readonly<{
  operations: DiplomacyOperations;
  canStart: (playerId: number, operationType: unknown, args: unknown, queue?: boolean) => unknown;
  operationType: unknown;
}> {
  const operations = target.Game?.PlayerOperations;
  const canStart = operations?.canStart;
  if (operations == null || typeof canStart !== "function") {
    throw new Error("Game.PlayerOperations.canStart is unavailable.");
  }
  const operationType = target.PlayerOperationTypes?.RESPOND_DIPLOMATIC_ACTION;
  if (operationType === undefined) {
    throw new Error("PlayerOperationTypes.RESPOND_DIPLOMATIC_ACTION is unavailable.");
  }
  return {
    operations,
    canStart,
    operationType,
  };
}

function checkDiplomacyResponseWith(
  runtime: ReturnType<typeof requireDiplomacyOperation>,
  snapshot: Civ7DiplomacyResponseSnapshot
): DiplomacyResponseValidation {
  const args = diplomacyResponseArgs(snapshot);
  const rawResult = Reflect.apply(runtime.canStart, runtime.operations, [
    snapshot.localPlayerId,
    runtime.operationType,
    args,
    false,
  ]);
  const valid = exactDiplomacyCanStartSuccess(rawResult);
  const result = snapshotDiplomacyJsonResult(rawResult, "Game.PlayerOperations.canStart");
  return valid ? { valid: true, result } : { valid: false, result };
}

function diplomacyResponseArgs(
  snapshot: Civ7DiplomacyResponseSnapshot
): Readonly<{ ID: number; Type: number }> {
  return {
    ID: snapshot.actionId,
    Type: snapshot.responseType,
  };
}

function exactDiplomacyCanStartSuccess(result: unknown): boolean {
  if (result == null || typeof result !== "object" || Array.isArray(result)) {
    throw new Error("Game.PlayerOperations.canStart returned an unrecognized result.");
  }
  const success = Reflect.get(result, "Success");
  if (typeof success !== "boolean") {
    throw new Error("Game.PlayerOperations.canStart returned a non-boolean Success field.");
  }
  return success;
}

function requireDiplomacyInteger(value: unknown, label: string): number {
  if (!Number.isInteger(value)) throw new Error(`${label} is unavailable.`);
  return value as number;
}

function requireDiplomacyBlockerType(value: unknown): number | string {
  if (Number.isInteger(value)) return value as number;
  if (typeof value === "string" && value.trim().length > 0) return value;
  throw new Error(
    "Game.Notifications.getEndTurnBlockingType returned an unsupported blocker identity."
  );
}

function validDiplomacyBlockerType(value: unknown): boolean {
  return Number.isInteger(value) || (typeof value === "string" && value.trim().length > 0);
}

function diplomacyComponentId(value: unknown): Civ7ControlOrpcComponentId | null {
  if (value == null || (typeof value !== "object" && typeof value !== "function")) return null;
  const owner = diplomacyComponentIdField(value, "owner");
  const id = diplomacyComponentIdField(value, "id");
  if (owner == null || id == null) return null;
  const type = diplomacyComponentIdField(value, "type");
  return type == null ? { owner, id } : { owner, id, type };
}

function diplomacyComponentIdField(value: object, field: "owner" | "id" | "type"): number | null {
  const candidate = Reflect.get(value, field);
  return Number.isInteger(candidate) ? (candidate as number) : null;
}

function snapshotDiplomacyJsonResult(
  value: unknown,
  label: string
): DiplomacyResponseValidation["result"] {
  const serialized = JSON.stringify(value);
  if (serialized === undefined) throw new Error(`${label} returned non-JSON evidence.`);
  return JSON.parse(serialized) as DiplomacyResponseValidation["result"];
}

function diplomacyResponseSnapshotMatches(
  expected: Civ7DiplomacyResponseSnapshot | null | undefined,
  observed: Civ7DiplomacyResponseSnapshot
): boolean {
  return (
    expected != null &&
    expected.localPlayerId === observed.localPlayerId &&
    expected.actionId === observed.actionId &&
    expected.responseType === observed.responseType &&
    expected.denounceMilitaryPresenceActionType === observed.denounceMilitaryPresenceActionType &&
    expected.rejectionResponseType === observed.rejectionResponseType &&
    Object.is(expected.noneBlockerType, observed.noneBlockerType) &&
    diplomacyProbesMatch(expected.responseData, observed.responseData, diplomacyJsonValuesMatch) &&
    diplomacyProbesMatch(expected.eventActionType, observed.eventActionType, Object.is) &&
    diplomacyProbesMatch(expected.canEndTurn, observed.canEndTurn, Object.is) &&
    diplomacyProbesMatch(expected.blocker, observed.blocker, Object.is) &&
    diplomacyProbesMatch(
      expected.blockingNotification,
      observed.blockingNotification,
      diplomacyBlockingNotificationsMatch
    )
  );
}

function diplomacyProbesMatch<T>(
  expected: RuntimeProbe<T> | null | undefined,
  observed: RuntimeProbe<T>,
  valuesMatch: (left: T, right: T) => boolean
): boolean {
  if (expected == null || expected.ok !== observed.ok) return false;
  if (!expected.ok) return !observed.ok && expected.error === observed.error;
  return observed.ok && valuesMatch(expected.value, observed.value);
}

function diplomacyBlockingNotificationsMatch(
  left: DiplomacyBlockingNotification | null,
  right: DiplomacyBlockingNotification | null
): boolean {
  if (left == null || right == null) return left == null && right == null;
  return (
    diplomacyComponentIdsMatch(left.id, right.id) &&
    left.type === right.type &&
    left.typeName === right.typeName &&
    left.actionId === right.actionId
  );
}

function diplomacyComponentIdsMatch(
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

function diplomacyJsonValuesMatch(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

function diplomacyResponseDispatchError(
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

function diplomacyProbe<T>(read: () => T): RuntimeProbe<T> {
  try {
    return { ok: true, value: read() };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
