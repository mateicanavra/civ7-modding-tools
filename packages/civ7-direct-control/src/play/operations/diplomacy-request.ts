import {
  diplomacyResponsePostcondition,
  type Civ7DiplomacyResponsePostcondition,
  waitForCiv7DiplomacyResponseAfter,
} from "./diplomacy-postconditions.js";
import type {
  Civ7ActionApproval,
  Civ7OperationValidationResult,
} from "./types.js";

import type { Civ7ComponentId } from "../../civ7-component-id.js";
import type {
  Civ7CommandResult,
  Civ7DirectControlOptions,
} from "../../session/types.js";
import type { Civ7PlayNotificationViewResult } from "../notifications/view.js";

export type Civ7DiplomacyResponseInput = Readonly<{
  playerId: number;
  actionId: number;
  responseType: number;
  notificationId?: Civ7ComponentId;
  activateNotification?: boolean;
  uiCloseout?: boolean;
}>;

export type Civ7DiplomacyResponseCommandPayload = Readonly<{
  localPlayerId: number;
  playerId: number;
  actionId: number;
  responseType: number;
  args: Readonly<{ ID: number; Type: number }>;
  notificationId: Civ7ComponentId | null;
  discoveredNotification: unknown;
  activated: boolean;
  activationResult: unknown;
  canStart: unknown;
  sent: boolean;
  sendResult: unknown;
  uiCloseout: Readonly<{
    requested: boolean;
    acknowledgeStarted: unknown;
    closeCurrentDiplomacyProject: unknown;
    hide: unknown;
  }>;
  diplomacyState: Readonly<{
    before: unknown;
    after: unknown;
  }>;
  notes: ReadonlyArray<string>;
}>;

export type Civ7DiplomacyResponseResult = Readonly<{
  before: Civ7PlayNotificationViewResult;
  beforeValidation: Civ7OperationValidationResult;
  command?: Civ7CommandResult;
  payload?: Civ7DiplomacyResponseCommandPayload;
  after: Civ7PlayNotificationViewResult;
  afterValidation: Civ7OperationValidationResult;
  sent: boolean;
  verified: boolean;
  postcondition: Civ7DiplomacyResponsePostcondition;
}>;

type DiplomacyResponseRequestDependencies = Readonly<{
  assertApproved: (approval: Civ7ActionApproval, action: string) => void;
  validatePlayerId: (playerId: number) => void;
  executeAppUiCommand: (
    options: Civ7DirectControlOptions & Readonly<{ command: string }>,
  ) => Promise<Civ7CommandResult>;
  getPlayNotificationView: (options: Civ7DirectControlOptions) => Promise<Civ7PlayNotificationViewResult>;
  canStartPlayerOperation: (
    input: Readonly<{ playerId: number; operationType: string; args: { ID: number; Type: number } }>,
    options: Civ7DirectControlOptions,
  ) => Promise<Civ7OperationValidationResult>;
  parseDiplomacyPayload: (
    result: Civ7CommandResult,
    label: string,
  ) => Civ7DiplomacyResponseCommandPayload;
  jsLiteral: (value: unknown) => string;
  invalidActionIdError: () => never;
  invalidResponseTypeError: () => never;
}>;

