import { Civ7DirectControlError } from "../direct-control-error.js";
import type { Civ7ComponentId } from "../civ7-component-id.js";
import type { Civ7RuntimeProbe } from "../runtime/probe.js";
import type {
  Civ7CommandResult,
  Civ7DirectControlOptions,
  Civ7TunerState,
} from "../session/types.js";

import type {
  Civ7ActionApproval,
  Civ7PlayNotificationSummary,
  Civ7PlayNotificationViewResult,
} from "../index.js";

export type Civ7TurnCompletionStatusResult = Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
  localPlayerId: number;
  turn: Civ7RuntimeProbe<number>;
  turnDate: Civ7RuntimeProbe<string>;
  hasSentTurnComplete: Civ7RuntimeProbe<boolean>;
  canEndTurn: Civ7RuntimeProbe<boolean>;
  blocker: Civ7RuntimeProbe<unknown>;
  firstReadyUnitId: Civ7RuntimeProbe<Civ7ComponentId | null>;
}>;

export type Civ7TurnCompletionActionResult = Readonly<{
  before: Civ7TurnCompletionStatusResult;
  after: Civ7TurnCompletionStatusResult;
  command: Civ7CommandResult;
  verified: boolean;
}>;

type TurnCompletionDependencies = Readonly<{
  assertApproved: (approval: Civ7ActionApproval, action: string) => void;
  executeAppUiCommand: (
    options: Civ7DirectControlOptions & Readonly<{ command: string }>,
  ) => Promise<Civ7CommandResult>;
  getPlayNotificationView: (options: Civ7DirectControlOptions) => Promise<Civ7PlayNotificationViewResult>;
  parseTurnCompletionStatus: (
    result: Civ7CommandResult,
    label: string,
  ) => Civ7TurnCompletionStatusResult;
}>;

export async function getCiv7TurnCompletionStatus(
  options: Civ7DirectControlOptions = {},
  dependencies: Pick<TurnCompletionDependencies, "executeAppUiCommand" | "parseTurnCompletionStatus">,
): Promise<Civ7TurnCompletionStatusResult> {
  const result = await dependencies.executeAppUiCommand({
    ...options,
    command: buildTurnCompletionStatusCommand(),
  });
  return dependencies.parseTurnCompletionStatus(result, "Civ7 turn completion status");
}

export async function sendCiv7TurnComplete(
  options: Civ7DirectControlOptions = {},
  approval: Civ7ActionApproval,
  dependencies: TurnCompletionDependencies,
): Promise<Civ7TurnCompletionActionResult> {
  dependencies.assertApproved(approval, "sending Civ7 turn complete");
  const before = await getCiv7TurnCompletionStatus(options, dependencies);
  const fallbackPreflight = probeValue(before.canEndTurn) === true
    ? undefined
    : await dependencies.getPlayNotificationView(options);
  if (!isTurnCompletionAllowed(before, fallbackPreflight)) {
    throw new Civ7DirectControlError("command-failed", "Civ7 turn complete is blocked by current game state", {
      details: { before, fallbackPreflight },
    });
  }
  const command = await dependencies.executeAppUiCommand({
    ...options,
    command: "GameContext.sendTurnComplete()",
  });
  const after = await getCiv7TurnCompletionStatus(options, dependencies);
  const verified = probeValue(after.hasSentTurnComplete) === true || probeValue(after.turn) !== probeValue(before.turn);
  return { before, after, command, verified };
}

export async function sendCiv7TurnUnready(
  options: Civ7DirectControlOptions = {},
  approval: Civ7ActionApproval,
  dependencies: TurnCompletionDependencies,
): Promise<Civ7TurnCompletionActionResult> {
  dependencies.assertApproved(approval, "sending Civ7 turn unready");
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

function probeHelperSource(): string {
  return `const probe = (fn) => {
      try {
        return { ok: true, value: fn() };
      } catch (err) {
        return { ok: false, error: String(err) };
      }
    };`;
}

function isTurnCompletionAllowed(
  status: Civ7TurnCompletionStatusResult,
  fallbackPreflight?: Civ7PlayNotificationViewResult,
): boolean {
  if (probeValue(status.canEndTurn) === true) return true;
  const cleanFallbackState = probeValue(status.hasSentTurnComplete) === false
    && probeValue(status.blocker) === 0
    && probeValue(status.firstReadyUnitId) === null;
  if (!cleanFallbackState) return false;
  if (fallbackPreflight === undefined) return false;
  const blockingNotifications = fallbackPreflight.notifications.filter((notification) => notification.isEndTurnBlocking);
  return blockingNotifications.every((notification) => isTurnCompletionFallbackNotification(notification, status));
}

function isTurnCompletionFallbackNotification(
  notification: Civ7PlayNotificationSummary,
  status: Civ7TurnCompletionStatusResult,
): boolean {
  const typeName = String(notification.typeName ?? "").toUpperCase();
  if (notification.decision.category === "unit-command" && typeName.includes("COMMAND_UNITS")) {
    return probeValue(status.blocker) === 0
      && probeValue(status.firstReadyUnitId) === null
      && notificationDetailsProveStaleCommandUnits(notification.details);
  }
  if (notification.decision.category === "informational-notification") {
    return notification.canUserDismiss === true && isTurnCompletionFallbackInformationalType(typeName);
  }
  return false;
}

function notificationDetailsProveStaleCommandUnits(details: unknown): boolean {
  if (!isRecord(details)) return false;
  const enabledCloseoutCandidates = details.enabledCloseoutCandidates;
  return details.kind === "unit-command-reconciliation"
    && details.classification === "unit-command-stale-expired"
    && details.staleExpiredWithoutEnabledCloseout === true
    && Array.isArray(enabledCloseoutCandidates)
    && enabledCloseoutCandidates.length === 0;
}

function isTurnCompletionFallbackInformationalType(typeName: string): boolean {
  return typeName === "NOTIFICATION_UNIT_ATTACKED"
    || typeName === "NOTIFICATION_DISTRICT_ATTACKED"
    || typeName === "NOTIFICATION_RIVER_FLOODS_SEV0"
    || typeName === "NOTIFICATION_RIVER_FLOODS_SEV1"
    || typeName === "NOTIFICATION_RIVER_FLOODS_SEV2"
    || typeName === "NOTIFICATION_STORM_ARRIVED"
    || typeName === "NOTIFICATION_STORM_MOVED"
    || typeName === "NOTIFICATION_STORM_DISSIPATED"
    || typeName === "NOTIFICATION_VOLCANO_ACTIVE"
    || typeName === "NOTIFICATION_VOLCANO_INACTIVE"
    || typeName === "NOTIFICATION_VOLCANO_ERUPTS_SEV0"
    || typeName === "NOTIFICATION_VOLCANO_ERUPTS_SEV1"
    || typeName === "NOTIFICATION_VOLCANO_ERUPTS_SEV2"
    || typeName === "NOTIFICATION_WONDER_COMPLETED"
    || typeName === "NOTIFICATION_WONDER_FAILED"
    || typeName === "NOTIFICATION_LEGACY_COMPLETED";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function probeValue<T>(probe: Civ7RuntimeProbe<T>): T | undefined {
  return probe.ok ? probe.value : undefined;
}
