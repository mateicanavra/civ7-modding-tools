import type {
  Civ7ControlOrpcDiplomacyResponseResult,
  Civ7ControlOrpcPlayNotificationViewResult,
} from "./dependencies/direct-control";
import {
  type Civ7GameUiAttentionTarget,
  getCiv7GameUiPlayNotificationView,
} from "./game-ui-attention";
import type { Civ7ControlOrpcComponentId } from "./model/primitives";

type RuntimeProbe<T> = Readonly<{ ok: true; value: T } | { ok: false; error: string }>;
type DiplomacyValidation = Civ7ControlOrpcDiplomacyResponseResult["beforeValidation"];
type DiplomacyPayload = NonNullable<Civ7ControlOrpcDiplomacyResponseResult["payload"]>;

export type Civ7GameUiDiplomacyTarget = Civ7GameUiAttentionTarget &
  Readonly<{
    DiplomacyManager?: {
      currentProjectReactionData?: { actionID?: unknown } | null;
      currentProjectReactionRequest?: { actionID?: unknown } | null;
      selectedActionID?: unknown;
      isShowing?: () => unknown;
      addCurrentDiplomacyProject?: (project: unknown) => unknown;
      closeCurrentDiplomacyProject?: (force?: boolean) => unknown;
      hide?: (force?: boolean) => unknown;
    };
    Game?: Civ7GameUiAttentionTarget["Game"] & {
      Diplomacy?: {
        getResponseDataForUI?: (actionId: number) => unknown;
        getDiplomaticEventData?: (actionId: number) => unknown;
      };
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
    InterfaceMode?: {
      getCurrent?: () => unknown;
    };
    LeaderModelManager?: {
      beginAcknowledgePlayerSequence?: () => unknown;
    };
    PlayerOperationTypes?: {
      RESPOND_DIPLOMATIC_ACTION?: unknown;
    };
  }>;

export function civ7GameUiDiplomacyResponseAvailable(target: Civ7GameUiDiplomacyTarget): boolean {
  return (
    typeof target.Game?.PlayerOperations?.canStart === "function" &&
    typeof target.Game.PlayerOperations.sendRequest === "function" &&
    target.PlayerOperationTypes?.RESPOND_DIPLOMATIC_ACTION !== undefined &&
    typeof target.Game?.Notifications?.activate === "function" &&
    typeof target.Game.Notifications.getIdsForPlayer === "function" &&
    typeof target.Game.Notifications.getType === "function" &&
    typeof target.Game.Notifications.getTypeName === "function" &&
    typeof target.Game.Notifications.find === "function" &&
    typeof target.Game.Notifications.getEndTurnBlockingType === "function" &&
    typeof target.Game.Notifications.findEndTurnBlocking === "function"
  );
}

export async function requestCiv7GameUiDiplomacyResponse(
  input: Readonly<{
    playerId: number;
    actionId: number;
    responseType: number;
    notificationId?: Civ7ControlOrpcComponentId;
  }>,
  target: Civ7GameUiDiplomacyTarget = globalThis as Civ7GameUiDiplomacyTarget
): Promise<Civ7ControlOrpcDiplomacyResponseResult> {
  const playerId =
    typeof target.GameContext?.localPlayerID === "number"
      ? target.GameContext.localPlayerID
      : input.playerId;
  const args = { ID: input.actionId, Type: input.responseType };
  const before = await getCiv7GameUiPlayNotificationView({}, target);
  const beforeDiplomacyState = readDiplomacyState(input.actionId, target);
  const beforeValidation =
    typeof target.GameContext?.localPlayerID === "number"
      ? gameUiDiplomacyValidation(playerId, args, target)
      : gameUiDiplomacyValidationBlocked(
          playerId,
          args,
          "GameContext.localPlayerID is unavailable."
        );

  if (!beforeValidation.valid) {
    return diplomacyResponseResult({
      input,
      playerId,
      before,
      beforeValidation,
      after: before,
      afterValidation: beforeValidation,
      sent: false,
      payload: undefined,
    });
  }

  const discoveredNotification = currentDiplomacyNotification(input, playerId, target);
  const notificationId =
    toComponentId(input.notificationId) ??
    (discoveredNotification.ok ? discoveredNotification.value : null);
  const activationResult = activateDiplomacyNotification(notificationId, input.actionId, target);
  const sendResult = probe(() =>
    target.Game?.PlayerOperations?.sendRequest?.(
      playerId,
      target.PlayerOperationTypes?.RESPOND_DIPLOMATIC_ACTION,
      args
    )
  );
  const sent = sendResult.ok && sendResult.value !== false;
  const uiCloseout = sent
    ? closeDiplomacyUi(target)
    : {
        requested: true,
        acknowledgeStarted: skippedProbe("operation was not sent"),
        closeCurrentDiplomacyProject: skippedProbe("operation was not sent"),
        hide: skippedProbe("operation was not sent"),
      };
  const after = await getCiv7GameUiPlayNotificationView({}, target);
  const afterValidation = gameUiDiplomacyValidation(playerId, args, target);

  return diplomacyResponseResult({
    input,
    playerId,
    before,
    beforeValidation,
    after,
    afterValidation,
    sent,
    payload: {
      localPlayerId: target.GameContext?.localPlayerID ?? playerId,
      playerId,
      actionId: input.actionId,
      responseType: input.responseType,
      args,
      notificationId,
      discoveredNotification,
      activated:
        activationResult.ok === true &&
        (activationResult.value as { activated?: unknown } | null)?.activated === true,
      activationResult,
      canStart: beforeValidation.result,
      sent,
      sendResult,
      uiCloseout,
      diplomacyState: {
        before: beforeDiplomacyState,
        after: readDiplomacyState(input.actionId, target),
      },
      notes: [
        "Game UI diplomacy response uses ambient PlayerOperations validation/send evidence inside the controller context.",
        "Caller playerId is validation input only; sends use GameContext.localPlayerID.",
      ],
    },
  });
}

function diplomacyResponseResult(
  input: Readonly<{
    input: Readonly<{
      actionId: number;
      responseType: number;
      notificationId?: Civ7ControlOrpcComponentId;
    }>;
    playerId: number;
    before: Civ7ControlOrpcPlayNotificationViewResult;
    beforeValidation: DiplomacyValidation;
    after: Civ7ControlOrpcPlayNotificationViewResult;
    afterValidation: DiplomacyValidation;
    sent: boolean;
    payload: DiplomacyPayload | undefined;
  }>
): Civ7ControlOrpcDiplomacyResponseResult {
  const postcondition = diplomacyPostcondition(
    input.input,
    input.sent,
    input.before,
    input.after,
    input.beforeValidation,
    input.afterValidation
  );
  return {
    playerId: input.playerId,
    before: input.before,
    beforeValidation: input.beforeValidation,
    command: input.sent
      ? {
          host: "game-ui",
          port: 0,
          state: { id: "game-ui", name: "Game UI" },
          output: ["game-ui-diplomacy-response-requested"],
        }
      : undefined,
    payload: input.payload,
    after: input.after,
    afterValidation: input.afterValidation,
    sent: input.sent,
    verified:
      postcondition.classification !== "not-sent" &&
      postcondition.classification !== "no-state-change",
    postcondition,
  };
}

function gameUiDiplomacyValidation(
  playerId: number,
  args: Readonly<{ ID: number; Type: number }>,
  target: Civ7GameUiDiplomacyTarget
): DiplomacyValidation {
  const result = probe(() =>
    target.Game?.PlayerOperations?.canStart?.(
      playerId,
      target.PlayerOperationTypes?.RESPOND_DIPLOMATIC_ACTION,
      args,
      false
    )
  );
  return {
    host: "game-ui",
    port: 0,
    state: { id: "game-ui", name: "Game UI" },
    family: "player-operation",
    operationType: "RESPOND_DIPLOMATIC_ACTION",
    enumValue: target.PlayerOperationTypes?.RESPOND_DIPLOMATIC_ACTION,
    target: { playerId },
    args,
    valid: result.ok && successFromCanStart(result.value),
    result,
  };
}

function gameUiDiplomacyValidationBlocked(
  playerId: number,
  args: Readonly<{ ID: number; Type: number }>,
  reason: string
): DiplomacyValidation {
  return {
    host: "game-ui",
    port: 0,
    state: { id: "game-ui", name: "Game UI" },
    family: "player-operation",
    operationType: "RESPOND_DIPLOMATIC_ACTION",
    enumValue: "RESPOND_DIPLOMATIC_ACTION",
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

function diplomacyPostcondition(
  input: Readonly<{
    actionId: number;
  }>,
  sent: boolean,
  before: Civ7ControlOrpcPlayNotificationViewResult,
  after: Civ7ControlOrpcPlayNotificationViewResult,
  beforeValidation: DiplomacyValidation,
  afterValidation: DiplomacyValidation
): Civ7ControlOrpcDiplomacyResponseResult["postcondition"] {
  const classification = classifyDiplomacyPostcondition(
    input,
    sent,
    before,
    after,
    beforeValidation,
    afterValidation
  );
  return {
    classification,
    reason: diplomacyPostconditionReason(classification),
  };
}

function classifyDiplomacyPostcondition(
  input: Readonly<{ actionId: number }>,
  sent: boolean,
  before: Civ7ControlOrpcPlayNotificationViewResult,
  after: Civ7ControlOrpcPlayNotificationViewResult,
  beforeValidation: DiplomacyValidation,
  afterValidation: DiplomacyValidation
): Civ7ControlOrpcDiplomacyResponseResult["postcondition"]["classification"] {
  if (!sent) return "not-sent";
  if (probeValue(after.canEndTurn) === true) return "turn-unblocked";
  const beforeMatch = findDiplomacyResponseNotification(before, input.actionId);
  const afterMatch = findDiplomacyResponseNotification(after, input.actionId);
  if (beforeMatch && !afterMatch) return "diplomacy-blocker-cleared";
  const beforeBlocking = before.blockingNotificationId;
  const afterBlocking = after.blockingNotificationId;
  if (
    beforeBlocking.ok &&
    afterBlocking.ok &&
    beforeBlocking.value != null &&
    afterBlocking.value != null &&
    !componentIdEqual(beforeBlocking.value, afterBlocking.value)
  ) {
    return "blocking-notification-changed";
  }
  if (
    beforeValidation.valid !== afterValidation.valid ||
    stableJson(beforeValidation.result) !== stableJson(afterValidation.result)
  ) {
    return "validation-changed";
  }
  return "no-state-change";
}

function diplomacyPostconditionReason(
  classification: Civ7ControlOrpcDiplomacyResponseResult["postcondition"]["classification"]
): string {
  switch (classification) {
    case "not-sent":
      return "The diplomatic response was not sent, so no postcondition can be verified.";
    case "turn-unblocked":
      return "The response and UI closeout left the turn unblocked.";
    case "diplomacy-blocker-cleared":
      return "The matching diplomatic-response notification is no longer present as a blocking decision.";
    case "blocking-notification-changed":
      return "The end-turn blocking notification changed after the response closeout.";
    case "validation-changed":
      return "The response validator changed after the send, but the notification/turn state did not clearly clear.";
    case "no-state-change":
      return "The response was sent, but notification, turn-blocking, and validator state did not change; use stale-blocker diagnostics instead of repeating blindly.";
  }
}

function currentDiplomacyNotification(
  input: Readonly<{ actionId: number }>,
  playerId: number,
  target: Civ7GameUiDiplomacyTarget
): RuntimeProbe<Civ7ControlOrpcComponentId | null> {
  return probe(() => {
    const blockerType = target.Game?.Notifications?.getEndTurnBlockingType?.(playerId);
    const id = target.Game?.Notifications?.findEndTurnBlocking?.(playerId, blockerType);
    const notificationId = toComponentId(id);
    if (notificationId == null) return null;
    const notification = target.Game?.Notifications?.find?.(notificationId);
    const type =
      target.Game?.Notifications?.getType?.(notificationId) ?? recordValue(notification, "Type");
    const typeName = target.Game?.Notifications?.getTypeName?.(type);
    const notificationTarget = recordValue(notification, "Target");
    const actionMatches = recordValue(notificationTarget, "id") === input.actionId;
    return typeName === "NOTIFICATION_DIPLOMATIC_RESPONSE_REQUIRED" && actionMatches
      ? notificationId
      : null;
  });
}

function activateDiplomacyNotification(
  notificationId: Civ7ControlOrpcComponentId | null,
  actionId: number,
  target: Civ7GameUiDiplomacyTarget
): RuntimeProbe<unknown> {
  if (notificationId == null) {
    return skippedProbe("diplomacy notificationId not found");
  }
  return probe(() => {
    const notification = target.Game?.Notifications?.find?.(notificationId);
    if (notification == null) return { found: false };
    const notificationTarget = recordValue(notification, "Target");
    if (recordValue(notificationTarget, "id") == null) {
      return { found: true, target: notificationTarget, activated: false };
    }
    const manager = target.DiplomacyManager;
    if (manager == null) {
      return {
        found: true,
        target: notificationTarget,
        activated: false,
        reason: "DiplomacyManager unavailable",
      };
    }
    if (
      actionId !== manager.currentProjectReactionData?.actionID &&
      actionId !== manager.currentProjectReactionRequest?.actionID
    ) {
      const project = target.Game?.Diplomacy?.getResponseDataForUI?.(actionId);
      manager.currentProjectReactionData = project as { actionID?: unknown } | null | undefined;
      manager.addCurrentDiplomacyProject?.(project);
    }
    return {
      found: true,
      target: notificationTarget,
      activated: true,
      currentProjectReactionDataActionID: manager.currentProjectReactionData?.actionID ?? null,
      currentProjectReactionRequestActionID:
        manager.currentProjectReactionRequest?.actionID ?? null,
      notificationActivation: target.Game?.Notifications?.activate?.(notificationId),
    };
  });
}

function closeDiplomacyUi(target: Civ7GameUiDiplomacyTarget): DiplomacyPayload["uiCloseout"] {
  return {
    requested: true,
    acknowledgeStarted: probe(
      () => target.LeaderModelManager?.beginAcknowledgePlayerSequence?.() ?? null
    ),
    closeCurrentDiplomacyProject: probe(
      () => target.DiplomacyManager?.closeCurrentDiplomacyProject?.(false) ?? null
    ),
    hide: probe(() => target.DiplomacyManager?.hide?.(false) ?? null),
  };
}

function readDiplomacyState(
  actionId: number,
  target: Civ7GameUiDiplomacyTarget
): DiplomacyPayload["diplomacyState"]["before"] {
  return {
    currentProjectReactionDataActionID:
      target.DiplomacyManager?.currentProjectReactionData?.actionID ?? null,
    currentProjectReactionRequestActionID:
      target.DiplomacyManager?.currentProjectReactionRequest?.actionID ?? null,
    selectedActionID: target.DiplomacyManager?.selectedActionID ?? null,
    isShowing: probe(() => target.DiplomacyManager?.isShowing?.() ?? null),
    interfaceMode: probe(() => target.InterfaceMode?.getCurrent?.() ?? null),
    responseData: probe(() => target.Game?.Diplomacy?.getResponseDataForUI?.(actionId) ?? null),
    eventData: probe(() => target.Game?.Diplomacy?.getDiplomaticEventData?.(actionId) ?? null),
  };
}

function findDiplomacyResponseNotification(
  view: Civ7ControlOrpcPlayNotificationViewResult,
  actionId: number
): Civ7ControlOrpcPlayNotificationViewResult["notifications"][number] | undefined {
  return view.notifications.find((notification) => {
    const typeName = String(notification.typeName ?? "").toUpperCase();
    if (typeName !== "NOTIFICATION_DIPLOMATIC_RESPONSE_REQUIRED") return false;
    return recordValue(notification.target, "id") === actionId;
  });
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

function stableJson(value: unknown): string {
  return JSON.stringify(value, (_key, candidate) => {
    if (candidate == null || typeof candidate !== "object" || Array.isArray(candidate)) {
      return candidate;
    }
    return Object.fromEntries(
      Object.entries(candidate as Record<string, unknown>).sort(([left], [right]) =>
        left.localeCompare(right)
      )
    );
  });
}

function toComponentId(value: unknown): Civ7ControlOrpcComponentId | null {
  if (value == null || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  if (typeof record.owner !== "number" || typeof record.id !== "number") {
    return null;
  }
  return typeof record.type === "number"
    ? { owner: record.owner, id: record.id, type: record.type }
    : { owner: record.owner, id: record.id };
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

function recordValue(value: unknown, key: string): unknown {
  return value != null && typeof value === "object"
    ? (value as Record<string, unknown>)[key]
    : null;
}

function skippedProbe(reason: string): RuntimeProbe<
  Readonly<{
    skipped: true;
    reason: string;
  }>
> {
  return { ok: false, error: reason };
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
