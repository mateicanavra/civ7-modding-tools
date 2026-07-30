import { type Static, Type } from "typebox";
import { Value } from "typebox/value";

import { Civ7ComponentIdSchema } from "../../civ7-component-id.js";
import {
  Civ7DirectControlError,
  directControlErrorWithDispatchStatus,
} from "../../direct-control-error.js";
import { jsLiteral } from "../../runtime/command-serialization.js";
import { Civ7RuntimeProbeSchema, probeHelperSource } from "../../runtime/probe.js";
import { schemaBodyFromCommandResult } from "../../session/command-result.js";
import { executeCiv7AppUiCommand } from "../../session/execute.js";
import type { Civ7DirectControlOptions } from "../../session/types.js";

export const Civ7NotificationDismissInputSchema = Type.Object(
  {
    notificationId: Civ7ComponentIdSchema,
  },
  { additionalProperties: false }
);
export type Civ7NotificationDismissInput = Readonly<
  Static<typeof Civ7NotificationDismissInputSchema>
>;

export const Civ7NotificationDismissalSnapshotSchema = Type.Object(
  {
    notificationId: Civ7ComponentIdSchema,
    localPlayerId: Type.Integer(),
    exists: Type.Boolean(),
    typeName: Type.Union([Type.String(), Type.Null()]),
    activeQueue: Civ7RuntimeProbeSchema(Type.Boolean()),
    canUserDismiss: Civ7RuntimeProbeSchema(Type.Boolean()),
    dismissed: Civ7RuntimeProbeSchema(Type.Boolean()),
  },
  { additionalProperties: false }
);
export type Civ7NotificationDismissalSnapshot = Readonly<
  Static<typeof Civ7NotificationDismissalSnapshotSchema>
>;

export const Civ7NotificationDismissalCheckResultSchema = Type.Object(
  {
    snapshot: Civ7NotificationDismissalSnapshotSchema,
  },
  { additionalProperties: false }
);
export type Civ7NotificationDismissalCheckResult = Readonly<
  Static<typeof Civ7NotificationDismissalCheckResultSchema>
>;

export const Civ7NotificationDismissalSendInputSchema = Type.Object(
  {
    expected: Civ7NotificationDismissalSnapshotSchema,
  },
  { additionalProperties: false }
);
export type Civ7NotificationDismissalSendInput = Readonly<
  Static<typeof Civ7NotificationDismissalSendInputSchema>
>;

export const Civ7NotificationDismissalSendResultSchema = Type.Object(
  {
    sent: Type.Literal(true),
    before: Civ7NotificationDismissalSnapshotSchema,
    after: Civ7NotificationDismissalSnapshotSchema,
  },
  { additionalProperties: false }
);
export type Civ7NotificationDismissalSendResult = Readonly<
  Static<typeof Civ7NotificationDismissalSendResultSchema>
>;

const Civ7NotificationDismissalSendEnvelopeSchema = Type.Union([
  Type.Object(
    {
      ok: Type.Literal(true),
      value: Civ7NotificationDismissalSendResultSchema,
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      ok: Type.Literal(false),
      gameplayDispatchStatus: Type.Union([
        Type.Literal("not-dispatched"),
        Type.Literal("dispatched"),
      ]),
      error: Type.String({ maxLength: 512 }),
    },
    { additionalProperties: false }
  ),
]);

/** Reads the exact native notification-dismissal evidence for one notification. */
export async function checkCiv7NotificationDismissal(
  input: Civ7NotificationDismissInput,
  options: Civ7DirectControlOptions = {}
): Promise<Civ7NotificationDismissalCheckResult> {
  const command = await executeCiv7AppUiCommand({
    ...options,
    command: buildNotificationDismissalWireCommand("checkNotificationDismissal", input),
  });
  return schemaBodyFromCommandResult(
    command,
    "Civ7 notification dismissal check",
    Civ7NotificationDismissalCheckResultSchema
  );
}

