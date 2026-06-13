import type { Civ7DiplomacyResponseResult } from "../play/operations/diplomacy-request.js";
import type { Civ7DiplomacyResponsePostconditionClassification } from "../play/operations/diplomacy-postconditions.js";
import type {
  Civ7OperationProofBoundary,
  Civ7OperationTelemetryPostcondition,
  Civ7OperationTelemetryPostconditionOutcome,
} from "./operation-telemetry.js";

export function diplomacyResponseProofPostcondition(
  result: Civ7DiplomacyResponseResult,
  proofBoundary: Civ7OperationProofBoundary | undefined
): Civ7OperationTelemetryPostcondition | undefined {
  if (!result.sent && !result.postcondition) return undefined;
  if (proofBoundary === "pending-runtime-proof") {
    return {
      classification: result.postcondition?.classification ?? "pending-runtime-proof",
      reason: result.postcondition?.reason ?? "Runtime postcondition proof is pending.",
      outcome: "unknown",
      noRepeatAfterUnverified: true,
      confidence: "pending-runtime-proof",
    };
  }
  if (!result.postcondition) {
    return {
      classification: "missing-postcondition",
      reason: "The diplomacy response result did not include explicit postcondition evidence.",
      outcome: "unknown",
      noRepeatAfterUnverified: true,
      confidence: "unverified",
    };
  }
  if (!diplomacyResponsePostconditionConfirmed(result.postcondition.classification)) {
    return {
      classification: result.postcondition.classification,
      reason: result.postcondition.reason,
      outcome: diplomacyResponseProofOutcome(result.postcondition.classification),
      noRepeatAfterUnverified: true,
      confidence: "unverified",
    };
  }
  return {
    classification: result.postcondition.classification,
    reason: result.postcondition.reason,
    outcome: diplomacyResponseProofOutcome(result.postcondition.classification),
    noRepeatAfterUnverified: false,
    confidence: "confirmed",
  };
}

export function diplomacyResponsePostconditionConfirmed(
  classification: Civ7DiplomacyResponsePostconditionClassification
): boolean {
  switch (classification) {
    case "turn-unblocked":
    case "diplomacy-blocker-cleared":
    case "blocking-notification-changed":
      return true;
    case "not-sent":
    case "validation-changed":
    case "no-state-change":
      return false;
  }
}

export function diplomacyResponseProofOutcome(
  classification: Civ7DiplomacyResponsePostconditionClassification
): Civ7OperationTelemetryPostconditionOutcome {
  switch (classification) {
    case "not-sent":
      return "not-sent";
    case "turn-unblocked":
    case "diplomacy-blocker-cleared":
      return "cleared";
    case "blocking-notification-changed":
      return "state-changed";
    case "validation-changed":
      return "still-blocked";
    case "no-state-change":
      return "no-state-change";
  }
}
