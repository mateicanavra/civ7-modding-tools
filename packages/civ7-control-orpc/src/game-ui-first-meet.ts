import type {
  Civ7ControlOrpcFirstMeetResponseResult,
  Civ7ControlOrpcPlayNotificationViewResult,
} from "./dependencies/direct-control";
import {
  type Civ7GameUiAttentionTarget,
  getCiv7GameUiPlayNotificationView,
} from "./game-ui-attention";
import type { Civ7ControlOrpcComponentId } from "./model/primitives";

type FirstMeetValidation = Civ7ControlOrpcFirstMeetResponseResult["beforeValidation"];
type FirstMeetPostcondition = Civ7ControlOrpcFirstMeetResponseResult["postcondition"];
type RuntimeProbe<T> = Readonly<{ ok: true; value: T } | { ok: false; error: string }>;

export type Civ7GameUiFirstMeetTarget = Civ7GameUiAttentionTarget &
  Readonly<{
    Game?: Civ7GameUiAttentionTarget["Game"] & {
      Notifications?: NonNullable<Civ7GameUiAttentionTarget["Game"]>["Notifications"] & {
        activate?: (id: Civ7ControlOrpcComponentId) => unknown;
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
      RESPOND_DIPLOMATIC_FIRST_MEET?: unknown;
    };
  }>;

export function civ7GameUiFirstMeetResponseAvailable(target: Civ7GameUiFirstMeetTarget): boolean {
  return (
    typeof target.Game?.PlayerOperations?.canStart === "function" &&
    typeof target.Game.PlayerOperations.sendRequest === "function" &&
    target.PlayerOperationTypes?.RESPOND_DIPLOMATIC_FIRST_MEET !== undefined &&
    typeof target.GameContext?.localPlayerID === "number" &&
    typeof target.Game?.Notifications?.activate === "function" &&
    typeof target.Game.Notifications.getIdsForPlayer === "function" &&
    typeof target.Game.Notifications.getType === "function" &&
    typeof target.Game.Notifications.getTypeName === "function" &&
    typeof target.Game.Notifications.find === "function" &&
    typeof target.Game.Notifications.getBlocksTurnAdvancement === "function"
  );
}

export async function requestCiv7GameUiFirstMeetResponse(
  input: Readonly<{
    playerId: number;
    metPlayerId: number;
    responseType: number;
  }>,
  target: Civ7GameUiFirstMeetTarget = globalThis as Civ7GameUiFirstMeetTarget
): Promise<Civ7ControlOrpcFirstMeetResponseResult> {
  const args = {
    Player1: input.playerId,
    Player2: input.metPlayerId,
    Type: input.responseType,
  };
  const before = await getCiv7GameUiPlayNotificationView({}, target);
  const beforeValidation =
    input.playerId === target.GameContext?.localPlayerID
      ? gameUiFirstMeetValidation(input.playerId, args, target)
      : gameUiFirstMeetValidationBlocked(
          input.playerId,
          args,
          "GameContext.localPlayerID does not match the requested first-meet player."
        );

  if (!beforeValidation.valid) {
    return firstMeetResponseResult({
      input,
      before,
      beforeValidation,
      after: before,
      afterValidation: beforeValidation,
      sent: false,
    });
  }

  const notificationId = currentFirstMeetNotification(input.metPlayerId, before);
  if (notificationId != null) {
    probe(() => target.Game?.Notifications?.activate?.(notificationId));
  }
  const sendResult = probe(() =>
    target.Game?.PlayerOperations?.sendRequest?.(
      input.playerId,
      target.PlayerOperationTypes?.RESPOND_DIPLOMATIC_FIRST_MEET,
      args
    )
  );
  const sent = sendResult.ok && sendResult.value !== false;
  const after = await getCiv7GameUiPlayNotificationView({}, target);
  const afterValidation = gameUiFirstMeetValidation(input.playerId, args, target);

  return firstMeetResponseResult({
    input,
    before,
    beforeValidation,
    after,
    afterValidation,
    sent,
  });
}

function firstMeetResponseResult(
  input: Readonly<{
    input: Readonly<{
      playerId: number;
      metPlayerId: number;
      responseType: number;
    }>;
    before: Civ7ControlOrpcPlayNotificationViewResult;
    beforeValidation: FirstMeetValidation;
    after: Civ7ControlOrpcPlayNotificationViewResult;
    afterValidation: FirstMeetValidation;
    sent: boolean;
  }>
): Civ7ControlOrpcFirstMeetResponseResult {
  const postcondition = gameUiFirstMeetPostcondition(
    input.sent,
    input.before,
    input.after,
    input.input.metPlayerId
  );
  return {
    playerId: input.input.playerId,
    metPlayerId: input.input.metPlayerId,
    responseType: input.input.responseType,
    before: input.before,
    operation: {
      before: input.beforeValidation,
      ...(input.sent
        ? {
            command: {
              host: "game-ui",
              port: 0,
              state: { id: "game-ui", name: "Game UI" },
              output: ["game-ui-first-meet-response-requested"],
            },
          }
        : {}),
      after: input.afterValidation,
      sent: input.sent,
      verified: firstMeetResponseVerified(postcondition),
    },
    after: input.after,
    beforeValidation: input.beforeValidation,
    afterValidation: input.afterValidation,
    sent: input.sent,
    verified: firstMeetResponseVerified(postcondition),
    postcondition,
  };
}

function gameUiFirstMeetValidation(
  playerId: number,
  args: Readonly<{ Player1: number; Player2: number; Type: number }>,
  target: Civ7GameUiFirstMeetTarget
): FirstMeetValidation {
  const result = probe(() =>
    target.Game?.PlayerOperations?.canStart?.(
      playerId,
      target.PlayerOperationTypes?.RESPOND_DIPLOMATIC_FIRST_MEET,
      args,
      false
    )
  );
  return {
    host: "game-ui",
    port: 0,
    state: { id: "game-ui", name: "Game UI" },
    family: "player-operation",
    operationType: "RESPOND_DIPLOMATIC_FIRST_MEET",
    enumValue: target.PlayerOperationTypes?.RESPOND_DIPLOMATIC_FIRST_MEET,
    target: { playerId },
    args,
    valid: result.ok && successFromCanStart(result.value),
    result,
  };
}

function gameUiFirstMeetValidationBlocked(
  playerId: number,
  args: Readonly<{ Player1: number; Player2: number; Type: number }>,
  reason: string
): FirstMeetValidation {
  return {
    host: "game-ui",
    port: 0,
    state: { id: "game-ui", name: "Game UI" },
    family: "player-operation",
    operationType: "RESPOND_DIPLOMATIC_FIRST_MEET",
    enumValue: "RESPOND_DIPLOMATIC_FIRST_MEET",
    target: { playerId },
    args,
    valid: false,
    result: {
      ok: false,
      reason,
      playerId,
    },
  };
}

function gameUiFirstMeetPostcondition(
  sent: boolean,
  before: Civ7ControlOrpcPlayNotificationViewResult,
  after: Civ7ControlOrpcPlayNotificationViewResult,
  metPlayerId: number
): FirstMeetPostcondition {
  const classification = classifyGameUiFirstMeetPostcondition(sent, before, after, metPlayerId);
  return {
    classification,
    reason: firstMeetResponsePostconditionReason(classification),
  };
}

function classifyGameUiFirstMeetPostcondition(
  sent: boolean,
  before: Civ7ControlOrpcPlayNotificationViewResult,
  after: Civ7ControlOrpcPlayNotificationViewResult,
  metPlayerId: number
): FirstMeetPostcondition["classification"] {
  if (!sent) return "not-sent";
  if (probeValue(after.canEndTurn) === true) return "turn-unblocked";
  const beforeBlocker = findFirstMeetNotification(before, metPlayerId);
  if (!beforeBlocker) return "first-meet-blocker-unmatched";
  const afterBlocker = findFirstMeetNotification(after, metPlayerId);
  if (!afterBlocker) return "first-meet-cleared";
  if (!componentIdEqual(notificationId(beforeBlocker), notificationId(afterBlocker))) {
    return "first-meet-blocker-transitioned";
  }
  return "first-meet-sticky-blocker";
}

function firstMeetResponsePostconditionReason(
  classification: FirstMeetPostcondition["classification"]
): string {
  switch (classification) {
    case "not-sent":
      return "The first-meet response was not sent, so no postcondition can be verified.";
    case "turn-unblocked":
      return "The first-meet response left the turn unblocked.";
    case "first-meet-cleared":
      return "The matching first-meet notification is no longer end-turn-blocking.";
    case "first-meet-blocker-transitioned":
      return "A matching first-meet blocker changed identity after the response but still blocks turn flow.";
    case "first-meet-sticky-blocker":
      return "The first-meet operation returned, but the same first-meet notification still blocks turn flow.";
    case "first-meet-blocker-unmatched":
      return "No matching end-turn-blocking first-meet notification was captured before the send.";
  }
}

function currentFirstMeetNotification(
  metPlayerId: number,
  view: Civ7ControlOrpcPlayNotificationViewResult
): Civ7ControlOrpcComponentId | null {
  return notificationId(findFirstMeetNotification(view, metPlayerId));
}

function findFirstMeetNotification(
  view: Civ7ControlOrpcPlayNotificationViewResult,
  metPlayerId: number
): Civ7ControlOrpcPlayNotificationViewResult["notifications"][number] | undefined {
  return view.notifications.find((notification) => {
    const typeName = String(notification.typeName ?? "").toUpperCase();
    if (notification.isEndTurnBlocking !== true || !typeName.includes("PLAYER_MET")) {
      return false;
    }
    const target = notification.target;
    return (
      recordNumber(target, "owner") === metPlayerId || recordNumber(target, "id") === metPlayerId
    );
  });
}

function firstMeetResponseVerified(postcondition: FirstMeetPostcondition): boolean {
  return (
    postcondition.classification === "turn-unblocked" ||
    postcondition.classification === "first-meet-cleared"
  );
}

function notificationId(
  notification: Civ7ControlOrpcPlayNotificationViewResult["notifications"][number] | undefined
): Civ7ControlOrpcComponentId | null {
  return notification?.id ?? null;
}

function componentIdEqual(
  left: Civ7ControlOrpcComponentId | null | undefined,
  right: Civ7ControlOrpcComponentId | null | undefined
): boolean {
  return (
    left?.owner === right?.owner &&
    left?.id === right?.id &&
    (left?.type ?? null) === (right?.type ?? null)
  );
}

function recordNumber(value: unknown, key: string): number | null {
  if (value == null || typeof value !== "object") return null;
  const candidate = (value as Record<string, unknown>)[key];
  return typeof candidate === "number" ? candidate : null;
}

function successFromCanStart(result: unknown): boolean {
  if (result === true) return true;
  if (result === false || result == null) return false;
  if (typeof result === "object") {
    const record = result as Record<string, unknown>;
    if (record.Success !== undefined) return record.Success === true;
    if (record.success !== undefined) return record.success === true;
    if (record.canStart !== undefined) return record.canStart === true;
  }
  return Boolean(result);
}

function probe<T>(fn: () => T): RuntimeProbe<T> {
  try {
    return { ok: true, value: fn() };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

function probeValue<T>(input: RuntimeProbe<T>): T | undefined {
  return input.ok ? input.value : undefined;
}