/** Invokes the native notification dismiss once after exact admitted evidence still matches. */
export async function sendCiv7NotificationDismissal(
  input: Civ7NotificationDismissalSendInput,
  options: Civ7DirectControlOptions = {}
): Promise<Civ7NotificationDismissalSendResult> {
  const command = await executeCiv7AppUiCommand({
    ...options,
    command: buildNotificationDismissalWireCommand("sendNotificationDismissal", input),
  });
  const envelope = schemaBodyFromCommandResult(
    command,
    "Civ7 notification dismissal send",
    Civ7NotificationDismissalSendEnvelopeSchema
  );
  if (envelope.ok) return envelope.value;
  throw new Civ7DirectControlError("command-failed", envelope.error, {
    details: command,
    dispatchStatus: envelope.gameplayDispatchStatus,
  });
}

type NotificationDismissalAtom = "checkNotificationDismissal" | "sendNotificationDismissal";

function buildNotificationDismissalWireCommand(
  atom: "checkNotificationDismissal",
  input: Civ7NotificationDismissInput
): string;
function buildNotificationDismissalWireCommand(
  atom: "sendNotificationDismissal",
  input: Civ7NotificationDismissalSendInput
): string;
function buildNotificationDismissalWireCommand(
  atom: NotificationDismissalAtom,
  input: Civ7NotificationDismissInput | Civ7NotificationDismissalSendInput
): string {
  try {
    if (atom === "checkNotificationDismissal") {
      if (!Value.Check(Civ7NotificationDismissInputSchema, input)) {
        throw new TypeError(
          "Notification dismissal check input must contain one valid notificationId."
        );
      }
      return `(() => {
    ${notificationDismissalWireSource()}
    return JSON.stringify(checkNotificationDismissal(${jsLiteral(input)}));
  })()`;
    }
    if (!Value.Check(Civ7NotificationDismissalSendInputSchema, input)) {
      throw new TypeError(
        "Notification dismissal send input must contain one valid expected snapshot."
      );
    }
    return `(() => {
    ${notificationDismissalWireSource()}
    return JSON.stringify(sendNotificationDismissalEnvelope(${jsLiteral(input)}));
  })()`;
  } catch (cause) {
    throw directControlErrorWithDispatchStatus(cause, "not-dispatched");
  }
}

