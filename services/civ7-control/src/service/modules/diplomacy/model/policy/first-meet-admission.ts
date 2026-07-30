import type { Civ7ControlOrpcComponentId } from "#civ7-control-service/model/dto/primitives";
import type {
  Civ7ControlOrpcFirstMeetResponseCheckResult,
  Civ7ControlOrpcFirstMeetResponseSnapshot,
} from "#civ7-control-service/model/ports/direct-control";
import type { Civ7FirstMeetResponseInput } from "../../contract";

export type Civ7FirstMeetBlockerState =
  | Readonly<{ kind: "matching"; id: Civ7ControlOrpcComponentId }>
  | Readonly<{ kind: "clear" }>
  | Readonly<{ kind: "unknown" }>;

/** Admits only native validation paired with the exact local first-meet blocker. */
export function firstMeetResponseAvailable(
  input: Civ7FirstMeetResponseInput,
  check: Civ7ControlOrpcFirstMeetResponseCheckResult
): boolean {
  const snapshot = check.snapshot;
  return (
    check.valid &&
    firstMeetSnapshotMatchesInput(input, snapshot) &&
    firstMeetBlockerState(snapshot, input.metPlayerId).kind === "matching"
  );
}

export function firstMeetSnapshotMatchesInput(
  input: Civ7FirstMeetResponseInput,
  snapshot: Civ7ControlOrpcFirstMeetResponseSnapshot
): boolean {
  return (
    validLocalPlayerId(snapshot.localPlayerId) &&
    snapshot.metPlayerId === input.metPlayerId &&
    snapshot.response === input.response &&
    Number.isInteger(snapshot.responseType) &&
    validBlockerIdentity(snapshot.noneBlockerType)
  );
}

/**
 * Resolves the local blocking slot relative to one met player and, when
 * supplied, the exact pre-send notification identity.
 */
export function firstMeetBlockerState(
  snapshot: Civ7ControlOrpcFirstMeetResponseSnapshot,
  metPlayerId: number,
  expectedId?: Civ7ControlOrpcComponentId
): Civ7FirstMeetBlockerState {
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
    !blockerAndNotificationTypeAgree(snapshot.blocker.value, notification.type)
  ) {
    return { kind: "unknown" };
  }

  if (expectedId !== undefined) {
    const identity = componentIdMatchState(notification.id, expectedId);
    if (identity === "clear") return { kind: "clear" };
    if (identity === "unknown") return { kind: "unknown" };
    if (
      notification.typeName !== "NOTIFICATION_PLAYER_MET" ||
      notification.metPlayerId !== metPlayerId
    ) {
      return { kind: "unknown" };
    }
    return { kind: "matching", id: notification.id };
  }

  if (
    notification.typeName !== "NOTIFICATION_PLAYER_MET" ||
    notification.metPlayerId !== metPlayerId
  ) {
    return { kind: "clear" };
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

function blockerAndNotificationTypeAgree(
  blocker: number | string,
  notificationType: number | string
): boolean {
  return Object.is(blocker, notificationType);
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
