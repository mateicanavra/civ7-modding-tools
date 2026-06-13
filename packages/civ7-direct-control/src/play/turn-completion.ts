import { Type, type Static } from "typebox";

import { Civ7DirectControlError } from "../direct-control-error.js";
import { Civ7ComponentIdSchema } from "../civ7-component-id.js";
import {
  getCiv7PlayNotificationView,
  type Civ7PlayNotificationSummary,
  type Civ7PlayNotificationViewResult,
} from "./notifications/view.js";
import { jsonPayloadFromCommandResult } from "../session/command-result.js";
import { executeCiv7AppUiCommand } from "../session/execute.js";
import {
  Civ7RuntimeProbeSchema,
  probeHelperSource,
  type Civ7RuntimeProbe,
} from "../runtime/probe.js";
import type { Civ7CommandResult, Civ7DirectControlOptions } from "../session/types.js";

const civ7TunerStateSchema = Type.Object(
  {
    id: Type.String(),
    name: Type.String(),
  },
  { additionalProperties: false }
);

const nullableComponentIdSchema = Type.Union([Civ7ComponentIdSchema, Type.Null()]);

export const Civ7TurnCompletionStatusInputSchema = Type.Object({}, { additionalProperties: false });
export type Civ7TurnCompletionStatusInput = Static<typeof Civ7TurnCompletionStatusInputSchema>;

export const Civ7TurnCompletionStatusResultSchema = Type.Object(
  {
    host: Type.String(),
    port: Type.Number(),
    state: civ7TunerStateSchema,
    localPlayerId: Type.Number(),
    turn: Civ7RuntimeProbeSchema(Type.Number()),
    turnDate: Civ7RuntimeProbeSchema(Type.String()),
    hasSentTurnComplete: Civ7RuntimeProbeSchema(Type.Boolean()),
    canEndTurn: Civ7RuntimeProbeSchema(Type.Boolean()),
    blocker: Civ7RuntimeProbeSchema(Type.Unknown()),
    firstReadyUnitId: Civ7RuntimeProbeSchema(nullableComponentIdSchema),
  },
  { additionalProperties: false }
);
export type Civ7TurnCompletionStatusResult = Readonly<
  Static<typeof Civ7TurnCompletionStatusResultSchema>
>;

export type Civ7TurnCompletionStatusDependencies = Readonly<{
  executeAppUiCommand: (
    options: Civ7DirectControlOptions & Readonly<{ command: string }>
  ) => Promise<Civ7CommandResult>;
  parseTurnCompletionStatus: (
    result: Civ7CommandResult,
    label: string
  ) => Civ7TurnCompletionStatusResult;
}>;

type TurnCompletionDependencies = Civ7TurnCompletionStatusDependencies &
  Readonly<{
    getPlayNotificationView: (
      options: Civ7DirectControlOptions
    ) => Promise<Civ7PlayNotificationViewResult>;
  }>;

export type Civ7TurnCompletionActionResult = Readonly<{
  before: Civ7TurnCompletionStatusResult;
  after: Civ7TurnCompletionStatusResult;
  command: Civ7CommandResult;
  verified: boolean;
}>;

export type Civ7TurnCompletionBlockedResult = Readonly<{
  sent: false;
  before: Civ7TurnCompletionStatusResult;
  fallbackPreflight?: Civ7PlayNotificationViewResult;
  reason: "turn-completion-blocked";
}>;

export type Civ7TurnCompletionRequestResult =
  | (Civ7TurnCompletionActionResult & Readonly<{ sent: true }>)
  | Civ7TurnCompletionBlockedResult;

export async function getCiv7TurnCompletionStatus(
  options: Civ7DirectControlOptions = {},
  dependencies: Civ7TurnCompletionStatusDependencies = defaultTurnCompletionDependencies
): Promise<Civ7TurnCompletionStatusResult> {
  const result = await dependencies.executeAppUiCommand({
    ...options,
    command: buildTurnCompletionStatusCommand(),
  });
  return dependencies.parseTurnCompletionStatus(result, "Civ7 turn completion status");
}

export async function sendCiv7TurnComplete(
  options: Civ7DirectControlOptions = {},
  dependencies: TurnCompletionDependencies = defaultTurnCompletionDependencies
): Promise<Civ7TurnCompletionActionResult> {
  const result = await requestCiv7TurnComplete(options, dependencies);
  if (!result.sent) {
    throw new Civ7DirectControlError(
      "command-failed",
      "Civ7 turn complete is blocked by current game state",
      {
        details: { before: result.before, fallbackPreflight: result.fallbackPreflight },
      }
    );
  }
  const { sent: _sent, ...action } = result;
  return action;
}

export async function requestCiv7TurnComplete(
  options: Civ7DirectControlOptions = {},
  dependencies: TurnCompletionDependencies = defaultTurnCompletionDependencies
): Promise<Civ7TurnCompletionRequestResult> {
  const before = await getCiv7TurnCompletionStatus(options, dependencies);
  const fallbackPreflight =
    probeValue(before.canEndTurn) === true
      ? undefined
      : await dependencies.getPlayNotificationView(options);
  if (!isTurnCompletionAllowed(before, fallbackPreflight)) {
    return fallbackPreflight === undefined
      ? { sent: false, before, reason: "turn-completion-blocked" }
      : {
          sent: false,
          before,
          fallbackPreflight,
          reason: "turn-completion-blocked",
        };
  }
  const command = await dependencies.executeAppUiCommand({
    ...options,
    command: "GameContext.sendTurnComplete()",
  });
  const after = await getCiv7TurnCompletionStatus(options, dependencies);
  const verified =
    probeValue(after.hasSentTurnComplete) === true ||
    probeValue(after.turn) !== probeValue(before.turn);
  return { sent: true, before, after, command, verified };
}

