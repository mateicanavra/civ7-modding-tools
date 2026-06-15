import type {
  Civ7ProgressionTargetPostcondition,
  Civ7ProgressionTargetPostconditionClassification,
  Civ7ProgressionTargetResult,
} from "../play/progression/target-request";

export type Civ7ProgressionTargetProofOutcome = "not-sent" | "unknown";

export type Civ7ProgressionTargetProofPostcondition = Readonly<{
  classification: Civ7ProgressionTargetPostconditionClassification;
  reason: string;
  outcome: Civ7ProgressionTargetProofOutcome;
  confidence: "pending-runtime-proof" | "unverified";
  noRepeatAfterUnverified: boolean;
}>;

export function progressionTargetProofPostcondition(
  result: Civ7ProgressionTargetResult
): Civ7ProgressionTargetProofPostcondition {
  return {
    classification: result.postcondition.classification,
    reason: result.postcondition.reason,
    outcome: progressionTargetProofOutcome(result.postcondition),
    confidence:
      result.postcondition.classification === "pending-runtime-proof"
        ? "pending-runtime-proof"
        : "unverified",
    noRepeatAfterUnverified: true,
  };
}

export function progressionTargetProofOutcome(
  postcondition: Civ7ProgressionTargetPostcondition
): Civ7ProgressionTargetProofOutcome {
  return postcondition.classification === "not-sent" ? "not-sent" : "unknown";
}