export async function requestCiv7DiplomacyResponse(
  input: Civ7DiplomacyResponseInput,
  options: Civ7DirectControlOptions = {},
  approval: Civ7ActionApproval,
  dependencies: DiplomacyResponseRequestDependencies,
): Promise<Civ7DiplomacyResponseResult> {
  dependencies.assertApproved(approval, "responding to diplomatic action");
  dependencies.validatePlayerId(input.playerId);
  if (!Number.isInteger(input.actionId)) dependencies.invalidActionIdError();
  if (!Number.isInteger(input.responseType)) dependencies.invalidResponseTypeError();

  const before = await dependencies.getPlayNotificationView(options);
  const playerId = before.localPlayerId;
  const operationInput = {
    playerId,
    operationType: "RESPOND_DIPLOMATIC_ACTION",
    args: { ID: input.actionId, Type: input.responseType },
  } as const;
  const beforeValidation = await dependencies.canStartPlayerOperation(operationInput, options);
  if (!beforeValidation.valid) {
    return {
      before,
      beforeValidation,
      after: before,
      afterValidation: beforeValidation,
      sent: false,
      verified: false,
      postcondition: {
        classification: "not-sent",
        reason: "RESPOND_DIPLOMATIC_ACTION did not validate, so no diplomatic response was sent.",
      },
    };
  }

  const command = await dependencies.executeAppUiCommand({
    ...options,
    command: buildDiplomacyResponseCloseoutCommand({ ...input, playerId }, dependencies),
  });
  const payload = dependencies.parseDiplomacyPayload(command, "Civ7 diplomacy response closeout");
  const after = await waitForCiv7DiplomacyResponseAfter(
    input,
    options,
    before,
    beforeValidation,
    dependencies.getPlayNotificationView,
  );
  const afterValidation = await dependencies.canStartPlayerOperation(operationInput, options);
  const postcondition = diplomacyResponsePostcondition(
    input,
    payload.sent === true,
    before,
    after,
    beforeValidation,
    afterValidation,
  );
  return {
    before,
    beforeValidation,
    command,
    payload,
    after,
    afterValidation,
    sent: payload.sent === true,
    verified: postcondition.classification !== "not-sent" && postcondition.classification !== "no-state-change",
    postcondition,
  };
}

export function buildDiplomacyResponseCloseoutCommand(
  input: Civ7DiplomacyResponseInput,
  dependencies: Pick<DiplomacyResponseRequestDependencies, "jsLiteral">,
): string {
  return `(() => {
    ${diplomacyResponseCloseoutSource()}
    return JSON.stringify(sendDiplomacyResponseCloseout(${dependencies.jsLiteral(input)}));
  })()`;
}

