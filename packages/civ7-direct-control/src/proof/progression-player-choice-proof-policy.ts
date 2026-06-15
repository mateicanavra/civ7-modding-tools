import type {
  Civ7ProgressionPlayerChoicePostcondition,
  Civ7ProgressionPlayerChoicePostconditionClassification,
  Civ7ProgressionPlayerChoiceResult,
} from "../play/progression/player-choice-request";

export type Civ7ProgressionPlayerChoiceProofOutcome = "not-sent" | "unknown";

export type Civ7ProgressionPlayerChoiceProofPostcondition = Readonly<{
  classification: Civ7ProgressionPlayerChoicePostconditionClassification;
  reason: string;
  outcome: Civ7ProgressionPlayerChoiceProofOutcome;
  confidence: "pending-runtime-proof" | "unverified";
  noRepeatAfterUnverified: boolean;
}>;

export function progressionPlayerChoiceProofPostcondition(
  result: Civ7ProgressionPlayerChoiceResult
): Civ7ProgressionPlayerChoiceProofPostcondition {
  return {
    classification: result.postcondition.classification,
    reason: result.postcondition.reason,
    outcome: progressionPlayerChoiceProofOutcome(result.postcondition),
    confidence:
      result.postcondition.classification === "pending-runtime-proof"
        ? "pending-runtime-proof"
        : "unverified",
    noRepeatAfterUnverified: true,
  };
}

export function progressionPlayerChoiceProofOutcome(
  postcondition: Civ7ProgressionPlayerChoicePostcondition
): Civ7ProgressionPlayerChoiceProofOutcome {
  return postcondition.classification === "not-sent" ? "not-sent" : "unknown";
}
