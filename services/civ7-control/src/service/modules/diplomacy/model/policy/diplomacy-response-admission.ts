import type { Civ7ControlOrpcComponentId } from "#civ7-control-service/model/dto/primitives";
import type {
  Civ7ControlOrpcDiplomacyResponseCheckResult,
  Civ7ControlOrpcDiplomacyResponseSnapshot,
} from "#civ7-control-service/model/ports/direct-control";
import type { Civ7DiplomacyResponseInput } from "../../contract";

export type Civ7DiplomacyResponseAdmission =
  | Readonly<{ kind: "admitted" }>
  | Readonly<{ kind: "dedicated-war-workflow-required" }>
  | Readonly<{ kind: "not-admitted" }>;

export type Civ7DiplomacyResponseBlockerState =
  | Readonly<{ kind: "matching"; id: Civ7ControlOrpcComponentId }>
  | Readonly<{ kind: "clear" }>
  | Readonly<{ kind: "unknown" }>;

/** Admits one offered ordinary response while refusing Civ7's separate war-confirmation path. */
export function diplomacyResponseAdmission(
  input: Civ7DiplomacyResponseInput,
  check: Civ7ControlOrpcDiplomacyResponseCheckResult
): Civ7DiplomacyResponseAdmission {
  const snapshot = check.snapshot;
  if (!diplomacyResponseSnapshotMatchesInput(input, snapshot)) {
    return { kind: "not-admitted" };
  }
  if (!snapshot.eventActionType.ok) return { kind: "not-admitted" };
  if (
    snapshot.eventActionType.value === snapshot.denounceMilitaryPresenceActionType &&
    input.responseType === snapshot.rejectionResponseType
  ) {
    return { kind: "dedicated-war-workflow-required" };
  }
  if (!check.valid) return { kind: "not-admitted" };
  const blocker = diplomacyResponseBlockerState(snapshot, input.actionId);
  return blocker.kind === "matching" ? { kind: "admitted" } : { kind: "not-admitted" };
}

export function diplomacyResponseSnapshotMatchesInput(
  input: Civ7DiplomacyResponseInput,
  snapshot: Civ7ControlOrpcDiplomacyResponseSnapshot
): boolean {
  return (
    diplomacyResponseSnapshotIdentityMatchesInput(input, snapshot) &&
    snapshot.responseData.ok &&
    snapshot.responseData.value.actionId === input.actionId &&
    snapshot.responseData.value.offeredResponseTypes.includes(input.responseType) &&
    snapshot.eventActionType.ok &&
    Number.isInteger(snapshot.eventActionType.value)
  );
}

export function diplomacyResponseSnapshotIdentityMatchesInput(
  input: Civ7DiplomacyResponseInput,
  snapshot: Civ7ControlOrpcDiplomacyResponseSnapshot
): boolean {
  return (
    validLocalPlayerId(snapshot.localPlayerId) &&
    snapshot.actionId === input.actionId &&
    snapshot.responseType === input.responseType &&
    Number.isInteger(snapshot.denounceMilitaryPresenceActionType) &&
    Number.isInteger(snapshot.rejectionResponseType) &&
    validBlockerIdentity(snapshot.noneBlockerType)
  );
}

/** Resolves the local blocking slot relative to one action and optional pre-send identity. */
export function diplomacyResponseBlockerState(
  snapshot: Civ7ControlOrpcDiplomacyResponseSnapshot,
  actionId: number,
  expectedId?: Civ7ControlOrpcComponentId
): Civ7DiplomacyResponseBlockerState {
  if (!snapshot.blocker.ok || !snapshot.blockingNotification.ok) {
    return { kind: "unknown" };
  }

  const blocker = blockerReadingState(snapshot.blocker.value, snapshot.noneBlockerType);
  const notification = snapshot.blockingNotification.value;
  if (blocker === "unknown") return { kind: "unknown" };
  if (blocker === "clear") {
    return notification === null ? { kind: "clear" } : { kind: "unknown" };
  }
  if (
    notification === null ||
    !validLocalPlayerId(snapshot.localPlayerId) ||
    notification.id.owner !== snapshot.localPlayerId ||
    !Object.is(snapshot.blocker.value, notification.type)
  ) {
    return { kind: "unknown" };
  }

  if (expectedId !== undefined) {
    const identity = componentIdMatchState(notification.id, expectedId);
    const sameResponse =
      notification.typeName === "NOTIFICATION_DIPLOMATIC_RESPONSE_REQUIRED" &&
      notification.actionId === actionId;
    if (sameResponse) return { kind: "matching", id: notification.id };
    if (identity === "clear") return { kind: "clear" };
    return { kind: "unknown" };
  }

  if (
    notification.typeName !== "NOTIFICATION_DIPLOMATIC_RESPONSE_REQUIRED" ||
    notification.actionId !== actionId
  ) {
    return expectedId === undefined ? { kind: "clear" } : { kind: "unknown" };
  }
  return { kind: "matching", id: notification.id };
}

function blockerReadingState(
  value: number | string,
  noneBlockerType: number | string
): "clear" | "live" | "unknown" {
  if (Object.is(value, noneBlockerType)) return "clear";
  if (validBlockerIdentity(value)) return "live";
  return "unknown";
}

function validBlockerIdentity(value: number | string): boolean {
  return Number.isInteger(value) || (typeof value === "string" && value.trim().length > 0);
}

function componentIdMatchState(
  left: Civ7ControlOrpcComponentId,
  right: Civ7ControlOrpcComponentId
): "matching" | "clear" | "unknown" {
  if (left.owner !== right.owner || left.id !== right.id) return "clear";
  if (left.type === undefined && right.type === undefined) return "matching";
  if (left.type === undefined || right.type === undefined) return "unknown";
  return left.type === right.type ? "matching" : "clear";
}

function validLocalPlayerId(playerId: number): boolean {
  return Number.isInteger(playerId) && playerId >= 0;
}
