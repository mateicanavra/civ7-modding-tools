import type { Civ7DirectControlErrorShape } from "@civ7/direct-control/error";

import type {
  Civ7ControlOrpcComponentId,
  Civ7ControlOrpcDirectControlFacade,
  Civ7ControlOrpcNotificationDismissalCheckResult,
  Civ7ControlOrpcNotificationDismissalSendResult,
} from "../service-types";

type NotificationDismissalCheckInput = Parameters<
  Civ7ControlOrpcDirectControlFacade["checkCiv7NotificationDismissal"]
>[0];
type NotificationDismissalSendInput = Parameters<
  Civ7ControlOrpcDirectControlFacade["sendCiv7NotificationDismissal"]
>[0];
type NotificationDismissalSnapshot = Civ7ControlOrpcNotificationDismissalCheckResult["snapshot"];
type RuntimeProbe<T> = Readonly<{ ok: true; value: T } | { ok: false; error: string }>;

type Civ7GameUiNotification = Readonly<{
  Dismissed?: unknown;
}>;

export type Civ7GameUiNotificationDismissalTarget = Readonly<{
  GameContext?: {
    localPlayerID?: unknown;
  };
  Game?: {
    Notifications?: {
      find?: (id: Civ7ControlOrpcComponentId) => unknown;
      getType?: (id: Civ7ControlOrpcComponentId) => unknown;
      getTypeName?: (type: unknown) => unknown;
      getIdsForPlayer?: (playerId: number) => unknown;
      canUserDismissNotification?: (id: Civ7ControlOrpcComponentId) => unknown;
      dismiss?: (id: Civ7ControlOrpcComponentId) => unknown;
    };
  };
}>;

/** Reports whether the native notification APIs can supply an exact dismissal check. */
export function civ7GameUiNotificationDismissalCheckAvailable(
  target: Civ7GameUiNotificationDismissalTarget
): boolean {
  const notifications = target.Game?.Notifications;
  return (
    Number.isInteger(target.GameContext?.localPlayerID) &&
    typeof notifications?.find === "function" &&
    typeof notifications.getType === "function" &&
    typeof notifications.getTypeName === "function" &&
    typeof notifications.getIdsForPlayer === "function" &&
    typeof notifications.canUserDismissNotification === "function"
  );
}

/** Reports whether the native notification APIs can send after an exact dismissal check. */
export function civ7GameUiNotificationDismissalSendAvailable(
  target: Civ7GameUiNotificationDismissalTarget
): boolean {
  return (
    civ7GameUiNotificationDismissalCheckAvailable(target) &&
    typeof target.Game?.Notifications?.dismiss === "function"
  );
}

/** Captures native notification dismissal evidence without dispatching. */
export async function checkCiv7GameUiNotificationDismissal(
  input: NotificationDismissalCheckInput,
  target: Civ7GameUiNotificationDismissalTarget = globalThis as Civ7GameUiNotificationDismissalTarget
): Promise<Civ7ControlOrpcNotificationDismissalCheckResult> {
  const notificationId = requireComponentId(input.notificationId, "notificationId");
  return {
    snapshot: readNotificationDismissalSnapshot(notificationId, target),
  };
}

/** Dismisses once after the service-admitted native notification snapshot is unchanged. */
export async function sendCiv7GameUiNotificationDismissal(
  input: NotificationDismissalSendInput,
  target: Civ7GameUiNotificationDismissalTarget = globalThis as Civ7GameUiNotificationDismissalTarget
): Promise<Civ7ControlOrpcNotificationDismissalSendResult> {
  let sendInvoked = false;
  try {
    const notificationId = requireComponentId(
      input.expected?.notificationId,
      "expected.notificationId"
    );
    const before = readNotificationDismissalSnapshot(notificationId, target);
    if (!notificationDismissalSnapshotMatches(input.expected, before)) {
      throw new Error("Notification dismissal admission evidence changed or is unavailable.");
    }
    if (!nativeNotificationDismissalAdmissionHolds(before)) {
      throw new Error("Native notification dismissal admission is not currently satisfied.");
    }

    const notifications = target.Game?.Notifications;
    const dismiss = notifications?.dismiss;
    if (typeof dismiss !== "function") {
      throw new Error("Game.Notifications.dismiss is unavailable.");
    }

    sendInvoked = true;
    dismiss.call(notifications, notificationId);
    return {
      sent: true,
      before,
      after: readNotificationDismissalSnapshot(notificationId, target),
    };
  } catch (cause) {
    throw notificationDismissalDispatchError(cause, sendInvoked ? "dispatched" : "not-dispatched");
  }
}