export function diplomacyResponseCloseoutSource(): string {
  return `${probeHelperSource()}
    const toComponentId = (value) => {
      if (!value || typeof value !== "object") return null;
      if (typeof value.owner !== "number" || typeof value.id !== "number") return null;
      const out = { owner: value.owner, id: value.id };
      if (typeof value.type === "number") out.type = value.type;
      return out;
    };
    const safeCall = (label, fn) => {
      try {
        return { ok: true, value: fn() };
      } catch (err) {
        return { ok: false, error: label + ": " + String(err) };
      }
    };
    const diplomacyManager = () => typeof DiplomacyManager === "undefined" ? null : DiplomacyManager;
    const interfaceMode = () => typeof InterfaceMode === "undefined" ? null : InterfaceMode;
    const leaderModelManager = () => typeof LeaderModelManager === "undefined" ? null : LeaderModelManager;
    const readDiplomacyState = (input) => ({
      currentProjectReactionDataActionID: diplomacyManager()?.currentProjectReactionData?.actionID ?? null,
      currentProjectReactionRequestActionID: diplomacyManager()?.currentProjectReactionRequest?.actionID ?? null,
      selectedActionID: diplomacyManager()?.selectedActionID ?? null,
      isShowing: safeCall("DiplomacyManager.isShowing", () => diplomacyManager()?.isShowing?.()),
      interfaceMode: safeCall("InterfaceMode.getCurrent", () => interfaceMode()?.getCurrent?.()),
      responseData: safeCall("Game.Diplomacy.getResponseDataForUI", () => Game.Diplomacy.getResponseDataForUI(input.actionId)),
      eventData: safeCall("Game.Diplomacy.getDiplomaticEventData", () => Game.Diplomacy.getDiplomaticEventData(input.actionId)),
    });
    const activateNotification = (notificationId) => {
      if (!notificationId) return { ok: false, skipped: true, reason: "notificationId not provided" };
      return safeCall("activate diplomacy response notification", () => {
        const notification = Game.Notifications.find(notificationId);
        if (!notification) return { found: false };
        if (!notification.Target || notification.Target.id == null) return { found: true, target: notification.Target ?? null, activated: false };
        const manager = diplomacyManager();
        if (!manager) return { found: true, target: notification.Target, activated: false, reason: "DiplomacyManager unavailable" };
        if (notification.Target.id != manager.currentProjectReactionData?.actionID && notification.Target.id != manager.currentProjectReactionRequest?.actionID) {
          manager.currentProjectReactionData = Game.Diplomacy.getResponseDataForUI(notification.Target.id);
          manager.addCurrentDiplomacyProject(manager.currentProjectReactionData);
        }
        return {
          found: true,
          target: notification.Target,
          activated: true,
          currentProjectReactionDataActionID: manager.currentProjectReactionData?.actionID ?? null,
          currentProjectReactionRequestActionID: manager.currentProjectReactionRequest?.actionID ?? null,
        };
      });
    };
    const currentBlockingDiplomacyNotification = (input) => {
      return safeCall("find current blocking diplomatic-response notification", () => {
        const blockerType = Game.Notifications.getEndTurnBlockingType(GameContext.localPlayerID);
        const id = Game.Notifications.findEndTurnBlocking(GameContext.localPlayerID, blockerType);
        const notificationId = toComponentId(id);
        const notification = notificationId ? Game.Notifications.find(notificationId) : null;
        const type = notificationId && typeof Game.Notifications.getType === "function"
          ? Game.Notifications.getType(notificationId)
          : notification?.Type ?? null;
        const typeName = typeof Game.Notifications.getTypeName === "function" ? Game.Notifications.getTypeName(type) : null;
        const actionMatches = notification?.Target?.id === input.actionId;
        return typeName === "NOTIFICATION_DIPLOMATIC_RESPONSE_REQUIRED" && actionMatches ? notificationId : null;
      });
    };
    const sendDiplomacyResponseCloseout = (input) => {
      const localPlayerId = GameContext.localPlayerID;
      const playerId = localPlayerId;
      const args = { ID: input.actionId, Type: input.responseType };
      const discoveredNotification = currentBlockingDiplomacyNotification(input);
      const notificationId = toComponentId(input.notificationId) ?? (discoveredNotification.ok ? discoveredNotification.value : null);
      const before = readDiplomacyState(input);
      const activationResult = input.activateNotification === false ? { ok: false, skipped: true, reason: "activation disabled" } : activateNotification(notificationId);
      const canStart = safeCall("Game.PlayerOperations.canStart", () => Game.PlayerOperations.canStart(
        playerId,
        PlayerOperationTypes.RESPOND_DIPLOMATIC_ACTION,
        args,
        false,
      ));
      let sent = false;
      let sendResult = null;
      if (canStart.ok && (canStart.value?.Success === true || canStart.value?.canStart === true)) {
        sendResult = safeCall("Game.PlayerOperations.sendRequest", () => Game.PlayerOperations.sendRequest(
          playerId,
          PlayerOperationTypes.RESPOND_DIPLOMATIC_ACTION,
          args,
        ));
        sent = sendResult.ok === true;
      }
      const shouldCloseout = input.uiCloseout !== false;
      const acknowledgeStarted = shouldCloseout
        ? safeCall("LeaderModelManager.beginAcknowledgePlayerSequence", () => leaderModelManager()?.beginAcknowledgePlayerSequence?.())
        : { ok: false, skipped: true, reason: "ui closeout disabled" };
      const closeCurrentDiplomacyProject = shouldCloseout
        ? safeCall("DiplomacyManager.closeCurrentDiplomacyProject", () => diplomacyManager()?.closeCurrentDiplomacyProject?.(false))
        : { ok: false, skipped: true, reason: "ui closeout disabled" };
      const hide = shouldCloseout
        ? safeCall("DiplomacyManager.hide", () => diplomacyManager()?.hide?.(false))
        : { ok: false, skipped: true, reason: "ui closeout disabled" };
      return {
        localPlayerId,
        playerId,
        actionId: input.actionId,
        responseType: input.responseType,
        args,
        notificationId,
        discoveredNotification,
        activated: activationResult.ok === true && activationResult.value?.activated === true,
        activationResult,
        canStart,
        sent,
        sendResult,
        uiCloseout: {
          requested: shouldCloseout,
          acknowledgeStarted,
          closeCurrentDiplomacyProject,
          hide,
        },
        diplomacyState: {
          before,
          after: readDiplomacyState(input),
        },
        notes: [
          "This follows the official response-panel path more closely than a raw player-operation send: optional notification activation, RESPOND_DIPLOMATIC_ACTION, leader acknowledgement, and diplomacy UI closeout.",
          "If postcondition remains no-state-change, inspect notification expiry/target state before retrying another response."
        ],
      };
    };`;
}

function probeHelperSource(): string {
  return `const probe = (fn) => {
      try {
        return { ok: true, value: fn() };
      } catch (err) {
        return { ok: false, error: String(err) };
      }
    };`;
}