function notificationDismissalWireSource(): string {
  return `${probeHelperSource()}
    const requireNotificationRuntime = () => {
      const localPlayerId = globalThis.GameContext?.localPlayerID;
      if (!Number.isInteger(localPlayerId)) {
        throw new Error("GameContext.localPlayerID is unavailable.");
      }
      const notifications = globalThis.Game?.Notifications;
      if (!notifications || typeof notifications.find !== "function") {
        throw new Error("Game.Notifications.find is unavailable.");
      }
      return { localPlayerId, notifications };
    };
    const notificationIdsMatch = (left, right) =>
      left != null &&
      right != null &&
      left.owner === right.owner &&
      left.id === right.id &&
      (left.type ?? null) === (right.type ?? null);
    const readNotificationTypeName = (notifications, notificationId, exists) => {
      if (!exists) return null;
      if (typeof notifications.getType !== "function") {
        throw new Error("Game.Notifications.getType is unavailable.");
      }
      if (typeof notifications.getTypeName !== "function") {
        throw new Error("Game.Notifications.getTypeName is unavailable.");
      }
      const type = notifications.getType.call(notifications, notificationId);
      const typeName = notifications.getTypeName.call(notifications, type);
      if (typeName == null) return null;
      if (typeof typeName !== "string") {
        throw new Error("Game.Notifications.getTypeName returned a non-string value.");
      }
      return typeName;
    };
    const readNotificationActiveQueue = (notifications, localPlayerId, notificationId) =>
      probe(() => {
        if (typeof notifications.getIdsForPlayer !== "function") {
          throw new Error("Game.Notifications.getIdsForPlayer is unavailable.");
        }
        const ids = notifications.getIdsForPlayer.call(notifications, localPlayerId);
        if (!Array.isArray(ids)) {
          throw new Error("Game.Notifications.getIdsForPlayer returned a non-array value.");
        }
        return ids.some((id) => notificationIdsMatch(id, notificationId));
      });
    const readNotificationCanUserDismiss = (notifications, notificationId) =>
      probe(() => {
        if (typeof notifications.canUserDismissNotification !== "function") {
          throw new Error("Game.Notifications.canUserDismissNotification is unavailable.");
        }
        const value = notifications.canUserDismissNotification.call(
          notifications,
          notificationId
        );
        if (typeof value !== "boolean") {
          throw new Error(
            "Game.Notifications.canUserDismissNotification returned a non-boolean value."
          );
        }
        return value;
      });
    const readNotificationDismissed = (notification) =>
      probe(() => {
        if (notification == null) {
          throw new Error("Notification is unavailable.");
        }
        const value = notification.Dismissed;
        if (typeof value !== "boolean") {
          throw new Error("Notification.Dismissed is unavailable.");
        }
        return value;
      });
    const readNotificationDismissalSnapshot = (notificationId) => {
      const runtime = requireNotificationRuntime();
      const notification = runtime.notifications.find.call(
        runtime.notifications,
        notificationId
      );
      const exists = notification != null;
      return {
        notificationId,
        localPlayerId: runtime.localPlayerId,
        exists,
        typeName: readNotificationTypeName(
          runtime.notifications,
          notificationId,
          exists
        ),
        activeQueue: readNotificationActiveQueue(
          runtime.notifications,
          runtime.localPlayerId,
          notificationId
        ),
        canUserDismiss: readNotificationCanUserDismiss(
          runtime.notifications,
          notificationId
        ),
        dismissed: readNotificationDismissed(notification),
      };
    };
    const checkNotificationDismissal = (input) => ({
      snapshot: readNotificationDismissalSnapshot(input.notificationId),
    });
    const matchingReadableProbe = (expected, observed) =>
      expected?.ok === true &&
      observed?.ok === true &&
      Object.is(expected.value, observed.value);
    const notificationDismissalGuardMatches = (expected, observed) =>
      expected &&
      notificationIdsMatch(expected.notificationId, observed.notificationId) &&
      expected.localPlayerId === observed.localPlayerId &&
      expected.exists === observed.exists &&
      expected.typeName === observed.typeName &&
      matchingReadableProbe(expected.activeQueue, observed.activeQueue) &&
      matchingReadableProbe(expected.canUserDismiss, observed.canUserDismiss);
    const nativeNotificationDismissalAdmissionHolds = (snapshot) =>
      snapshot.notificationId.owner === snapshot.localPlayerId &&
      snapshot.exists === true &&
      snapshot.activeQueue.ok === true &&
      snapshot.activeQueue.value === true &&
      snapshot.canUserDismiss.ok === true &&
      snapshot.canUserDismiss.value === true;
    const sendNotificationDismissal = (input, markDismissInvoked) => {
      const before = readNotificationDismissalSnapshot(input.expected.notificationId);
      if (!notificationDismissalGuardMatches(input.expected, before)) {
        throw new Error(
          "Notification dismissal admission evidence changed or is unavailable."
        );
      }
      if (!nativeNotificationDismissalAdmissionHolds(before)) {
        throw new Error(
          "Native notification dismissal admission is not currently satisfied."
        );
      }
      const notifications = globalThis.Game?.Notifications;
      if (typeof notifications?.dismiss !== "function") {
        throw new Error("Game.Notifications.dismiss is unavailable.");
      }
      markDismissInvoked();
      notifications.dismiss.call(notifications, before.notificationId);
      return {
        sent: true,
        before,
        after: readNotificationDismissalSnapshot(before.notificationId),
      };
    };
    const boundedNotificationDismissalError = (error) => {
      let message;
      try {
        message = typeof error?.message === "string" ? error.message : String(error);
      } catch {
        message = "Civ7 notification dismissal send failed.";
      }
      return message.slice(0, 512);
    };
    const sendNotificationDismissalEnvelope = (input) => {
      let dismissInvoked = false;
      try {
        return {
          ok: true,
          value: sendNotificationDismissal(input, () => {
            dismissInvoked = true;
          }),
        };
      } catch (error) {
        return {
          ok: false,
          gameplayDispatchStatus: dismissInvoked ? "dispatched" : "not-dispatched",
          error: boundedNotificationDismissalError(error),
        };
      }
    };`;
}