export async function sendCiv7TurnUnready(
  options: Civ7DirectControlOptions = {},
  dependencies: TurnCompletionDependencies = defaultTurnCompletionDependencies
): Promise<Civ7TurnCompletionActionResult> {
  const before = await getCiv7TurnCompletionStatus(options, dependencies);
  const command = await dependencies.executeAppUiCommand({
    ...options,
    command: "GameContext.sendUnreadyTurn()",
  });
  const after = await getCiv7TurnCompletionStatus(options, dependencies);
  return { before, after, command, verified: probeValue(after.hasSentTurnComplete) === false };
}

function buildTurnCompletionStatusCommand(): string {
  return `(() => {
    ${probeHelperSource()}
    return JSON.stringify({
      localPlayerId: GameContext.localPlayerID,
      turn: probe(() => Game.turn),
      turnDate: probe(() => Game.getTurnDate()),
      hasSentTurnComplete: probe(() => GameContext.hasSentTurnComplete()),
      canEndTurn: probe(() => typeof canEndTurn === "function" ? canEndTurn() : false),
      blocker: probe(() => typeof Game !== "undefined" && Game.Notifications && typeof Game.Notifications.getEndTurnBlockingType === "function"
        ? Game.Notifications.getEndTurnBlockingType(GameContext.localPlayerID)
        : "unknown"),
      firstReadyUnitId: probe(() => {
        const id = UI?.Player?.getFirstReadyUnit?.();
        if (!id || typeof id.owner !== "number" || typeof id.id !== "number") return null;
        const out = { owner: id.owner, id: id.id };
        if (typeof id.type === "number") out.type = id.type;
        return out;
      }),
    });
  })()`;
}

function isTurnCompletionAllowed(
  status: Civ7TurnCompletionStatusResult,
  fallbackPreflight?: Civ7PlayNotificationViewResult
): boolean {
  if (probeValue(status.canEndTurn) === true) return true;
  const cleanFallbackState =
    probeValue(status.hasSentTurnComplete) === false &&
    probeValue(status.blocker) === 0 &&
    probeValue(status.firstReadyUnitId) === null;
  if (!cleanFallbackState) return false;
  if (fallbackPreflight === undefined) return false;
  const blockingNotifications = fallbackPreflight.notifications.filter(
    (notification) => notification.isEndTurnBlocking
  );
  return blockingNotifications.every((notification) =>
    isTurnCompletionFallbackNotification(notification, status)
  );
}

function isTurnCompletionFallbackNotification(
  notification: Civ7PlayNotificationSummary,
  status: Civ7TurnCompletionStatusResult
): boolean {
  const typeName = String(notification.typeName ?? "").toUpperCase();
  if (notification.decision.category === "unit-command" && typeName.includes("COMMAND_UNITS")) {
    return (
      probeValue(status.blocker) === 0 &&
      probeValue(status.firstReadyUnitId) === null &&
      notificationDetailsProveStaleCommandUnits(notification.details)
    );
  }
  if (notification.decision.category === "informational-notification") {
    return (
      notification.canUserDismiss === true && isTurnCompletionFallbackInformationalType(typeName)
    );
  }
  return false;
}

function notificationDetailsProveStaleCommandUnits(details: unknown): boolean {
  if (!isRecord(details)) return false;
  const enabledCloseoutCandidates = details.enabledCloseoutCandidates;
  return (
    details.kind === "unit-command-reconciliation" &&
    details.classification === "unit-command-stale-expired" &&
    details.staleExpiredWithoutEnabledCloseout === true &&
    Array.isArray(enabledCloseoutCandidates) &&
    enabledCloseoutCandidates.length === 0
  );
}

function isTurnCompletionFallbackInformationalType(typeName: string): boolean {
  return (
    typeName === "NOTIFICATION_UNIT_ATTACKED" ||
    typeName === "NOTIFICATION_DISTRICT_ATTACKED" ||
    typeName === "NOTIFICATION_RIVER_FLOODS_SEV0" ||
    typeName === "NOTIFICATION_RIVER_FLOODS_SEV1" ||
    typeName === "NOTIFICATION_RIVER_FLOODS_SEV2" ||
    typeName === "NOTIFICATION_STORM_ARRIVED" ||
    typeName === "NOTIFICATION_STORM_MOVED" ||
    typeName === "NOTIFICATION_STORM_DISSIPATED" ||
    typeName === "NOTIFICATION_VOLCANO_ACTIVE" ||
    typeName === "NOTIFICATION_VOLCANO_INACTIVE" ||
    typeName === "NOTIFICATION_VOLCANO_ERUPTS_SEV0" ||
    typeName === "NOTIFICATION_VOLCANO_ERUPTS_SEV1" ||
    typeName === "NOTIFICATION_VOLCANO_ERUPTS_SEV2" ||
    typeName === "NOTIFICATION_WONDER_COMPLETED" ||
    typeName === "NOTIFICATION_WONDER_FAILED" ||
    typeName === "NOTIFICATION_LEGACY_COMPLETED"
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function probeValue<T>(probe: Civ7RuntimeProbe<T>): T | undefined {
  return probe.ok ? probe.value : undefined;
}

const defaultTurnCompletionDependencies: TurnCompletionDependencies = {
  executeAppUiCommand: executeCiv7AppUiCommand,
  getPlayNotificationView: getCiv7PlayNotificationView,
  parseTurnCompletionStatus: (result, label) =>
    jsonPayloadFromCommandResult<Civ7TurnCompletionStatusResult>(result, label),
};