function readNotificationDismissalSnapshot(
  notificationId: Civ7ControlOrpcComponentId,
  target: Civ7GameUiNotificationDismissalTarget
): NotificationDismissalSnapshot {
  const localPlayerId = requireInteger(
    target.GameContext?.localPlayerID,
    "GameContext.localPlayerID"
  );
  const notifications = requireNotifications(target);
  const find = notifications.find;
  if (typeof find !== "function") {
    throw new Error("Game.Notifications.find is unavailable.");
  }
  const notification = find.call(notifications, notificationId);
  const exists = notification != null;

  return {
    notificationId: { ...notificationId },
    localPlayerId,
    exists,
    typeName: readNotificationTypeName(notificationId, exists, notifications),
    activeQueue: probe(() =>
      notificationQueueContains(notificationId, localPlayerId, notifications)
    ),
    canUserDismiss: probe(() => readCanUserDismiss(notificationId, notifications)),
    dismissed: probe(() => readDismissed(notification)),
  };
}

function readNotificationTypeName(
  notificationId: Civ7ControlOrpcComponentId,
  exists: boolean,
  notifications: NonNullable<
    NonNullable<Civ7GameUiNotificationDismissalTarget["Game"]>["Notifications"]
  >
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
  const value = getTypeName.call(notifications, getType.call(notifications, notificationId));
  if (value == null) return null;
  if (typeof value !== "string") {
    throw new Error("Game.Notifications.getTypeName returned a non-string value.");
  }
  return value;
}

function notificationQueueContains(
  notificationId: Civ7ControlOrpcComponentId,
  localPlayerId: number,
  notifications: NonNullable<
    NonNullable<Civ7GameUiNotificationDismissalTarget["Game"]>["Notifications"]
  >
): boolean {
  const getIdsForPlayer = notifications.getIdsForPlayer;
  if (typeof getIdsForPlayer !== "function") {
    throw new Error("Game.Notifications.getIdsForPlayer is unavailable.");
  }
  const ids = getIdsForPlayer.call(notifications, localPlayerId);
  if (!Array.isArray(ids)) {
    throw new Error("Game.Notifications.getIdsForPlayer returned a non-array value.");
  }
  return ids.some((id) => componentIdEqual(id, notificationId));
}

function readCanUserDismiss(
  notificationId: Civ7ControlOrpcComponentId,
  notifications: NonNullable<
    NonNullable<Civ7GameUiNotificationDismissalTarget["Game"]>["Notifications"]
  >
): boolean {
  const canUserDismissNotification = notifications.canUserDismissNotification;
  if (typeof canUserDismissNotification !== "function") {
    throw new Error("Game.Notifications.canUserDismissNotification is unavailable.");
  }
  const value = canUserDismissNotification.call(notifications, notificationId);
  if (typeof value !== "boolean") {
    throw new Error("Game.Notifications.canUserDismissNotification returned a non-boolean value.");
  }
  return value;
}

function readDismissed(notification: unknown): boolean {
  if (notification == null || typeof notification !== "object") {
    throw new Error("Notification is unavailable.");
  }
  const value = (notification as Civ7GameUiNotification).Dismissed;
  if (typeof value !== "boolean") {
    throw new Error("Notification.Dismissed is unavailable.");
  }
  return value;
}

function notificationDismissalSnapshotMatches(
  expected: NotificationDismissalSnapshot | null | undefined,
  observed: NotificationDismissalSnapshot
): boolean {
  return (
    expected != null &&
    componentIdEqual(expected.notificationId, observed.notificationId) &&
    expected.localPlayerId === observed.localPlayerId &&
    expected.exists === observed.exists &&
    expected.typeName === observed.typeName &&
    matchingReadableProbe(expected.activeQueue, observed.activeQueue) &&
    matchingReadableProbe(expected.canUserDismiss, observed.canUserDismiss)
  );
}

function nativeNotificationDismissalAdmissionHolds(
  snapshot: NotificationDismissalSnapshot
): boolean {
  return (
    snapshot.notificationId.owner === snapshot.localPlayerId &&
    snapshot.exists === true &&
    snapshot.activeQueue.ok &&
    snapshot.activeQueue.value === true &&
    snapshot.canUserDismiss.ok &&
    snapshot.canUserDismiss.value === true
  );
}

function matchingReadableProbe(
  expected: RuntimeProbe<unknown> | null | undefined,
  observed: RuntimeProbe<unknown>
): boolean {
  return expected?.ok === true && observed.ok && Object.is(expected.value, observed.value);
}

function requireNotifications(
  target: Civ7GameUiNotificationDismissalTarget
): NonNullable<NonNullable<Civ7GameUiNotificationDismissalTarget["Game"]>["Notifications"]> {
  const notifications = target.Game?.Notifications;
  if (notifications == null) throw new Error("Game.Notifications is unavailable.");
  return notifications;
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
  return record.type === undefined
    ? { owner: record.owner as number, id: record.id as number }
    : {
        owner: record.owner as number,
        id: record.id as number,
        type: record.type as number,
      };
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

function notificationDismissalDispatchError(
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
