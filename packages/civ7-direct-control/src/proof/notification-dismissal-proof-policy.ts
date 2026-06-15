import type { Civ7NotificationDismissalResult } from "../play/notifications/dismissal-request";
import {
  type Civ7NotificationDismissalPostconditionClassification,
  notificationDismissalPostconditionConfirmed,
} from "../play/notifications/postconditions";
import type {
  Civ7OperationProofBoundary,
  Civ7OperationTelemetryPostcondition,
  Civ7OperationTelemetryPostconditionOutcome,
} from "./operation-telemetry";

export function notificationDismissalProofPostcondition(
  result: Civ7NotificationDismissalResult,
  proofBoundary: Civ7OperationProofBoundary | undefined
): Civ7OperationTelemetryPostcondition | undefined {
  const postcondition = notificationDismissalPostconditionOf(result);
  if (!result.sent && !postcondition) return undefined;
  if (proofBoundary === "pending-runtime-proof") {
    return {
      classification: postcondition?.classification ?? "pending-runtime-proof",
      reason: postcondition?.reason ?? "Runtime postcondition proof is pending.",
      outcome: "unknown",
      noRepeatAfterUnverified: true,
      confidence: "pending-runtime-proof",
    };
  }
  if (!postcondition) {
    return {
      classification: "missing-postcondition",
      reason: "The notification dismissal result did not include explicit postcondition evidence.",
      outcome: "unknown",
      noRepeatAfterUnverified: true,
      confidence: "unverified",
    };
  }
  if (!notificationDismissalPostconditionConfirmed(postcondition.classification)) {
    return {
      classification: postcondition.classification,
      reason: postcondition.reason,
      outcome: notificationDismissalProofOutcome(postcondition.classification),
      noRepeatAfterUnverified: true,
      confidence: "unverified",
    };
  }
  return {
    classification: postcondition.classification,
    reason: postcondition.reason,
    outcome: notificationDismissalProofOutcome(postcondition.classification),
    noRepeatAfterUnverified: false,
    confidence: "confirmed",
  };
}

export function notificationDismissalProofOutcome(
  classification: Civ7NotificationDismissalPostconditionClassification
): Civ7OperationTelemetryPostconditionOutcome {
  switch (classification) {
    case "not-sent":
      return "not-sent";
    case "notification-disappeared":
    case "engine-queue-cleared":
    case "notification-train-cleared":
      return "cleared";
    case "notification-dismissed":
    case "engine-front-moved":
    case "notification-train-front-moved":
      return "state-changed";
    case "engine-front-still-live":
      return "stale";
    case "missing-after":
      return "unknown";
    case "no-state-change":
      return "no-state-change";
  }
}

function notificationDismissalPostconditionOf(
  result: Civ7NotificationDismissalResult
): Civ7NotificationDismissalResult["postcondition"] | undefined {
  return (result as { postcondition?: Civ7NotificationDismissalResult["postcondition"] })
    .postcondition;
}
