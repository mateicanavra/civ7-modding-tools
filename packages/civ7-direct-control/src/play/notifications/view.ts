import { Type, type Static } from "typebox";

import { Civ7ComponentIdSchema, type Civ7ComponentId } from "../../civ7-component-id.js";
import { jsLiteral } from "../../runtime/command-serialization.js";
import { Civ7RuntimeProbeSchema, probeHelperSource } from "../../runtime/probe.js";

import type { Civ7OperationFamily } from "../operations/types.js";
import type { Civ7RuntimeProbe } from "../../runtime/probe.js";
import type {
  Civ7CommandResult,
  Civ7DirectControlOptions,
  Civ7TunerState,
} from "../../session/types.js";
import { jsonPayloadFromCommandResult } from "../../session/command-result.js";
import { executeCiv7AppUiCommand } from "../../session/execute.js";

const nullableComponentIdSchema = Type.Union([Civ7ComponentIdSchema, Type.Null()]);
const Civ7PlayOperationFamilySchema = Type.Union([
  Type.Literal("unit-operation"),
  Type.Literal("unit-command"),
  Type.Literal("city-operation"),
  Type.Literal("city-command"),
  Type.Literal("player-operation"),
  Type.Literal("app-ui-action"),
]);

export const Civ7PlayNotificationViewInputSchema = Type.Object({
  maxNotifications: Type.Optional(Type.Integer({ minimum: 1, maximum: 100 })),
}, { additionalProperties: false });
export type Civ7PlayNotificationViewInput = Static<typeof Civ7PlayNotificationViewInputSchema>;

export const Civ7PlayDecisionInputSchema = Type.Object({
  name: Type.String(),
  source: Type.String(),
  required: Type.Boolean(),
  note: Type.Optional(Type.String()),
}, { additionalProperties: false });
export type Civ7PlayDecisionInputContract = Static<typeof Civ7PlayDecisionInputSchema>;

export const Civ7PlayDecisionActionSchema = Type.Object({
  label: Type.Optional(Type.String()),
  cli: Type.Optional(Type.String()),
  operationFamily: Type.Optional(Civ7PlayOperationFamilySchema),
  operationType: Type.Optional(Type.String()),
  argsShape: Type.Optional(Type.String()),
  when: Type.Optional(Type.String()),
}, { additionalProperties: false });
export type Civ7PlayDecisionActionContract = Static<typeof Civ7PlayDecisionActionSchema>;

export const Civ7PlayDecisionHintSchema = Type.Object({
  category: Type.String(),
  operationFamily: Type.Optional(Civ7PlayOperationFamilySchema),
  operationType: Type.Optional(Type.String()),
  argsShape: Type.Optional(Type.String()),
  cli: Type.Optional(Type.String()),
  requiredInputs: Type.Array(Civ7PlayDecisionInputSchema),
  commonActions: Type.Array(Civ7PlayDecisionActionSchema),
  confidence: Type.Union([
    Type.Literal("live-proof"),
    Type.Literal("official-ui"),
    Type.Literal("heuristic"),
  ]),
  notes: Type.Array(Type.String()),
}, { additionalProperties: false });
export type Civ7PlayDecisionHintContract = Static<typeof Civ7PlayDecisionHintSchema>;

export const Civ7PlayNotificationSummarySchema = Type.Object({
  id: nullableComponentIdSchema,
  type: Type.Unknown(),
  typeName: Type.Union([Type.String(), Type.Null()]),
  groupType: Type.Unknown(),
  player: Type.Unknown(),
  summary: Type.Union([Type.String(), Type.Null()]),
  message: Type.Union([Type.String(), Type.Null()]),
  target: Type.Unknown(),
  location: Type.Unknown(),
  canUserDismiss: Type.Unknown(),
  expired: Type.Unknown(),
  dismissed: Type.Unknown(),
  isEndTurnBlocking: Type.Boolean(),
  decision: Civ7PlayDecisionHintSchema,
  details: Type.Optional(Type.Unknown()),
}, { additionalProperties: false });
export type Civ7PlayNotificationSummaryContract = Static<typeof Civ7PlayNotificationSummarySchema>;

export const Civ7PlayDecisionQueueItemSchema = Type.Object({
  notificationId: nullableComponentIdSchema,
  isEndTurnBlocking: Type.Boolean(),
  typeName: Type.Union([Type.String(), Type.Null()]),
  summary: Type.Union([Type.String(), Type.Null()]),
  message: Type.Union([Type.String(), Type.Null()]),
  target: Type.Unknown(),
  location: Type.Unknown(),
  player: Type.Unknown(),
  category: Type.String(),
  operationFamily: Type.Optional(Civ7PlayOperationFamilySchema),
  operationType: Type.Optional(Type.String()),
  argsShape: Type.Optional(Type.String()),
  cli: Type.Optional(Type.String()),
  requiredInputs: Type.Array(Civ7PlayDecisionInputSchema),
  commonActions: Type.Array(Civ7PlayDecisionActionSchema),
  notes: Type.Array(Type.String()),
  details: Type.Optional(Type.Unknown()),
}, { additionalProperties: false });
export type Civ7PlayDecisionQueueItemContract = Static<typeof Civ7PlayDecisionQueueItemSchema>;

export const Civ7PlayNotificationViewResultSchema = Type.Object({
  host: Type.String(),
  port: Type.Number(),
  state: Type.Object({
    id: Type.String(),
    name: Type.String(),
  }, { additionalProperties: false }),
  localPlayerId: Type.Number(),
  turn: Civ7RuntimeProbeSchema(Type.Number()),
  turnDate: Civ7RuntimeProbeSchema(Type.String()),
  hasSentTurnComplete: Civ7RuntimeProbeSchema(Type.Boolean()),
  canEndTurn: Civ7RuntimeProbeSchema(Type.Boolean()),
  blocker: Civ7RuntimeProbeSchema(Type.Unknown()),
  blockingNotificationId: Civ7RuntimeProbeSchema(nullableComponentIdSchema),
  selectedUnitId: Civ7RuntimeProbeSchema(nullableComponentIdSchema),
  selectedCityId: Civ7RuntimeProbeSchema(nullableComponentIdSchema),
  firstReadyUnitId: Civ7RuntimeProbeSchema(nullableComponentIdSchema),
  notifications: Type.Array(Civ7PlayNotificationSummarySchema),
  decisions: Type.Array(Civ7PlayDecisionHintSchema),
  hud: Type.Object({
    nextDecision: Type.Union([Civ7PlayDecisionQueueItemSchema, Type.Null()]),
    decisionQueue: Type.Array(Civ7PlayDecisionQueueItemSchema),
  }, { additionalProperties: false }),
  limits: Type.Object({
    maxNotifications: Type.Number(),
    truncated: Type.Boolean(),
  }, { additionalProperties: false }),
}, { additionalProperties: false });
export type Civ7PlayNotificationViewResultContract = Static<typeof Civ7PlayNotificationViewResultSchema>;

export type Civ7PlayDecisionHint = Readonly<{
  category: string;
  operationFamily?: Civ7OperationFamily | "app-ui-action";
  operationType?: string;
  argsShape?: string;
  cli?: string;
  requiredInputs: ReadonlyArray<Civ7PlayDecisionInput>;
  commonActions: ReadonlyArray<Civ7PlayDecisionAction>;
  confidence: "live-proof" | "official-ui" | "heuristic";
  notes: ReadonlyArray<string>;
}>;

export type Civ7PlayDecisionInput = Readonly<{
  name: string;
  source: string;
  required: boolean;
  note?: string;
}>;

export type Civ7PlayDecisionAction = Readonly<{
  label: string;
  cli?: string;
  operationFamily?: Civ7OperationFamily | "app-ui-action";
  operationType?: string;
  argsShape?: string;
  when: string;
}>;

export type Civ7PlayNotificationSummary = Readonly<{
  id: Civ7ComponentId | null;
  type: unknown;
  typeName: string | null;
  groupType: unknown;
  player: unknown;
  summary: string | null;
  message: string | null;
  target: unknown;
  location: unknown;
  canUserDismiss: unknown;
  expired: unknown;
  dismissed: unknown;
  isEndTurnBlocking: boolean;
  decision: Civ7PlayDecisionHint;
  details?: unknown;
}>;

export type Civ7PlayDecisionQueueItem = Readonly<{
  notificationId: Civ7ComponentId | null;
  isEndTurnBlocking: boolean;
  typeName: string | null;
  summary: string | null;
  message: string | null;
  target: unknown;
  location: unknown;
  player: unknown;
  category: string;
  operationFamily?: Civ7OperationFamily | "app-ui-action";
  operationType?: string;
  argsShape?: string;
  cli?: string;
  requiredInputs: ReadonlyArray<Civ7PlayDecisionInput>;
  commonActions: ReadonlyArray<Civ7PlayDecisionAction>;
  notes: ReadonlyArray<string>;
  details?: unknown;
}>;

export type Civ7PlayNotificationViewResult = Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
  localPlayerId: number;
  turn: Civ7RuntimeProbe<number>;
  turnDate: Civ7RuntimeProbe<string>;
  hasSentTurnComplete: Civ7RuntimeProbe<boolean>;
  canEndTurn: Civ7RuntimeProbe<boolean>;
  blocker: Civ7RuntimeProbe<unknown>;
  blockingNotificationId: Civ7RuntimeProbe<Civ7ComponentId | null>;
  selectedUnitId: Civ7RuntimeProbe<Civ7ComponentId | null>;
  selectedCityId: Civ7RuntimeProbe<Civ7ComponentId | null>;
  firstReadyUnitId: Civ7RuntimeProbe<Civ7ComponentId | null>;
  notifications: ReadonlyArray<Civ7PlayNotificationSummary>;
  decisions: ReadonlyArray<Civ7PlayDecisionHint>;
  hud: Readonly<{
    nextDecision: Civ7PlayDecisionQueueItem | null;
    decisionQueue: ReadonlyArray<Civ7PlayDecisionQueueItem>;
  }>;
  limits: Readonly<{
    maxNotifications: number;
    truncated: boolean;
  }>;
}>;

export type PlayNotificationViewOptions = Civ7DirectControlOptions & Readonly<{
  maxNotifications?: number;
}>;

export type PlayNotificationViewDependencies = Readonly<{
  executeAppUiCommand: (
    options: Civ7DirectControlOptions & Readonly<{ command: string }>,
  ) => Promise<Civ7CommandResult>;
  parsePlayNotificationView: (
    result: Civ7CommandResult,
    label: string,
  ) => Civ7PlayNotificationViewResult;
}>;

export async function getCiv7PlayNotificationView(
  options: PlayNotificationViewOptions = {},
  dependencies: PlayNotificationViewDependencies = defaultPlayNotificationViewDependencies,
): Promise<Civ7PlayNotificationViewResult> {
  const result = await dependencies.executeAppUiCommand({
    ...options,
    command: buildPlayNotificationViewCommand({ maxNotifications: options.maxNotifications }),
  });
  return dependencies.parsePlayNotificationView(result, "Civ7 play notification view");
}

function buildPlayNotificationViewCommand(options: { maxNotifications?: number } = {}): string {
  const maxNotifications = options.maxNotifications ?? 25;
  return `(() => {
    ${playNotificationViewSource()}
    return JSON.stringify(readPlayNotifications(${jsLiteral({ maxNotifications })}));
  })()`;
}

