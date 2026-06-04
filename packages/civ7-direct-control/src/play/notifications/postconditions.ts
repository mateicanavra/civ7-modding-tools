import type { Civ7RuntimeProbe } from "../../runtime/probe.js";
import type { Civ7NotificationDismissalSummary } from "./dismissal-request.js";

export type Civ7NotificationDismissalPostconditionClassification =
  | "not-sent"
  | "missing-after"
  | "notification-disappeared"
  | "engine-front-still-live"
  | "notification-dismissed"
  | "engine-queue-cleared"
  | "notification-train-cleared"
  | "engine-front-moved"
  | "notification-train-front-moved"
  | "no-state-change";

export type Civ7NotificationDismissalPostcondition = Readonly<{
  classification: Civ7NotificationDismissalPostconditionClassification;
  reason: string;
}>;

export type Civ7NotificationDismissalPostconditionInput = Readonly<{
  sent: boolean;
  before: Civ7NotificationDismissalSummary;
  after: Civ7NotificationDismissalSummary | null;
}>;

export function notificationDismissalPostcondition(
  input: Civ7NotificationDismissalPostconditionInput,
): Civ7NotificationDismissalPostcondition {
  const classification = classifyNotificationDismissalPostcondition(input);
  return {
    classification,
    reason: notificationDismissalPostconditionReason(classification),
  };
}

export function classifyNotificationDismissalPostcondition(
  input: Civ7NotificationDismissalPostconditionInput,
): Civ7NotificationDismissalPostconditionClassification {
  if (!input.sent) return "not-sent";
  const { before, after } = input;
  if (after == null) return "missing-after";
  if (after.exists === false) return "notification-disappeared";
  if (probeValue(after.isEngineQueueFront) === true) return "engine-front-still-live";
  if (after.dismissed === true) return "notification-dismissed";
  if (probeValue(before.engineQueueContains) === true && probeValue(after.engineQueueContains) === false) {
    return "engine-queue-cleared";
  }
  if (probeValue(before.notificationTrainContains) === true && probeValue(after.notificationTrainContains) === false) {
    return "notification-train-cleared";
  }
  if (probeValue(before.isEngineQueueFront) === true && probeValue(after.isEngineQueueFront) === false) {
    return "engine-front-moved";
  }
  if (probeValue(before.isNotificationTrainFront) === true && probeValue(after.isNotificationTrainFront) === false) {
    return "notification-train-front-moved";
  }
  return "no-state-change";
}

export function notificationDismissalPostconditionConfirmed(
  classification: Civ7NotificationDismissalPostconditionClassification,
): boolean {
  switch (classification) {
    case "notification-disappeared":
    case "notification-dismissed":
    case "engine-queue-cleared":
    case "notification-train-cleared":
    case "engine-front-moved":
    case "notification-train-front-moved":
      return true;
    case "not-sent":
    case "missing-after":
    case "engine-front-still-live":
    case "no-state-change":
      return false;
  }
}

function notificationDismissalPostconditionReason(
  classification: Civ7NotificationDismissalPostconditionClassification,
): string {
  switch (classification) {
    case "not-sent":
      return "The notification dismissal was not sent, so no postcondition can be verified.";
    case "missing-after":
      return "The notification dismissal was sent without an after-read summary, so the outcome is unverified.";
    case "notification-disappeared":
      return "The target notification no longer exists after dismissal.";
    case "engine-front-still-live":
      return "The target notification still fronts the engine queue, so weaker dismissed/train evidence is treated as stale.";
    case "notification-dismissed":
      return "The target notification reports dismissed after dismissal and is not still the engine queue front.";
    case "engine-queue-cleared":
      return "The target notification was removed from the engine notification queue.";
    case "notification-train-cleared":
      return "The target notification was removed from the notification train.";
    case "engine-front-moved":
      return "The target notification moved off the engine queue front it occupied before dismissal.";
    case "notification-train-front-moved":
      return "The target notification moved off the notification train front it occupied before dismissal.";
    case "no-state-change":
      return "The dismissal was sent, but notification identity evidence did not confirm disappearance, queue removal, or front movement.";
  }
}

function probeValue<T>(probe: Civ7RuntimeProbe<T>): T | undefined {
  return probe.ok ? probe.value : undefined;
}
