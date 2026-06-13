import type { Civ7NarrativeChoiceResult } from "../play/operations/narrative-request.js";
import type { Civ7NarrativeChoicePostconditionClassification } from "../play/operations/narrative-postconditions.js";
import type {
  Civ7OperationProofBoundary,
  Civ7OperationTelemetryPostcondition,
  Civ7OperationTelemetryPostconditionOutcome,
} from "./operation-telemetry.js";

export function narrativeChoiceProofPostcondition(
  result: Civ7NarrativeChoiceResult,
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
      reason: "The narrative choice result did not include explicit postcondition evidence.",
      outcome: "unknown",
      noRepeatAfterUnverified: true,
      confidence: "unverified",
    };
  }
  if (!narrativeChoicePostconditionConfirmed(result.postcondition.classification)) {
    return {
      classification: result.postcondition.classification,
      reason: result.postcondition.reason,
      outcome: narrativeChoiceProofOutcome(result.postcondition.classification),
      noRepeatAfterUnverified: true,
      confidence: "unverified",
    };
  }
  return {
    classification: result.postcondition.classification,
    reason: result.postcondition.reason,
    outcome: narrativeChoiceProofOutcome(result.postcondition.classification),
    noRepeatAfterUnverified: false,
    confidence: "confirmed",
  };
}

export function narrativeChoicePostconditionConfirmed(
  classification: Civ7NarrativeChoicePostconditionClassification
): boolean {
  switch (classification) {
    case "turn-unblocked":
    case "narrative-blocker-cleared":
    case "narrative-panel-cleared":
      return true;
    case "not-sent":
    case "validation-changed":
    case "no-state-change":
      return false;
  }
}

export function narrativeChoiceProofOutcome(
  classification: Civ7NarrativeChoicePostconditionClassification
): Civ7OperationTelemetryPostconditionOutcome {
  switch (classification) {
    case "not-sent":
      return "not-sent";
    case "turn-unblocked":
    case "narrative-blocker-cleared":
      return "cleared";
    case "narrative-panel-cleared":
      return "state-changed";
    case "validation-changed":
      return "still-blocked";
    case "no-state-change":
      return "no-state-change";
  }
}