export function playNotificationViewSource(): string {
  return `${probeHelperSource()}
    const readNumericField = (value, lowerKey, upperKey) => {
      if (!value || typeof value !== "object") return null;
      if (typeof value[lowerKey] === "number") return value[lowerKey];
      if (typeof value[upperKey] === "number") return value[upperKey];
      return null;
    };
    const toComponentId = (value) => {
      if (!value || typeof value !== "object") return null;
      const owner = readNumericField(value, "owner", "Owner");
      const id = readNumericField(value, "id", "ID");
      if (owner == null || id == null) return null;
      const out = { owner, id };
      const type = readNumericField(value, "type", "Type");
      if (type != null) out.type = type;
      return out;
    };
    const componentKey = (value) => {
      const id = toComponentId(value);
      return id ? [id.owner, id.id, id.type ?? ""].join(":") : "";
    };
    const pushUniqueId = (ids, id) => {
      const normalized = toComponentId(id);
      if (!normalized) return;
      const key = componentKey(normalized);
      if (!ids.some((existing) => componentKey(existing) === key)) ids.push(normalized);
    };
    const notificationIdsForPlayer = (playerId, maxNotifications) => {
      const ids = [];
      const filters = [undefined];
      if (typeof IgnoreNotificationType !== "undefined" && IgnoreNotificationType) {
        for (const key of Object.keys(IgnoreNotificationType)) filters.push(IgnoreNotificationType[key]);
      }
      for (const filter of filters) {
        try {
          const found = filter === undefined
            ? Game.Notifications.getIdsForPlayer(playerId)
            : Game.Notifications.getIdsForPlayer(playerId, filter);
          if (Array.isArray(found)) {
            for (const id of found) pushUniqueId(ids, id);
          }
        } catch {}
      }
      return ids.slice(0, maxNotifications);
    };
    const safeNotificationValue = (notification, key) => {
      try {
        const value = notification == null ? undefined : notification[key];
        if (typeof value === "function") return value.call(notification);
        return value === undefined ? null : value;
      } catch (err) {
        return { error: String(err) };
      }
    };
    const stringIncludes = (value, needle) => String(value ?? "").toUpperCase().includes(needle);
    const loc = (key) => {
      if (key == null || key === "") return null;
      try {
        return typeof Locale !== "undefined" && Locale.compose ? Locale.compose(key) : String(key);
      } catch {
        return String(key);
      }
    };
    const stylize = (text) => {
      if (text == null || text === "") return null;
      try {
        return typeof Locale !== "undefined" && Locale.stylize ? Locale.stylize(text) : String(text);
      } catch {
        return String(text);
      }
    };
    const enumValueFor = (enums, operationType) => {
      if (enums && Object.prototype.hasOwnProperty.call(enums, operationType)) return enums[operationType];
      if (enums && typeof operationType === "string") {
        const normalizedKeys = [
          operationType.replace(/^UNITOPERATION_/, ""),
          operationType.replace(/^UNITCOMMAND_/, ""),
          operationType.replace(/^CITYOPERATION_/, ""),
          operationType.replace(/^CITYCOMMAND_/, ""),
          operationType.replace(/^PLAYEROPERATION_/, ""),
        ];
        for (const key of normalizedKeys) {
          if (Object.prototype.hasOwnProperty.call(enums, key)) return enums[key];
        }
      }
      return operationType;
    };
    const successFromCanStart = (result) => {
      if (result === true) return true;
      if (result === false || result == null) return false;
      if (typeof result === "object") {
        if (result.Success !== undefined) return result.Success === true;
        if (result.success !== undefined) return result.success === true;
        if (result.canStart !== undefined) return result.canStart === true;
      }
      return Boolean(result);
    };
    const safeUnitSummary = (unitId) => {
      const unit = Units.get(unitId);
      if (!unit) return null;
      const type = unit.type ?? null;
      const typeDef = (() => {
        try {
          return type == null ? null : GameInfo.Units.lookup(type);
        } catch {
          return null;
        }
      })();
      return {
        id: toComponentId(unit.id ?? unitId),
        owner: unit.owner ?? unitId.owner ?? null,
        type,
        typeName: typeDef?.UnitType ?? null,
        name: typeof unit.getName === "function" ? unit.getName() : unit.name ?? typeDef?.Name ?? null,
        location: unit.location ?? null,
        movementMovesRemaining: unit.Movement?.movementMovesRemaining ?? null,
        movementTurnsRemaining: unit.Movement?.movementTurnsRemaining ?? null,
        attacksRemaining: unit.Combat?.attacksRemaining ?? null,
        activity: unit.Activity?.activityType ?? unit.activityType ?? null,
      };
    };
    const requiredInput = (name, source, note) => ({ name, source, required: true, note });
    const optionalInput = (name, source, note) => ({ name, source, required: false, note });
    const action = (label, cli, operationFamily, operationType, argsShape, when) => ({
      label,
      cli,
      operationFamily,
      operationType,
      argsShape,
      when,
    });
    const hint = (category, operationFamily, operationType, argsShape, cli, confidence, requiredInputs, commonActions, notes) => ({
      category,
      operationFamily,
      operationType,
      argsShape,
      cli,
      requiredInputs,
      commonActions,
      confidence,
      notes,
    });
    const isValidComponentId = (value) => {
      try {
        return !!(value && typeof ComponentID !== "undefined" && ComponentID.isValid(value));
      } catch {
        return false;
      }
    };
    const firstMeetDetailsFor = (notification, typeName) => {
      if (!stringIncludes(typeName, "PLAYER_MET") && !stringIncludes(typeName, "FIRST_MEET")) return undefined;
      const player1 = GameContext.localPlayerID;
      const rawPlayer2 = safeNotificationValue(notification, "Player");
      const player2 = Number.isFinite(Number(rawPlayer2)) ? Number(rawPlayer2) : null;
      const otherPlayer = player2 == null ? null : probe(() => {
        const player = Players.get(player2);
        if (!player) return null;
        const leader = GameInfo?.Leaders?.lookup?.(player.leaderType);
        const civilization = GameInfo?.Civilizations?.lookup?.(player.civilizationType);
        return {
          id: player2,
          name: player.name ?? null,
          leaderType: player.leaderType ?? null,
          leaderName: leader?.Name ?? leader?.LeaderType ?? null,
          civilizationType: player.civilizationType ?? null,
          civilizationName: civilization?.Name ?? civilization?.CivilizationType ?? null,
        };
      });
      const responseRows = [
        ["friendly", "PLAYER_REALATIONSHIP_FIRSTMEET_FRIENDLY"],
        ["neutral", "PLAYER_REALATIONSHIP_FIRSTMEET_NEUTRAL"],
        ["unfriendly", "PLAYER_REALATIONSHIP_FIRSTMEET_UNFRIENDLY"],
      ];
      const responses = responseRows.map(([response, key]) => {
        const type = probe(() => (
          (typeof DiplomacyPlayerFirstMeets !== "undefined" ? DiplomacyPlayerFirstMeets?.[key] : undefined)
          ?? GameInfo?.Types?.lookup?.(key)?.Hash
          ?? null
        ));
        const typeValue = type.ok ? type.value : null;
        const costAndRelationship = Number.isFinite(Number(typeValue))
          ? probe(() => Game.Diplomacy.getFirstMeetResponseCostAndRelDelta(typeValue))
          : { ok: false, error: "first-meet response type unavailable" };
        const args = Number.isFinite(Number(typeValue)) && player2 != null
          ? { Player1: player1, Player2: player2, Type: typeValue }
          : null;
        const validation = args
          ? probe(() => Game.PlayerOperations.canStart(
            player1,
            PlayerOperationTypes.RESPOND_DIPLOMATIC_FIRST_MEET,
            args,
            false,
          ))
          : { ok: false, error: "missing Player2 or Type" };
        return {
          response,
          key,
          type,
          influenceCost: costAndRelationship.ok ? costAndRelationship.value?.[0] ?? null : null,
          relationshipDelta: costAndRelationship.ok ? costAndRelationship.value?.[1] ?? null : null,
          args,
          validation,
        };
      });
      return {
        kind: "first-meet-diplomacy",
        player1,
        player2,
        otherPlayer,
        responses,
        recommendedResponse: "neutral",
        recommendedCli: player2 == null
          ? null
          : "game play respond-first-meet --player-id " + String(player1) + " --met-player-id " + String(player2) + " --response neutral",
        note: "Neutral is the conservative default when Influence cost or payoff is not proven.",
      };
    };
    const diplomacyResponseDetailsFor = (notification, typeName, notificationId) => {
      if (!stringIncludes(typeName, "DIPLOMATIC_RESPONSE_REQUIRED")) return undefined;
      const target = safeNotificationValue(notification, "Target");
      const actionId = target && typeof target === "object" && typeof target.id === "number" ? target.id : null;
      const responseData = actionId == null
        ? { ok: false, error: "notification target does not include a diplomatic action id" }
        : probe(() => Game.Diplomacy.getResponseDataForUI(actionId));
      const eventData = actionId == null
        ? { ok: false, error: "notification target does not include a diplomatic action id" }
        : probe(() => Game.Diplomacy.getDiplomaticEventData(actionId));
      const responseList = responseData.ok && Array.isArray(responseData.value?.responseList)
        ? responseData.value.responseList
        : [];
      const options = responseList.map((response) => {
        const responseType = response?.responseType ?? null;
        const args = actionId == null || responseType == null ? null : { ID: actionId, Type: responseType };
        const validation = args
          ? probe(() => Game.PlayerOperations.canStart(
            GameContext.localPlayerID,
            PlayerOperationTypes.RESPOND_DIPLOMATIC_ACTION,
            args,
            false,
          ))
          : { ok: false, error: "missing action id or response type" };
        const enabled = validation.ok && (validation.value?.Success === true || validation.value?.canStart === true);
        return {
          responseType,
          title: loc(response?.titleString ?? response?.name ?? response?.Title ?? null),
          description: loc(response?.descriptionString ?? response?.Description ?? null),
          cost: response?.cost ?? null,
          icon: response?.icon ?? null,
          enabled,
          disabled: !enabled,
          validation,
          cli: enabled && actionId != null && responseType != null
            ? "game play respond-diplomacy --action-id " + actionId
              + " --response-type " + responseType
              + (notificationId ? " --notification-id '" + JSON.stringify(notificationId) + "'" : "")
              + " --send"
            : null,
        };
      });
      return {
        kind: "diplomacy-response-options",
        actionId,
        notificationId,
        responseData,
        eventData,
        options,
        enabledOptions: options.filter((option) => option.enabled),
        disabledOptions: options.filter((option) => option.disabled),
        notes: [
          "Options mirror Game.Diplomacy.getResponseDataForUI(actionId).responseList and validate through the official local-player RESPOND_DIPLOMATIC_ACTION check.",
          "Use a returned enabled option's cli as the single caller-level response; send mode performs UI closeout and notification postcondition checks.",
        ],
      };
    };
    const diplomacyActionReportDetailsFor = (notification, typeName, notificationId) => {
      if (!stringIncludes(typeName, "DIPLOMATIC_ACTION")) return undefined;
      if (stringIncludes(typeName, "DIPLOMATIC_RESPONSE_REQUIRED")
        || stringIncludes(typeName, "DIPLOMATIC_ACTION_LOW")
        || stringIncludes(typeName, "DIPLOMATIC_ACTION_WARNING")
        || stringIncludes(typeName, "DIPLOMATIC_ACTION_ESPIONAGE")) return undefined;
      const target = safeNotificationValue(notification, "Target");
      const actionId = target && typeof target === "object" && typeof target.id === "number" ? target.id : null;
      const eventData = actionId == null
        ? { ok: false, error: "notification target does not include a diplomatic action id" }
        : probe(() => Game.Diplomacy.getDiplomaticEventData(actionId));
      const responseData = actionId == null
        ? { ok: false, error: "notification target does not include a diplomatic action id" }
        : probe(() => Game.Diplomacy.getResponseDataForUI(actionId));
      const responseList = responseData.ok && Array.isArray(responseData.value?.responseList)
        ? responseData.value.responseList
        : [];
      const options = responseList.map((response) => {
        const responseType = response?.responseType ?? null;
        const args = actionId == null || responseType == null ? null : { ID: actionId, Type: responseType };
        const validation = args
          ? probe(() => Game.PlayerOperations.canStart(
            GameContext.localPlayerID,
            PlayerOperationTypes.RESPOND_DIPLOMATIC_ACTION,
            args,
            false,
          ))
          : { ok: false, error: "missing action id or response type" };
        const enabled = validation.ok && (validation.value?.Success === true || validation.value?.canStart === true);
        return {
          responseType,
          title: loc(response?.titleString ?? response?.name ?? response?.Title ?? null),
          description: loc(response?.descriptionString ?? response?.Description ?? null),
          cost: response?.cost ?? null,
          enabled,
          disabled: !enabled,
          validation,
          cli: enabled && actionId != null && responseType != null
            ? "game play respond-diplomacy --action-id " + actionId
              + " --response-type " + responseType
              + (notificationId ? " --notification-id '" + JSON.stringify(notificationId) + "'" : "")
              + " --send"
            : null,
        };
      });
      const enabledOptions = options.filter((option) => option.enabled);
      return {
        kind: "diplomatic-action-report",
        classification: enabledOptions.length > 0
          ? "diplomatic-action-response-options-present"
          : "diplomatic-action-report-no-enabled-response-options",
        actionId,
        notificationId,
        eventData,
        responseData,
        responseOptionCount: responseList.length,
        enabledResponseOptionCount: enabledOptions.length,
        options,
        enabledOptions,
        disabledOptions: options.filter((option) => option.disabled),
        notes: [
          "NOTIFICATION_DIPLOMATIC_ACTION uses the official InvestigateDiplomaticAction handler. Its target can be a real diplomatic event id, but that alone is not proof of a response-required operation.",
          "When getResponseDataForUI(actionId).responseList is empty or no options validate, treat this as a reviewed diplomatic action report closeout, not RESPOND_DIPLOMATIC_ACTION.",
        ],
      };
    };
    const technologyChoiceDetailsFor = (notification, typeName, notificationId) => {
      if (!stringIncludes(typeName, "CHOOSE_TECH")) return undefined;
      const localPlayerId = GameContext.localPlayerID;
      const techTrees = probe(() => {
        const trees = [];
        GameInfo.ProgressionTrees.forEach((tree) => {
          if (!stringIncludes(tree?.ProgressionTreeType, "TREE_TECHS")) return;
          const treeType = tree?.$hash ?? tree?.Hash ?? tree?.ProgressionTreeType;
          trees.push({
            treeType,
            treeTypeName: tree?.ProgressionTreeType ?? null,
            name: loc(tree?.Name ?? tree?.ProgressionTreeType ?? null),
            ageType: tree?.AgeType ?? null,
          });
        });
        return trees;
      });
      const currentResearching = probe(() => Players.get(localPlayerId)?.Techs?.getResearching?.() ?? null);
      const targetNode = probe(() => Players.get(localPlayerId)?.Techs?.getTargetNode?.() ?? null);
      const treeRows = techTrees.ok && Array.isArray(techTrees.value) ? techTrees.value : [];
      const options = [];
      for (const tree of treeRows) {
        const structure = probe(() => Game.ProgressionTrees.getTreeStructure(tree.treeType));
        const playerTree = probe(() => Game.ProgressionTrees.getTree(localPlayerId, tree.treeType));
        const playerNodes = playerTree.ok && Array.isArray(playerTree.value?.nodes) ? playerTree.value.nodes : [];
        const playerNodeByType = {};
        for (const node of playerNodes) {
          if (typeof node?.nodeType === "number") playerNodeByType[node.nodeType] = node;
        }
        const structureRows = structure.ok && Array.isArray(structure.value) ? structure.value : [];
        for (const structureNode of structureRows) {
          const nodeType = structureNode?.nodeType;
          if (!Number.isFinite(Number(nodeType))) continue;
          const numericNodeType = Number(nodeType);
          const nodeDef = probe(() => GameInfo.ProgressionTreeNodes.lookup(numericNodeType));
          const node = playerNodeByType[numericNodeType] ?? null;
          const args = { ProgressionTreeNodeType: numericNodeType };
          const chooseValidation = probe(() => Game.PlayerOperations.canStart(
            localPlayerId,
            PlayerOperationTypes.SET_TECH_TREE_NODE,
            args,
            false,
          ));
          const targetValidation = probe(() => Game.PlayerOperations.canStart(
            localPlayerId,
            PlayerOperationTypes.SET_TECH_TREE_TARGET_NODE,
            args,
            false,
          ));
          const chooseEnabled = chooseValidation.ok && successFromCanStart(chooseValidation.value);
          const targetEnabled = targetValidation.ok && successFromCanStart(targetValidation.value);
          const turns = probe(() => Players.get(localPlayerId)?.Techs?.getTurnsForNode?.(numericNodeType) ?? null);
          const cost = probe(() => Players.get(localPlayerId)?.Techs?.getNodeCost?.(numericNodeType) ?? null);
          const canEverUnlock = probe(() => Game.ProgressionTrees.canEverUnlock(localPlayerId, numericNodeType));
          const def = nodeDef.ok ? nodeDef.value : null;
          options.push({
            nodeType: numericNodeType,
            nodeTypeName: def?.ProgressionTreeNodeType ?? null,
            name: loc(def?.Name ?? def?.ProgressionTreeNodeType ?? null),
            description: loc(def?.Description ?? null),
            icon: def?.IconString ?? null,
            treeType: tree.treeType,
            treeTypeName: tree.treeTypeName,
            treeName: tree.name,
            ageType: tree.ageType,
            depth: structureNode?.treeDepth ?? node?.depth ?? null,
            state: node?.state ?? null,
            progress: node?.progress ?? null,
            maxDepth: node?.maxDepth ?? null,
            cost,
            turns,
            canEverUnlock,
            chooseEnabled,
            targetEnabled,
            disabled: !chooseEnabled,
            chooseValidation,
            targetValidation,
            cli: chooseEnabled
              ? "game play choose-tech --player-id " + String(localPlayerId)
                + " --node " + String(numericNodeType)
                + " --send"
              : null,
            validateCli: "game play choose-tech --player-id " + String(localPlayerId)
              + " --node " + String(numericNodeType) + " --json",
            targetCli: targetEnabled
              ? "game play set-tech-target --player-id " + String(localPlayerId)
                + " --node " + String(numericNodeType)
                + " --send"
              : null,
          });
        }
      }
      const enabledOptions = options.filter((option) => option.chooseEnabled);
      enabledOptions.sort((left, right) => {
        const leftDepth = Number.isFinite(Number(left.depth)) ? Number(left.depth) : 999;
        const rightDepth = Number.isFinite(Number(right.depth)) ? Number(right.depth) : 999;
        if (leftDepth !== rightDepth) return leftDepth - rightDepth;
        return String(left.name ?? left.nodeTypeName ?? left.nodeType).localeCompare(String(right.name ?? right.nodeTypeName ?? right.nodeType));
      });
      const disabledOptions = options.filter((option) => !option.chooseEnabled);
      return {
        kind: "technology-choice-options",
        notificationId,
        localPlayerId,
        source: "GameInfo.ProgressionTrees + Game.ProgressionTrees + PlayerOperations.canStart",
        currentResearching,
        targetNode,
        techTrees,
        options,
        enabledOptions,
        disabledOptions,
        notes: [
          "Options are read from official progression-tree structures and validated through local-player SET_TECH_TREE_NODE and SET_TECH_TREE_TARGET_NODE checks.",
          "Use an enabled option's cli for one caller-level technology selection; choose-tech send mode clears the chooser target internally.",
        ],
      };
    };
    const cultureChoiceDetailsFor = (notification, typeName, notificationId) => {
      if (!stringIncludes(typeName, "CHOOSE_CULTURE")) return undefined;
      const localPlayerId = GameContext.localPlayerID;
      const currentResearching = probe(() => {
        const culture = Players.get(localPlayerId)?.Culture;
        const activeTree = culture?.getActiveTree?.();
        if (activeTree == null) return null;
        const tree = Game.ProgressionTrees.getTree(localPlayerId, activeTree);
        const activeNodeIndex = tree?.activeNodeIndex;
        return Number.isFinite(Number(activeNodeIndex)) && activeNodeIndex >= 0
          ? tree?.nodes?.[activeNodeIndex]?.nodeType ?? null
          : null;
      });
      const targetNode = probe(() => Players.get(localPlayerId)?.Culture?.getTargetNode?.() ?? null);
      const availableNodeTypes = probe(() => Players.get(localPlayerId)?.Culture?.getAllAvailableNodeTypes?.() ?? []);
      const options = [];
      const nodeRows = availableNodeTypes.ok && Array.isArray(availableNodeTypes.value)
        ? availableNodeTypes.value
        : [];
      for (const row of nodeRows) {
        const numericNodeType = Number(row?.type ?? row?.nodeType ?? row);
        if (!Number.isFinite(numericNodeType)) continue;
        const nodeDef = probe(() => GameInfo.ProgressionTreeNodes.lookup(numericNodeType));
        const node = probe(() => Game.ProgressionTrees.getNode(localPlayerId, numericNodeType));
        const def = nodeDef.ok ? nodeDef.value : null;
        const nodeValue = node.ok ? node.value : null;
        const treeType = def?.ProgressionTree ?? nodeValue?.treeType ?? null;
        const treeDef = treeType == null
          ? { ok: false, error: "culture node does not include ProgressionTree" }
          : probe(() => GameInfo.ProgressionTrees.lookup(treeType));
        const tree = treeDef.ok ? treeDef.value : null;
        const args = { ProgressionTreeNodeType: numericNodeType };
        const chooseValidation = probe(() => Game.PlayerOperations.canStart(
          localPlayerId,
          PlayerOperationTypes.SET_CULTURE_TREE_NODE,
          args,
          false,
        ));
        const targetValidation = probe(() => Game.PlayerOperations.canStart(
          localPlayerId,
          PlayerOperationTypes.SET_CULTURE_TREE_TARGET_NODE,
          args,
          false,
        ));
        const chooseEnabled = chooseValidation.ok && successFromCanStart(chooseValidation.value);
        const targetEnabled = targetValidation.ok && successFromCanStart(targetValidation.value);
        const turns = probe(() => Players.get(localPlayerId)?.Culture?.getTurnsForNode?.(numericNodeType) ?? null);
        const cost = probe(() => Players.get(localPlayerId)?.Culture?.getNodeCost?.(numericNodeType) ?? null);
        const canEverUnlock = probe(() => Game.ProgressionTrees.canEverUnlock(localPlayerId, numericNodeType));
        options.push({
          nodeType: numericNodeType,
          nodeTypeName: def?.ProgressionTreeNodeType ?? null,
          name: loc(def?.Name ?? def?.ProgressionTreeNodeType ?? null),
          description: loc(def?.Description ?? null),
          icon: def?.IconString ?? null,
          treeType,
          treeTypeName: tree?.ProgressionTreeType ?? null,
          treeName: loc(tree?.Name ?? tree?.ProgressionTreeType ?? null),
          ageType: tree?.AgeType ?? null,
          depth: nodeValue?.depth ?? nodeValue?.treeDepth ?? null,
          state: nodeValue?.state ?? null,
          progress: nodeValue?.progress ?? null,
          maxDepth: nodeValue?.maxDepth ?? null,
          cost,
          turns,
          canEverUnlock,
          chooseEnabled,
          targetEnabled,
          disabled: !chooseEnabled,
          chooseValidation,
          targetValidation,
          cli: chooseEnabled
            ? "game play choose-culture --player-id " + String(localPlayerId)
              + " --node " + String(numericNodeType)
              + " --send --closeout"
            : null,
          validateCli: "game play choose-culture --player-id " + String(localPlayerId)
            + " --node " + String(numericNodeType) + " --json",
          targetCli: targetEnabled
            ? "game play set-culture-target --player-id " + String(localPlayerId)
              + " --node " + String(numericNodeType)
              + " --send"
            : null,
        });
      }
      const enabledOptions = options.filter((option) => option.chooseEnabled);
      enabledOptions.sort((left, right) => {
        const leftDepth = Number.isFinite(Number(left.depth)) ? Number(left.depth) : 999;
        const rightDepth = Number.isFinite(Number(right.depth)) ? Number(right.depth) : 999;
        if (leftDepth !== rightDepth) return leftDepth - rightDepth;
        return String(left.name ?? left.nodeTypeName ?? left.nodeType).localeCompare(String(right.name ?? right.nodeTypeName ?? right.nodeType));
      });
      const disabledOptions = options.filter((option) => !option.chooseEnabled);
      return {
        kind: "culture-choice-options",
        notificationId,
        localPlayerId,
        source: "Players.Culture.getAllAvailableNodeTypes + Game.ProgressionTrees + PlayerOperations.canStart",
        currentResearching,
        targetNode,
        availableNodeTypes,
        options,
        enabledOptions,
        disabledOptions,
        notes: [
          "Options are read from the official culture chooser available-node list and validated through local-player SET_CULTURE_TREE_NODE and SET_CULTURE_TREE_TARGET_NODE checks.",
          "Use an enabled option's cli for one caller-level chooser closeout workflow; use validateCli when strategy needs inspection before sending.",
        ],
      };
    };
    const celebrationChoiceDetailsFor = (notification, typeName, notificationId) => {
      if (!stringIncludes(typeName, "CHOOSE_GOLDEN_AGE")) return undefined;
      const localPlayerId = GameContext.localPlayerID;
      const player = probe(() => Players.get(localPlayerId));
      const playerCulture = player.ok ? player.value?.Culture ?? null : null;
      const currentGovernmentType = probe(() => playerCulture?.getGovernmentType?.() ?? null);
      const goldenAgeDuration = probe(() => player.ok ? player.value?.Happiness?.getGoldenAgeDuration?.() ?? null : null);
      const choices = probe(() => playerCulture?.getGoldenAgeChoices?.() ?? []);
      const choiceRows = choices.ok && Array.isArray(choices.value) ? choices.value : [];
      const options = [];
      for (const choice of choiceRows) {
        const goldenAgeDef = probe(() => GameInfo.GoldenAges.lookup(choice)).value ?? null;
        const goldenAgeTypeName = goldenAgeDef?.GoldenAgeType ?? choice ?? null;
        const goldenAgeHash = goldenAgeTypeName == null
          ? { ok: false, error: "missing GoldenAgeType" }
          : probe(() => Database.makeHash(goldenAgeTypeName));
        const args = goldenAgeHash.ok && typeof goldenAgeHash.value === "number"
          ? { GoldenAgeType: goldenAgeHash.value }
          : null;
        const validation = args
          ? probe(() => Game.PlayerOperations.canStart(
            localPlayerId,
            PlayerOperationTypes.CHOOSE_GOLDEN_AGE,
            args,
            false,
          ))
          : { ok: false, error: "missing GoldenAgeType hash" };
        const enabled = validation.ok && successFromCanStart(validation.value);
        options.push({
          goldenAgeType: args?.GoldenAgeType ?? null,
          goldenAgeTypeName,
          sourceChoice: choice,
          name: loc(goldenAgeDef?.Name ?? goldenAgeTypeName),
          description: loc(goldenAgeDef?.Description ?? null),
          duration: goldenAgeDuration.ok ? goldenAgeDuration.value : null,
          currentGovernmentType: currentGovernmentType.ok ? currentGovernmentType.value : null,
          args,
          enabled,
          disabled: !enabled,
          validation,
          cli: enabled && args
            ? "game play choose-celebration --golden-age-type " + String(args.GoldenAgeType)
              + " --send"
            : null,
          validateCli: args
            ? "game play choose-celebration --player-id " + String(localPlayerId)
              + " --golden-age-type " + String(args.GoldenAgeType)
              + " --json"
            : null,
        });
      }
      const enabledOptions = options.filter((option) => option.enabled);
      enabledOptions.sort((left, right) => String(left.name ?? left.goldenAgeTypeName ?? left.goldenAgeType)
        .localeCompare(String(right.name ?? right.goldenAgeTypeName ?? right.goldenAgeType)));
      const disabledOptions = options.filter((option) => option.disabled);
      return {
        kind: "celebration-choice-options",
        notificationId,
        localPlayerId,
        source: "Players.Culture.getGoldenAgeChoices + GameInfo.GoldenAges + PlayerOperations.canStart",
        currentGovernmentType,
        goldenAgeDuration,
        choices,
        options,
        enabledOptions,
        disabledOptions,
        notes: [
          "Options mirror the official celebration chooser and validate local-player CHOOSE_GOLDEN_AGE with the hashed GoldenAgeType.",
          "This surface is read-only and does not rank celebration choices; choose based on current strategy, then re-read blockers after sending.",
        ],
      };
    };
    const governmentChoiceDetailsFor = (notification, typeName, notificationId) => {
      if (!stringIncludes(typeName, "CHOOSE_GOVERNMENT")) return undefined;
      const localPlayerId = GameContext.localPlayerID;
      const activate = typeof PlayerOperationParameters !== "undefined" ? PlayerOperationParameters.Activate : null;
      const currentGovernmentType = probe(() => Players.get(localPlayerId)?.Culture?.getGovernmentType?.() ?? null);
      const goldenAgeDuration = probe(() => Players.get(localPlayerId)?.Happiness?.getGoldenAgeDuration?.() ?? null);
      const options = [];
      const startingGovernments = probe(() => {
        const rows = [];
        GameInfo.StartingGovernments.forEach((startingGovernmentDef) => rows.push(startingGovernmentDef));
        return rows;
      });
      const startingRows = startingGovernments.ok && Array.isArray(startingGovernments.value)
        ? startingGovernments.value
        : [];
      for (const startingGovernmentDef of startingRows) {
        const governmentType = startingGovernmentDef?.GovernmentType ?? null;
        const governmentDef = governmentType == null
          ? null
          : probe(() => GameInfo.Governments.lookup(governmentType)).value ?? null;
        const governmentIndex = governmentDef?.$index ?? null;
        const args = governmentIndex == null || activate == null
          ? null
          : { GovernmentType: governmentIndex, Action: activate };
        const validation = args
          ? probe(() => Game.PlayerOperations.canStart(
            localPlayerId,
            PlayerOperationTypes.CHANGE_GOVERNMENT,
            args,
            false,
          ))
          : { ok: false, error: "missing government type or activate action" };
        const enabled = validation.ok && successFromCanStart(validation.value);
        const celebrationTypes = governmentDef?.GovernmentType == null
          ? { ok: false, error: "missing government definition" }
          : probe(() => Game.Culture.GetCelebrationTypesForGovernment(governmentDef.GovernmentType));
        const celebrationRows = celebrationTypes.ok && Array.isArray(celebrationTypes.value)
          ? celebrationTypes.value.map((goldenAgeType) => {
            const goldenAgeDef = probe(() => GameInfo.GoldenAges.lookup(goldenAgeType)).value ?? null;
            return {
              goldenAgeType,
              typeName: goldenAgeDef?.GoldenAgeType ?? null,
              name: loc(goldenAgeDef?.Name ?? goldenAgeDef?.GoldenAgeType ?? null),
              description: loc(goldenAgeDef?.Description ?? null),
              duration: goldenAgeDuration.ok ? goldenAgeDuration.value : null,
            };
          })
          : [];
        options.push({
          governmentType: governmentIndex,
          governmentTypeName: governmentDef?.GovernmentType ?? governmentType,
          name: loc(governmentDef?.Name ?? governmentDef?.GovernmentType ?? governmentType),
          description: loc(governmentDef?.Description ?? null),
          startingGovernmentType: governmentType,
          action: activate,
          args,
          celebrationOptions: celebrationRows,
          enabled,
          disabled: !enabled,
          validation,
          cli: enabled && governmentIndex != null && activate != null
            ? "game play choose-government --government-type " + String(governmentIndex)
              + " --action " + String(activate)
              + " --send"
            : null,
          validateCli: governmentIndex != null
            ? "game play choose-government --player-id " + String(localPlayerId)
              + " --government-type " + String(governmentIndex)
              + (activate != null ? " --action " + String(activate) : "")
              + " --json"
            : null,
        });
      }
      const enabledOptions = options.filter((option) => option.enabled);
      const disabledOptions = options.filter((option) => option.disabled);
      return {
        kind: "government-choice-options",
        notificationId,
        localPlayerId,
        source: "GameInfo.StartingGovernments + GameInfo.Governments + PlayerOperations.canStart",
        currentGovernmentType,
        startingGovernments,
        action: activate,
        goldenAgeDuration,
        options,
        enabledOptions,
        disabledOptions,
        notes: [
          "Options mirror the official government picker and validate local-player CHANGE_GOVERNMENT with PlayerOperationParameters.Activate.",
          "Celebration options are read for context; choosing a government is the single caller-level operation.",
        ],
      };
    };
    const narrativeChoiceDetailsFor = (notification, typeName, notificationId) => {
      if (!stringIncludes(typeName, "CHOOSE_NARRATIVE_STORY_DIRECTION")
        && !stringIncludes(typeName, "CHOOSE_DISCOVERY_STORY_DIRECTION")
        && !stringIncludes(typeName, "CHOOSE_AUTO_NARRATIVE_STORY_DIRECTION")
        && !stringIncludes(typeName, "CHOOSE_STORY_DIRECTION")) return undefined;
      const localPlayerId = GameContext.localPlayerID;
      const notificationOwner = toComponentId(notificationId)?.owner ?? localPlayerId;
      const activate = typeof PlayerOperationParameters !== "undefined" ? PlayerOperationParameters.Activate : null;
      const storyTextTypesAvailable = typeof StoryTextTypes !== "undefined";
      const playerStories = probe(() => Players.get(notificationOwner)?.Stories ?? null);
      const pendingStoryId = probe(() => playerStories.ok ? playerStories.value?.getFirstPendingMetId?.() ?? null : null);
      const pendingDiscoveryStoryId = probe(() => playerStories.ok ? playerStories.value?.getFirstPendingDiscoveryLastMetID?.() ?? null : null);
      const targetStoryIdSource = stringIncludes(typeName, "CHOOSE_DISCOVERY_STORY_DIRECTION")
        ? (pendingDiscoveryStoryId.ok && pendingDiscoveryStoryId.value ? "Players.Stories.getFirstPendingDiscoveryLastMetID" : "Players.Stories.getFirstPendingMetId")
        : "Players.Stories.getFirstPendingMetId";
      const targetStoryId = targetStoryIdSource === "Players.Stories.getFirstPendingDiscoveryLastMetID" ? pendingDiscoveryStoryId : pendingStoryId;
      const targetStory = probe(() => targetStoryId.ok && targetStoryId.value && playerStories.ok
        ? playerStories.value?.find?.(targetStoryId.value) ?? null
        : null);
      const storyDef = probe(() => targetStory.ok && targetStory.value
        ? GameInfo.NarrativeStories.lookup(targetStory.value.type)
        : null);
      const storyLinks = probe(() => storyDef.ok && storyDef.value
        ? GameInfo.NarrativeStory_Links.filter((def) => def.FromNarrativeStoryType == storyDef.value.NarrativeStoryType)
        : []);
      const textFor = (target, toHash, textTypeName) => {
        if (!playerStories.ok || !target || !storyTextTypesAvailable) return null;
        const textType = StoryTextTypes[textTypeName];
        if (textType == null) return null;
        if (toHash == null) return stylize(playerStories.value?.determineNarrativeInjectionComponentId?.(target, textType));
        return stylize(playerStories.value?.determineNarrativeInjection?.(target, toHash, textType));
      };
      const visiblePanel = probe(() => {
        const root = typeof document !== "undefined" ? document.querySelector?.("small-narrative-event") : null;
        const component = root?._component ?? null;
        const visibleTarget = toComponentId(component?.targetStoryId);
        const buttons = typeof document !== "undefined"
          ? Array.from(document.querySelectorAll?.("fxs-reward-button[small-narrative-choice-key]") ?? [])
          : [];
        return {
          panelType: root?.tagName ?? null,
          componentType: component?.constructor?.name ?? null,
          targetStoryId: visibleTarget,
          storyType: component?.storyType ?? null,
          options: buttons.map((button) => ({
            targetType: button.getAttribute("small-narrative-choice-key"),
            name: button.getAttribute("main-text"),
            reward: button.getAttribute("reward"),
            actionText: button.getAttribute("action-text"),
            icons: button.getAttribute("icons"),
            storyType: button.getAttribute("story-type"),
          })).filter((option) => option.targetType),
        };
      });
      const options = [];
      const target = targetStoryId.ok ? targetStoryId.value : null;
      const linkRows = storyLinks.ok && Array.isArray(storyLinks.value) ? storyLinks.value : [];
      for (const link of linkRows) {
        const linkDef = probe(() => GameInfo.NarrativeStories.lookup(link.ToNarrativeStoryType));
        const toLinkDef = linkDef.ok ? linkDef.value : null;
        if (!toLinkDef) continue;
        const activation = String(toLinkDef.Activation ?? "").toUpperCase();
        const requisiteOk = activation === "LINKED_REQUISITE"
          ? probe(() => playerStories.ok ? playerStories.value?.determineRequisiteLink?.(toLinkDef.NarrativeStoryType) === true : false)
          : { ok: true, value: true };
        const activationEnabled = activation === "LINKED" || (activation === "LINKED_REQUISITE" && requisiteOk.ok && requisiteOk.value === true);
        if (!activationEnabled) continue;
        const canAfford = probe(() => toLinkDef.Cost === 0 || (playerStories.ok && playerStories.value?.canAfford?.(toLinkDef.NarrativeStoryType) === true));
        const args = target && activate != null
          ? { TargetType: link.ToNarrativeStoryType, Target: target, Action: activate }
          : null;
        const validation = args
          ? probe(() => Game.PlayerOperations.canStart(
            localPlayerId,
            PlayerOperationTypes.CHOOSE_NARRATIVE_STORY_DIRECTION,
            args,
            false,
          ))
          : { ok: false, error: "missing target story id or activate action" };
        const enabled = activationEnabled
          && canAfford.ok
          && canAfford.value === true
          && validation.ok
          && successFromCanStart(validation.value);
        const targetJson = target ? JSON.stringify(target) : null;
        options.push({
          targetType: link.ToNarrativeStoryType,
          targetTypeName: toLinkDef.NarrativeStoryType ?? link.ToNarrativeStoryType,
          target,
          action: activate,
          activation,
          name: textFor(target, toLinkDef.$hash ?? -1, "OPTION") ?? loc(toLinkDef.Name ?? toLinkDef.NarrativeStoryType ?? link.ToNarrativeStoryType),
          reward: textFor(target, toLinkDef.$hash ?? -1, "REWARD"),
          imperative: textFor(target, toLinkDef.$hash ?? -1, "IMPERATIVE"),
          cost: toLinkDef.Cost ?? null,
          canAfford,
          args,
          enabled,
          disabled: !enabled,
          validation,
          cli: enabled && targetJson
            ? "game play choose-narrative --player-id " + String(localPlayerId)
              + " --target-type " + String(link.ToNarrativeStoryType)
              + " --target '" + targetJson + "'"
              + " --action " + String(activate)
              + " --send"
            : null,
          validateCli: targetJson
            ? "game play choose-narrative --player-id " + String(localPlayerId)
              + " --target-type " + String(link.ToNarrativeStoryType)
              + " --target '" + targetJson + "'"
              + (activate != null ? " --action " + String(activate) : "")
              + " --json"
            : null,
        });
      }
      if (options.length === 0 && target) {
        const args = activate == null ? null : { TargetType: "CLOSE", Target: target, Action: activate };
        const validation = args
          ? probe(() => Game.PlayerOperations.canStart(
            localPlayerId,
            PlayerOperationTypes.CHOOSE_NARRATIVE_STORY_DIRECTION,
            args,
            false,
          ))
          : { ok: false, error: "missing activate action" };
        const enabled = validation.ok && successFromCanStart(validation.value);
        const targetJson = JSON.stringify(target);
        options.push({
          targetType: "CLOSE",
          targetTypeName: "CLOSE",
          target,
          action: activate,
          activation: "CLOSE",
          name: loc("LOC_NARRATIVE_STORY_END_STORY_NAME") ?? "Close",
          reward: textFor(target, null, "REWARD"),
          imperative: null,
          cost: 0,
          canAfford: { ok: true, value: true },
          args,
          enabled,
          disabled: !enabled,
          validation,
          cli: enabled
            ? "game play choose-narrative --player-id " + String(localPlayerId)
              + " --target-type CLOSE"
              + " --target '" + targetJson + "'"
              + " --action " + String(activate)
              + " --send"
            : null,
          validateCli: "game play choose-narrative --player-id " + String(localPlayerId)
            + " --target-type CLOSE"
            + " --target '" + targetJson + "'"
            + (activate != null ? " --action " + String(activate) : "")
            + " --json",
        });
      }
      if (options.length === 0 && visiblePanel.ok && visiblePanel.value?.targetStoryId && Array.isArray(visiblePanel.value.options)) {
        const visibleTarget = visiblePanel.value.targetStoryId;
        const targetJson = JSON.stringify(visibleTarget);
        for (const visibleOption of visiblePanel.value.options) {
          if (!visibleOption.targetType) continue;
          const args = activate == null ? null : { TargetType: visibleOption.targetType, Target: visibleTarget, Action: activate };
          const validation = args
            ? probe(() => Game.PlayerOperations.canStart(
              localPlayerId,
              PlayerOperationTypes.CHOOSE_NARRATIVE_STORY_DIRECTION,
              args,
              false,
            ))
            : { ok: false, error: "missing activate action" };
          const enabled = validation.ok && successFromCanStart(validation.value);
          options.push({
            source: "visible-small-narrative-event",
            targetType: visibleOption.targetType,
            targetTypeName: visibleOption.targetType,
            target: visibleTarget,
            action: activate,
            activation: "VISIBLE_PANEL",
            name: stylize(visibleOption.name) ?? visibleOption.targetType,
            reward: stylize(visibleOption.reward),
            imperative: stylize(visibleOption.actionText),
            cost: null,
            canAfford: { ok: true, value: true },
            args,
            enabled,
            disabled: !enabled,
            validation,
            cli: enabled
              ? "game play choose-narrative --player-id " + String(localPlayerId)
                + " --target-type " + String(visibleOption.targetType)
                + " --target '" + targetJson + "'"
                + " --action " + String(activate)
                + " --send"
              : null,
            validateCli: "game play choose-narrative --player-id " + String(localPlayerId)
              + " --target-type " + String(visibleOption.targetType)
              + " --target '" + targetJson + "'"
              + (activate != null ? " --action " + String(activate) : "")
              + " --json",
          });
        }
      }
      const enabledOptions = options.filter((option) => option.enabled);
      const disabledOptions = options.filter((option) => option.disabled);
      const notificationTarget = safeNotificationValue(notification, "Target");
      const hasEnabledOptions = enabledOptions.length > 0;
      const dismissalDiagnosticCli = !hasEnabledOptions && !target && safeNotificationValue(notification, "CanUserDismiss") === true && notificationId
        ? "game play dismiss-notification --target '" + JSON.stringify(notificationId) + "' --json"
        : null;
      const unprovenDismissalCli = !hasEnabledOptions && !target && safeNotificationValue(notification, "CanUserDismiss") === true && notificationId
        ? "game play dismiss-notification --target '" + JSON.stringify(notificationId) + "' --send"
        : null;
      const classification = hasEnabledOptions
        ? "narrative-choice-options"
        : target
          ? "narrative-choice-no-enabled-options"
          : "narrative-choice-no-pending-story";
      return {
        kind: "narrative-choice-options",
        classification,
        notificationId,
        localPlayerId,
        notificationOwner,
        source: "Players.Stories pending story id + GameInfo.NarrativeStory_Links + PlayerOperations.canStart",
        activateAction: activate,
        targetStoryIdSource,
        pendingStoryId,
        pendingDiscoveryStoryId,
        targetStoryId,
        visiblePanel,
        targetStory,
        storyDef,
        storyLinks,
        notificationTarget,
        options,
        enabledOptions,
        disabledOptions,
        dismissalDiagnosticCli,
        unprovenDismissalCli,
        notes: [
          "Options mirror the official narrative popup buttons. The notification target can be invalid; the official UI derives the target story from Players.Stories.",
          "Discovery notifications are checked against getFirstPendingDiscoveryLastMetID before the regular pending met story id.",
          "When the official panel is already visible, options can be sourced from small-narrative-event._component.targetStoryId and fxs-reward-button choice keys, then validated through CHOOSE_NARRATIVE_STORY_DIRECTION.",
          "When a real story has no linked choices, the official UI emits a CLOSE option with CHOOSE_NARRATIVE_STORY_DIRECTION.",
          "If no pending story id exists, no narrative operation is materialized. Notification dismissal is a separate closeout attempt and is only proven by explicit postcondition classification.",
        ],
      };
    };
    const unitCommandDetailsFor = (notification, typeName, notificationId) => {
      if (!stringIncludes(typeName, "COMMAND_UNITS")) return undefined;
      const selectedUnitId = probe(() => toComponentId(UI?.Player?.getHeadSelectedUnit?.()));
      const firstReadyUnitId = probe(() => toComponentId(UI?.Player?.getFirstReadyUnit?.()));
      const hasSentTurnComplete = probe(() => typeof GameContext.hasSentTurnComplete === "function"
        ? GameContext.hasSentTurnComplete()
        : false);
      const blocker = probe(() => typeof Game.Notifications.getEndTurnBlockingType === "function"
        ? Game.Notifications.getEndTurnBlockingType(GameContext.localPlayerID)
        : null);
      const expired = safeNotificationValue(notification, "Expired") === true;
      const skipEnum = enumValueFor(typeof UnitOperationTypes !== "undefined" ? UnitOperationTypes : {}, "SKIP_TURN");
      const unitIds = probe(() => {
        const playerUnits = Players.Units.get(GameContext.localPlayerID);
        return playerUnits?.getUnitIds?.() ?? [];
      });
      const units = unitIds.ok && Array.isArray(unitIds.value) ? unitIds.value : [];
      const closeoutCandidates = units.map((unitId) => {
        const normalizedUnitId = toComponentId(unitId);
        if (!normalizedUnitId) return null;
        const validation = probe(() => Game.UnitOperations.canStart(normalizedUnitId, skipEnum, {}, false));
        const enabled = validation.ok && successFromCanStart(validation.value);
        return {
          unitId: normalizedUnitId,
          unit: probe(() => safeUnitSummary(normalizedUnitId)),
          operationFamily: "unit-operation",
          operationType: "SKIP_TURN",
          argsShape: "{}",
          enabled,
          validation,
          cli: enabled
            ? "game play operation --family unit --type SKIP_TURN --unit-id '"
              + JSON.stringify(normalizedUnitId)
              + "' --send"
            : null,
        };
      }).filter(Boolean);
      const enabledCloseoutCandidates = closeoutCandidates.filter((candidate) => candidate.enabled);
      const selectedMissing = (selectedUnitId.ok ? selectedUnitId.value : null) == null;
      const firstReadyMissing = (firstReadyUnitId.ok ? firstReadyUnitId.value : null) == null;
      const blockerLooksClean = blocker.ok && blocker.value === 0;
      const staleExpiredWithoutEnabledCloseout = expired
        && selectedMissing
        && firstReadyMissing
        && blockerLooksClean
        && enabledCloseoutCandidates.length === 0;
      const turnCompleteAlreadySent = hasSentTurnComplete.ok && hasSentTurnComplete.value === true;
      const repairCandidates = staleExpiredWithoutEnabledCloseout
        ? [
            turnCompleteAlreadySent
              ? {
                  kind: "wait-for-turn-advance",
                  cli: "game watch --count 3 --interval-ms 1000 --include-ready-unit --include-ready-city --jsonl",
                  proof: "GameContext.hasSentTurnComplete is already true; do not repeat unit operations or turn-complete until a fresh watch shows whether the turn advanced or a new blocker appeared.",
                }
              : {
                  kind: "send-turn-complete",
                  cli: "game play end-turn --send --json",
                  proof: "Official COMMAND_UNITS activation selects the next ready unit; selectedUnitId and firstReadyUnitId are null, blocker enum is clean, and no validator-backed SKIP_TURN closeout remains.",
                },
          ]
        : [];
      return {
        kind: "unit-command-reconciliation",
        classification: staleExpiredWithoutEnabledCloseout
          ? "unit-command-stale-expired"
          : "unit-command-closeout-candidates",
        notificationId,
        blocker,
        hasSentTurnComplete,
        selectedUnitId,
        firstReadyUnitId,
        unitScan: unitIds,
        closeoutCandidates,
        enabledCloseoutCandidates,
        staleReadyPointerSuspected: (selectedUnitId.ok ? selectedUnitId.value : null) == null
          && (firstReadyUnitId.ok ? firstReadyUnitId.value : null) == null
          && enabledCloseoutCandidates.length > 0,
        staleExpiredWithoutEnabledCloseout,
        repairCandidates,
        notes: [
          "COMMAND_UNITS can remain end-turn blocking even when the ready-unit pointer is null. This detail scans local-player units for validator-backed no-target SKIP_TURN closeouts.",
          "If COMMAND_UNITS is expired, no selected/ready unit exists, blocker enum is clean, and every scanned unit operation is disabled, treat it as stale UI state rather than a unit operation request.",
          "Use these candidates only as unit-command reconciliation. Movement, attack, promotion, fortify, and automation still require ready-unit/unit-target/unit-move-preview evidence.",
        ],
      };
    };
    const detailsFor = (notification, typeName, notificationId) => {
      return firstMeetDetailsFor(notification, typeName)
        ?? diplomacyResponseDetailsFor(notification, typeName, notificationId)
        ?? diplomacyActionReportDetailsFor(notification, typeName, notificationId)
        ?? technologyChoiceDetailsFor(notification, typeName, notificationId)
        ?? cultureChoiceDetailsFor(notification, typeName, notificationId)
        ?? celebrationChoiceDetailsFor(notification, typeName, notificationId)
        ?? governmentChoiceDetailsFor(notification, typeName, notificationId)
        ?? narrativeChoiceDetailsFor(notification, typeName, notificationId)
        ?? unitCommandDetailsFor(notification, typeName, notificationId);
    };
    const decisionHintFor = (notification, typeName, isBlocking) => {
      const haystack = [
        typeName,
        notification?.Type,
        notification?.GroupType,
        notification?.Summary,
        notification?.Message,
      ].map((part) => String(part ?? "").toUpperCase()).join(" ");
      if (stringIncludes(haystack, "CHOOSE_TECH")) {
        return hint(
          "technology-choice",
          "player-operation",
          "SET_TECH_TREE_NODE",
          "{ ProgressionTreeNodeType }",
          "game play choose-tech",
          "live-proof",
          [requiredInput("ProgressionTreeNodeType", "live tech chooser/tree node", "Use the runtime node type hash from GameInfo/progression tree data, not the row index or notification id.")],
          [
            action("choose tech", "game play choose-tech --player-id <id> --node <node> --send", "sequence", "SET_TECH_TREE_NODE then SET_TECH_TREE_TARGET_NODE", "{ ProgressionTreeNodeType: node } then { ProgressionTreeNodeType: NO_NODE }", "when one caller action should start research and finish the chooser workflow"),
            action("validate tech choice", "game play choose-tech --player-id <id> --node <node>", "player-operation", "SET_TECH_TREE_NODE", "{ ProgressionTreeNodeType }", "after reading the candidate node"),
            action("set tech target", "game play set-tech-target --player-id <id> --node <node>", "player-operation", "SET_TECH_TREE_TARGET_NODE", "{ ProgressionTreeNodeType }", "when the full tree UI targets a node or choose-node alone leaves the blocker unresolved"),
          ],
          ["Read the live tech node id before sending; choose-tech send mode mirrors the chooser by clearing the temporary target internally."],
        );
      }
      if (stringIncludes(haystack, "CHOOSE_CULTURE") || stringIncludes(haystack, "CULTURE_TREE")) {
        return hint(
          "culture-choice",
          "player-operation",
          "SET_CULTURE_TREE_NODE",
          "{ ProgressionTreeNodeType }",
          "game play choose-culture",
          "live-proof",
          [requiredInput("ProgressionTreeNodeType", "live culture chooser/tree node", "Use the runtime node type hash from GameInfo/progression tree data, not the row index or notification id.")],
          [
            action("choose culture and close chooser", "game play choose-culture --player-id <id> --node <node> --send --closeout", "sequence", "SET_CULTURE_TREE_NODE then SET_CULTURE_TREE_TARGET_NODE", "{ ProgressionTreeNodeType: node } then { ProgressionTreeNodeType: NO_NODE }", "when one caller action should start culture and close the chooser surface"),
            action("read culture options", "game play choose-culture --options --json", undefined, undefined, "enabled culture nodes with validation and ready send templates", "before choosing a culture node"),
            action("validate culture choice", "game play choose-culture --player-id <id> --node <node>", "player-operation", "SET_CULTURE_TREE_NODE", "{ ProgressionTreeNodeType }", "after reading the candidate node"),
            action("set culture target", "game play set-culture-target --player-id <id> --node <node>", "player-operation", "SET_CULTURE_TREE_TARGET_NODE", "{ ProgressionTreeNodeType }", "when the full tree UI targets a node or choose-node alone leaves the blocker unresolved"),
          ],
          ["Read options from the live culture chooser before sending; some UI paths also set the culture target node, so use --closeout for one caller-level selection."],
        );
      }
      if (stringIncludes(haystack, "CHOOSE_GOVERNMENT")) {
        return hint(
          "government-choice",
          "player-operation",
          "CHANGE_GOVERNMENT",
          "{ GovernmentType, Action: Activate }",
          "game play choose-government",
          "official-ui",
          [requiredInput("GovernmentType", "live government picker option", "Use the government index from choose-government --options, not the visible row position.")],
          [
            action("read government options", "game play choose-government --options --json", undefined, undefined, "enabled starting governments with validation and ready send templates", "before choosing a government"),
            action("choose government", "game play choose-government --government-type <government-type> --action <action> --send", "player-operation", "CHANGE_GOVERNMENT", "{ GovernmentType, Action: Activate }", "after reading the live government option"),
          ],
          ["Read options from the live government picker before sending; the option surface includes celebration effects for context."],
        );
      }
      if (stringIncludes(haystack, "CHOOSE_GOLDEN_AGE")) {
        return hint(
          "celebration-choice",
          "player-operation",
          "CHOOSE_GOLDEN_AGE",
          "{ GoldenAgeType }",
          "game play choose-celebration",
          "official-ui",
          [requiredInput("GoldenAgeType", "live celebration chooser option", "Use the GoldenAgeType hash from choose-celebration --options, not old examples or visible row position.")],
          [
            action("read celebration options", "game play choose-celebration --options --json", undefined, undefined, "enabled celebration choices with validation and ready send templates", "before choosing a celebration"),
            action("choose celebration", "game play choose-celebration --golden-age-type <golden-age-type> --send", "player-operation", "CHOOSE_GOLDEN_AGE", "{ GoldenAgeType }", "after reading the live celebration option"),
          ],
          ["Read options from the live celebration chooser before sending; this blocker is not dismissible and should not use notification dismissal."],
        );
      }
      if (stringIncludes(haystack, "NEW_POPULATION")) {
        return hint(
          "population-placement",
          undefined,
          undefined,
          "ASSIGN_WORKER { Location, Amount: 1 } or city-command EXPAND placement args",
          "game play ready-city",
          "official-ui",
          [
            requiredInput("Location", "chosen plot", "The plot choice determines worker assignment vs expansion."),
            optionalInput("City", "notification target or selected city", "Needed when the branch is city expansion rather than worker reassignment."),
          ],
          [
            action("read city placement candidates", "game play ready-city --compact --json", "read-only", "ready-city population placement packet", "workable plots and expansion candidates", "before choosing assign-worker or expand-city"),
            action("assign worker to proven plot", "game play assign-worker --player-id <id> --location <plot-index>", "player-operation", "ASSIGN_WORKER", "{ Location, Amount: 1 }", "when the chosen tile is already workable"),
            action("validate city expansion", "game play expand-city --city-id '<city-id>' --x <x> --y <y>", "city-command", "EXPAND", "{ X, Y }", "when the chosen tile is an expansion purchase"),
          ],
          ["The notification opens acquire-tile mode; the clicked plot determines whether worker assignment or expansion fires. Re-read candidates before choosing either branch."],
        );
      }
      if (stringIncludes(haystack, "ASSIGN_NEW_RESOURCES") || stringIncludes(haystack, "RESOURCE ASSIGNMENTS")) {
        return hint(
          "resource-assignment",
          undefined,
          undefined,
          "screen-resource-allocation",
          undefined,
          "official-ui",
          [
            requiredInput("Resource allocation screen", "official notification handler", "The handler opens screen-resource-allocation; current wrapper support is inspection-only."),
            requiredInput("Available resources and settlement slots", "resource allocation UI or future dedicated read", "Do not dismiss this blocker as an informational report until assignment/closeout behavior is proven."),
          ],
          [
            action("inspect materialized notifications", "game play notifications --json", undefined, undefined, undefined, "before deciding whether a resource-assignment shortcut exists"),
          ],
          ["NOTIFICATION_ASSIGN_NEW_RESOURCES opens the official resource allocation screen. No validator-backed resource assignment shortcut is proven yet, so treat this as a real decision surface."],
        );
      }
      if (stringIncludes(haystack, "TOWN_PROJECT")) {
        return hint(
          "town-focus",
          "city-command",
          "CHANGE_GROWTH_MODE",
          "{ Type, ProjectType, City }",
          "game play set-town-focus",
          "live-proof",
          [
            requiredInput("City", "notification target or selected city", "Use the city ComponentID, not only the numeric city id, for the CLI shortcut."),
            requiredInput("Type", "live town focus option", "Growth mode enum from the town project UI."),
            requiredInput("ProjectType", "live town focus option", "Paired project enum for the selected focus."),
          ],
          [
            action("set town focus and close review", "game play set-town-focus --city-id '<city-id>' --growth-type <type> --project-type <project-type> --send --closeout", "sequence", "CHANGE_GROWTH_MODE then CONSIDER_TOWN_PROJECT", "{ Type, ProjectType, City } then {}", "when the selected focus should be applied and the blocker closed as one caller workflow"),
            action("set town focus", "game play set-town-focus --city-id '<city-id>' --growth-type <type> --project-type <project-type>", "city-command", "CHANGE_GROWTH_MODE", "{ Type, ProjectType, City }", "when only validation or a single focus operation is wanted"),
            action("close reviewed town project", "game play consider-town-project --city-id '<city-id>'", "city-operation", "CONSIDER_TOWN_PROJECT", "{}", "after the focus has already been set and the UI still needs closeout"),
          ],
          ["Town focus is not city-operation BUILD; use --closeout when one caller action should apply the focus and clear the review surface."],
        );
      }
      if (stringIncludes(haystack, "CHOOSE_CITY_PRODUCTION") || stringIncludes(haystack, "PRODUCTION")) {
        return hint(
          "production-choice",
          "city-operation",
          "BUILD",
          "{ UnitType } or { ConstructibleType, X?, Y? } or { ProjectType }",
          "game play ready-city",
          "live-proof",
          [
            requiredInput("City", "notification target or selected city", "Production choices are city-scoped."),
            requiredInput("Build item type", "live production chooser", "Choose exactly one of UnitType, ConstructibleType, or ProjectType."),
            optionalInput("Placement plot", "validator Plots or placement UI", "Required for constructibles when validation returns placement plots; send X/Y with the ConstructibleType."),
          ],
          [
            action("read production candidates", "game play ready-city --compact --json", "read-only", "ready-city production candidate packet", "city summary and validated production candidates", "before choosing a production item"),
            action("validate production", "game play build-production --city-id '<city-id>' --unit-type <unit-type>", "city-operation", "BUILD", "{ UnitType }", "when the live choice is a unit"),
            action("place constructible production", "game play build-production --city-id '<city-id>' --constructible-type <constructible-type> --x <x> --y <y>", "city-operation", "BUILD", "{ ConstructibleType, X, Y }", "when validator or placement UI returns legal placement plots"),
            action("validate city project production", "game play build-production --city-id '<city-id>' --project-type <project-type>", "city-operation", "BUILD", "{ ProjectType }", "when the live choice is an ordinary city project, not town focus"),
          ],
          ["Use live chooser data to decide the item kind; constructible placement needs X/Y when the validator returns legal plots."],
        );
      }
      if (stringIncludes(haystack, "PLAYER_MET") || stringIncludes(haystack, "FIRST_MEET")) {
        return hint(
          "first-meet-diplomacy",
          "player-operation",
          "RESPOND_DIPLOMATIC_FIRST_MEET",
          "{ Player1, Player2, Type }",
          "game play respond-first-meet",
          "live-proof",
          [
            requiredInput("Player1", "local player id", "Usually the same value used as --player-id."),
            requiredInput("Player2", "met player id", "Read this from the live first-meet notification or diplomacy panel."),
            requiredInput("Type", "chosen first-meet greeting", "Use the first-meet response enum from the live UI, not ordinary Support/Accept/Reject diplomacy response enums."),
          ],
          [
            action("send neutral first-meet greeting", "game play respond-first-meet --player-id <id> --met-player-id <other-player-id> --response neutral", "player-operation", "RESPOND_DIPLOMATIC_FIRST_MEET", "{ Player1, Player2, Type }", "after validating the greeting options from the live first-meet UI"),
          ],
          ["First-meet greetings are real player operations, not notification dismissals. Neutral is the conservative default when Influence cost or strategic payoff is not proven."],
        );
      }
      if ((stringIncludes(haystack, "RESPOND") || stringIncludes(haystack, "RESPONSE")) && stringIncludes(haystack, "DIPLO")) {
        return hint(
          "diplomacy-response",
          "player-operation",
          "RESPOND_DIPLOMATIC_ACTION",
          "{ ID, Type }",
          "game play respond-diplomacy",
          "live-proof",
          [
            requiredInput("ID", "live diplomatic action", "This is the diplomatic action id, not the notification ComponentID."),
            requiredInput("Type", "chosen diplomatic response", "Use one enabled response option returned in notification details; do not infer enum values from stale notes."),
          ],
          [
            action("choose diplomacy response and close blocker", "game play respond-diplomacy --action-id <action-id> --response-type <response-type> --notification-id '<notification-id>' --send", "player-operation", "RESPOND_DIPLOMATIC_ACTION", "{ ID, Type }", "after choosing one enabled response option from notification details"),
            action("validate diplomacy response", "game play respond-diplomacy --action-id <action-id> --response-type <response-type>", "player-operation", "RESPOND_DIPLOMATIC_ACTION", "{ ID, Type }", "for dry-run validation only"),
          ],
          ["Use the enabled option list from the live notification details; send mode follows the official local-player response panel path and verifies notification/turn closeout."],
        );
      }
      if (stringIncludes(haystack, "DIPLOMATIC_ACTION_LOW")) {
        return hint(
          "informational-notification",
          "app-ui-action",
          "Game.Notifications.dismiss",
          "{ notificationId }",
          "game play dismiss-notification",
          "official-ui",
          [requiredInput("Notification", "notification ComponentID", "Use the live notification id; this is not a diplomatic action response id.")],
          [
            action("dismiss reviewed diplomatic completion", "game play dismiss-notification --target '<notification-id>' --send", "app-ui-action", "Game.Notifications.dismiss", "{ notificationId }", "after confirming the notification only reports a completed low-severity diplomatic action"),
          ],
          ["The official notification train does not register a specialized handler for NOTIFICATION_DIPLOMATIC_ACTION_LOW; it falls through to the default notification handler, so closeout is App UI dismissal after review."],
        );
      }
      const diplomaticActionReport = diplomacyActionReportDetailsFor(notification, typeName, null);
      if (diplomaticActionReport?.classification === "diplomatic-action-report-no-enabled-response-options") {
        return hint(
          "informational-notification",
          "app-ui-action",
          "Game.Notifications.dismiss",
          "{ notificationId }",
          "game play dismiss-notification",
          "official-ui",
          [requiredInput("Notification", "notification ComponentID", "Use the live notification id; this is not a diplomatic response id.")],
          [
            action("dismiss reviewed diplomatic action report", "game play dismiss-notification --target '<notification-id>' --send", "app-ui-action", "Game.Notifications.dismiss", "{ notificationId }", "after reviewing the event data/location and confirming getResponseDataForUI exposes no enabled response option"),
          ],
          ["NOTIFICATION_DIPLOMATIC_ACTION can point at a real diplomatic event id, but empty/no-enabled getResponseDataForUI options make it a reviewed report closeout rather than RESPOND_DIPLOMATIC_ACTION."],
        );
      }
      if (stringIncludes(typeName, "DIPLOMATIC_ACTION")
        && !stringIncludes(typeName, "DIPLOMATIC_RESPONSE_REQUIRED")
        && !stringIncludes(typeName, "DIPLOMATIC_ACTION_WARNING")
        && !stringIncludes(typeName, "DIPLOMATIC_ACTION_ESPIONAGE")
        && !isValidComponentId(notification?.Target)
        && (stringIncludes(haystack, "RELATIONSHIP") || stringIncludes(haystack, "AGENDA"))) {
        return hint(
          "informational-notification",
          "app-ui-action",
          "Game.Notifications.dismiss",
          "{ notificationId }",
          "game play dismiss-notification",
          "official-ui",
          [requiredInput("Notification", "notification ComponentID", "Use the live notification id; this is not a diplomatic action response id.")],
          [
            action("dismiss reviewed diplomatic relationship notice", "game play dismiss-notification --target '<notification-id>' --send", "app-ui-action", "Game.Notifications.dismiss", "{ notificationId }", "after reviewing the relationship/agenda context and confirming the notification target is not a valid diplomatic action id"),
          ],
          ["Agenda and relationship reports can arrive as NOTIFICATION_DIPLOMATIC_ACTION with an invalid target. Review the report for strategy, then use App UI dismissal; do not send RESPOND_DIPLOMATIC_ACTION without a valid action id."],
        );
      }
      if (stringIncludes(haystack, "UNIT_ATTACKED")
        || stringIncludes(haystack, "UNIT_LOST")
        || stringIncludes(haystack, "DISTRICT_ATTACKED")
        || stringIncludes(haystack, "VOLCANO_ACTIVE")
        || stringIncludes(haystack, "VOLCANO_INACTIVE")
        || stringIncludes(haystack, "VOLCANO_ERUPTS")
        || stringIncludes(haystack, "RIVER_FLOODS")
        || stringIncludes(haystack, "STORM_ARRIVED")
        || stringIncludes(haystack, "STORM_MOVED")
        || stringIncludes(haystack, "STORM_DISSIPATED")) {
        return hint(
          "informational-notification",
          "app-ui-action",
          "Game.Notifications.dismiss",
          "{ notificationId }",
          "game play dismiss-notification",
          "official-ui",
          [requiredInput("Notification", "notification ComponentID", "Use the live notification id; this is not an operation target.")],
          [
            action("dismiss reviewed notification", "game play dismiss-notification --target '<notification-id>' --send", "app-ui-action", "Game.Notifications.dismiss", "{ notificationId }", "after reviewing the reported attack/disaster location and confirming no specialized decision surface is required"),
          ],
          ["Unit combat and natural-disaster report notifications use the default notification handler; activation looks at the reported plot when present, while closeout is App UI dismissal after the report is reviewed."],
        );
      }
      if (stringIncludes(haystack, "WONDER_COMPLETED") || stringIncludes(haystack, "WONDER_FAILED")) {
        return hint(
          "informational-notification",
          "app-ui-action",
          "Game.Notifications.dismiss",
          "{ notificationId }",
          "game play dismiss-notification",
          "official-ui",
          [requiredInput("Notification", "notification ComponentID", "Use the live notification id; this is not an operation target.")],
          [
            action("dismiss reviewed notification", "game play dismiss-notification --target '<notification-id>' --send", "app-ui-action", "Game.Notifications.dismiss", "{ notificationId }", "after confirming the notification only reports completed/failed wonder information"),
          ],
          ["Wonder completed/failed uses the default notification handler; the live target may be invalid, so activation only looks at a plot when one exists."],
        );
      }
      if (stringIncludes(haystack, "LEGACY_COMPLETED")) {
        return hint(
          "informational-notification",
          "app-ui-action",
          "Game.Notifications.dismiss",
          "{ notificationId }",
          "game play dismiss-notification",
          "official-ui",
          [requiredInput("Notification", "notification ComponentID", "Use the live notification id; this is not an operation target.")],
          [
            action("dismiss reviewed legacy completion report", "game play dismiss-notification --target '<notification-id>' --send", "app-ui-action", "Game.Notifications.dismiss", "{ notificationId }", "after reviewing the completed legacy/triumph report for score context"),
            action("read current legacy progress", "game play progress-dashboard --compact --json", "read-only", "progress-dashboard", "legacy path scores and age progress", "when the report should be compared with local-player progress before dismissal"),
          ],
          ["Runtime NOTIFICATION_LEGACY_COMPLETED reports completed legacy/triumph context. No specialized operation surface is proven; review the score context, then close through App UI dismissal when canUserDismiss is true."],
        );
      }
      if (stringIncludes(haystack, "GRIEVANCES_AGAINST_YOU")) {
        return hint(
          "informational-notification",
          "app-ui-action",
          "Game.Notifications.dismiss",
          "{ notificationId }",
          "game play dismiss-notification",
          "official-ui",
          [requiredInput("Notification", "notification ComponentID", "Use the live notification id; this is not a diplomatic action id.")],
          [
            action("dismiss reviewed grievance notice", "game play dismiss-notification --target '<notification-id>' --send", "app-ui-action", "Game.Notifications.dismiss", "{ notificationId }", "after confirming the notification reports grievance/influence information and exposes no response operation"),
          ],
          ["Grievance-against-you reports can block the UI queue but are not RESPOND_DIPLOMATIC_ACTION choices; review the summary for strategic context, then use App UI dismissal if canUserDismiss is true."],
        );
      }
      if (stringIncludes(haystack, "NARRATIVE") || stringIncludes(haystack, "DISCOVERY_STORY")) {
        return hint(
          "narrative-choice",
          "player-operation",
          "CHOOSE_NARRATIVE_STORY_DIRECTION",
          "{ TargetType, Target, Action }",
          "game play choose-narrative",
          "live-proof",
          [
            requiredInput("Target", "notification target or story UI targetStoryId", "Usually the story ComponentID from the notification target."),
            requiredInput("TargetType", "story option button", "If no story links exist, official UI uses CLOSE as the option key."),
            requiredInput("Action", "story option activation", "Official narrative UI sends PlayerOperationParameters.Activate."),
          ],
          [
            action("read narrative options", "game play choose-narrative --options --json", undefined, undefined, "enabled narrative buttons with validation and ready send templates", "before choosing a narrative branch or closeout"),
            action("validate narrative choice", "game play choose-narrative --player-id <id> --target-type <target-type> --target '<target>' --action <action>", "player-operation", "CHOOSE_NARRATIVE_STORY_DIRECTION", "{ TargetType, Target, Action }", "after reading the option key and activation from the story UI"),
          ],
          ["Use the option reader before sending; the notification target can be invalid because official narrative UI derives the target story from Players.Stories. If no pending story id is present, do not synthesize a narrative operation; inspect dismissal postcondition evidence separately."],
        );
      }
      if (stringIncludes(haystack, "TRADITION")) {
        return hint(
          "tradition-review",
          "player-operation",
          "CHANGE_TRADITION",
          "{ TraditionType, Action } then CONSIDER_ASSIGN_TRADITIONS {}",
          "game play traditions",
          "live-proof",
          [
            requiredInput("TraditionType", "live tradition chooser", "Pick the tradition enum that is being activated or deactivated."),
            requiredInput("Action", "live tradition action", "Use the activate/deactivate action enum from the tradition UI."),
          ],
          [
            action("read tradition options", "game play traditions --compact --json", "read-only", "Players.Culture tradition slot/candidate packet", "active and available traditions with action templates", "before choosing a tradition activation or deactivation"),
            action("change tradition and close review", "game play change-tradition --player-id <id> --tradition-type <tradition-type> --action <action> --send --closeout", "sequence", "CHANGE_TRADITION then CONSIDER_ASSIGN_TRADITIONS", "{ TraditionType, Action } then {}", "when a specific tradition slot change should be applied and the blocker closed as one caller workflow"),
            action("change tradition", "game play change-tradition --player-id <id> --tradition-type <tradition-type> --action <action>", "player-operation", "CHANGE_TRADITION", "{ TraditionType, Action }", "when only validation or a single tradition operation is wanted"),
            action("close tradition review", "game play consider-traditions --player-id <id>", "player-operation", "CONSIDER_ASSIGN_TRADITIONS", "{}", "after valid assignments are already in place"),
          ],
          ["Full slots may need deactivate, activate, then closeout; use --closeout on the final selected change when one caller action should clear the review surface."],
        );
      }
      if (stringIncludes(haystack, "ATTRIBUTE")) {
        return hint(
          "attribute-review",
          "player-operation",
          "BUY_ATTRIBUTE_TREE_NODE",
          "{ ProgressionTreeNodeType } then CONSIDER_ASSIGN_ATTRIBUTE {}",
          "game play buy-attribute",
          "live-proof",
          [requiredInput("ProgressionTreeNodeType", "live attribute tree node", "Use the buyable attribute node id from the runtime tree.")],
          [
            action("buy attribute and close review", "game play buy-attribute --player-id <id> --node <node> --send --closeout", "sequence", "BUY_ATTRIBUTE_TREE_NODE then CONSIDER_ASSIGN_ATTRIBUTE", "{ ProgressionTreeNodeType } then {}", "when a buyable node should be purchased and the blocker closed as one caller workflow"),
            action("buy attribute node", "game play buy-attribute --player-id <id> --node <node>", "player-operation", "BUY_ATTRIBUTE_TREE_NODE", "{ ProgressionTreeNodeType }", "when only validation or a single attribute operation is wanted"),
            action("close attribute review", "game play consider-attributes --player-id <id>", "player-operation", "CONSIDER_ASSIGN_ATTRIBUTE", "{}", "after no attribute purchase is needed or after buying"),
          ],
          ["Use --closeout when one caller action should buy the node and clear the review surface."],
        );
      }
      if (stringIncludes(haystack, "ADVISOR") || stringIncludes(haystack, "WARNING")) {
        return hint(
          "advisor-warning",
          "player-operation",
          "VIEWED_ADVISOR_WARNING",
          "{ Target: notificationComponentId }",
          "game play advisor-warning",
          "live-proof",
          [requiredInput("Target", "notification ComponentID", "Use the notification id itself as Target.")],
          [
            action("mark advisor warning viewed", "game play advisor-warning --player-id <id> --target '<notification-id>'", "player-operation", "VIEWED_ADVISOR_WARNING", "{ Target: notificationComponentId }", "when the warning has been inspected"),
          ],
          ["Do not use raw notification dismissal for advisor blockers."],
        );
      }
      if (stringIncludes(haystack, "COMMAND_UNITS") || stringIncludes(haystack, "UNITS")) {
        return hint(
          "unit-command",
          "unit-operation",
          "SKIP_TURN",
          "selected/ready unit id plus operation-specific args",
          "game play operation --family unit",
          "heuristic",
          [
            requiredInput("Unit", "selectedUnitId, firstReadyUnitId, or unit-command-reconciliation details", "Use the ready unit when present; if the ready pointer is stale, use a validator-backed reconciliation candidate."),
            optionalInput("Target plot", "map coordinates", "Needed for move, attack, and other plot-target actions."),
          ],
          [
            action("read ready-unit view", "game play ready-unit --json", undefined, undefined, "selected/first ready unit, legal operations, nearby occupied plots", "before choosing a unit operation"),
            action("resolve plot target", "game play unit-target --unit-id '<unit-id>' --x <x> --y <y>", "unit-operation", undefined, "official right-click action order", "when choosing a move or attack target"),
            action("validate generic unit operation", "game play operation --family unit --type <operation> --unit-id '<unit-id>' --args '<args>'", "unit-operation", "<operation>", "operation-specific args", "when the operation is not covered by a named shortcut"),
          ],
          [
            "Read the selected or first ready unit before choosing skip, automate, move, or promote.",
            "If selectedUnitId and firstReadyUnitId are stale or null, notification details may expose validator-backed SKIP_TURN reconciliation candidates with exact unit ids.",
          ],
        );
      }
      return hint(
        isBlocking ? "blocking-notification" : "notification",
        undefined,
        undefined,
        undefined,
        undefined,
        "heuristic",
        [requiredInput("Notification handler evidence", "official UI handler or live runtime surface", "Unclassified notifications need handler inspection before sending operations.")],
        [
          action("inspect materialized notifications", "game play notifications --json", undefined, undefined, undefined, "before deciding whether this is a real blocker"),
          action("validate generic operation", "game play operation --family <family> --type <type> --args '<args>'", undefined, undefined, "operation-specific args", "only after the official handler or live UI proves the operation"),
        ],
        ["No specialized shortcut is known; inspect official UI handler or use validate-only generic operation."],
      );
    };
    const summarizeNotification = (id, blockingKey) => {
      const notification = Game.Notifications.find(id);
      const type = (() => {
        try {
          return typeof Game.Notifications.getType === "function"
            ? Game.Notifications.getType(id)
            : notification?.Type ?? null;
        } catch {
          return notification?.Type ?? null;
        }
      })();
      const typeName = (() => {
        try {
          return typeof Game.Notifications.getTypeName === "function"
            ? Game.Notifications.getTypeName(type)
            : null;
        } catch {
          return null;
        }
      })();
      const normalizedId = toComponentId(id);
      const isEndTurnBlocking = normalizedId != null && componentKey(normalizedId) === blockingKey;
      const summary = (() => {
        try {
          return typeof Game.Notifications.getSummary === "function"
            ? Game.Notifications.getSummary(id) ?? null
            : safeNotificationValue(notification, "Summary");
        } catch {
          return safeNotificationValue(notification, "Summary");
        }
      })();
      const message = (() => {
        try {
          return typeof Game.Notifications.getMessage === "function"
            ? Game.Notifications.getMessage(id) ?? null
            : safeNotificationValue(notification, "Message");
        } catch {
          return safeNotificationValue(notification, "Message");
        }
      })();
      return {
        id: normalizedId,
        type,
        typeName,
        groupType: safeNotificationValue(notification, "GroupType"),
        player: safeNotificationValue(notification, "Player"),
        summary,
        message,
        target: safeNotificationValue(notification, "Target"),
        location: safeNotificationValue(notification, "Location"),
        canUserDismiss: safeNotificationValue(notification, "CanUserDismiss"),
        expired: safeNotificationValue(notification, "Expired"),
        dismissed: safeNotificationValue(notification, "Dismissed"),
        isEndTurnBlocking,
        decision: decisionHintFor(notification, typeName, isEndTurnBlocking),
        details: detailsFor(notification, typeName, normalizedId),
      };
    };
    const readPlayNotifications = (input) => {
      const maxNotifications = Math.max(1, Math.min(input.maxNotifications ?? 25, 100));
      const localPlayerId = GameContext.localPlayerID;
      const blocker = probe(() => Game.Notifications.getEndTurnBlockingType(localPlayerId));
      const blockingNotificationId = probe(() => {
        const blockerValue = blocker.ok ? blocker.value : Game.Notifications.getEndTurnBlockingType(localPlayerId);
        const id = Game.Notifications.findEndTurnBlocking(localPlayerId, blockerValue);
        return toComponentId(id);
      });
      const ids = notificationIdsForPlayer(localPlayerId, maxNotifications + 1);
      if (blockingNotificationId.ok) pushUniqueId(ids, blockingNotificationId.value);
      const truncated = ids.length > maxNotifications;
      const selected = ids.slice(0, maxNotifications);
      const blockingKey = blockingNotificationId.ok ? componentKey(blockingNotificationId.value) : "";
      const notifications = selected.map((id) => summarizeNotification(id, blockingKey));
      const decisions = [];
      for (const notification of notifications) {
        const key = JSON.stringify(notification.decision);
        if (!decisions.some((existing) => JSON.stringify(existing) === key)) decisions.push(notification.decision);
      }
      const toDecisionQueueItem = (notification) => ({
        notificationId: notification.id,
        isEndTurnBlocking: notification.isEndTurnBlocking,
        typeName: notification.typeName,
        summary: notification.summary,
        message: notification.message,
        target: notification.target,
        location: notification.location,
        player: notification.player,
        category: notification.decision.category,
        operationFamily: notification.decision.operationFamily,
        operationType: notification.decision.operationType,
        argsShape: notification.decision.argsShape,
        cli: notification.decision.cli,
        requiredInputs: notification.decision.requiredInputs,
        commonActions: notification.decision.commonActions,
        notes: notification.decision.notes,
        details: notification.details,
      });
      const decisionQueue = notifications
        .slice()
        .sort((left, right) => Number(right.isEndTurnBlocking) - Number(left.isEndTurnBlocking))
        .map(toDecisionQueueItem);
      return {
        localPlayerId,
        turn: probe(() => Game.turn),
        turnDate: probe(() => Game.getTurnDate()),
        hasSentTurnComplete: probe(() => GameContext.hasSentTurnComplete()),
        canEndTurn: probe(() => typeof canEndTurn === "function" ? canEndTurn() : false),
        blocker,
        blockingNotificationId,
        selectedUnitId: probe(() => toComponentId(UI?.Player?.getHeadSelectedUnit?.())),
        selectedCityId: probe(() => toComponentId(UI?.Player?.getHeadSelectedCity?.())),
        firstReadyUnitId: probe(() => toComponentId(UI?.Player?.getFirstReadyUnit?.())),
        notifications,
        decisions,
        hud: {
          nextDecision: decisionQueue[0] ?? null,
          decisionQueue,
        },
        limits: { maxNotifications, truncated },
      };
    };`;
}

const defaultPlayNotificationViewDependencies: PlayNotificationViewDependencies = {
  executeAppUiCommand: executeCiv7AppUiCommand,
  parsePlayNotificationView: (result, label) =>
    jsonPayloadFromCommandResult<Civ7PlayNotificationViewResult>(result, label),
};
