import type {
  Civ7GovernmentChoicePostcondition,
  Civ7GovernmentChoicePostconditionClassification,
  Civ7GovernmentDomainChoiceResult,
} from "../play/government/choice-request";

export type Civ7GovernmentChoiceProofOutcome = "not-sent" | "unknown";

export type Civ7GovernmentChoiceProofPostcondition = Readonly<{
  classification: Civ7GovernmentChoicePostconditionClassification;
  reason: string;
  outcome: Civ7GovernmentChoiceProofOutcome;
  confidence: "pending-runtime-proof" | "unverified";
  noRepeatAfterUnverified: boolean;
}>;

export function governmentChoiceProofPostcondition(
  result: Civ7GovernmentDomainChoiceResult
): Civ7GovernmentChoiceProofPostcondition {
  return {
    classification: result.postcondition.classification,
    reason: result.postcondition.reason,
    outcome: governmentChoiceProofOutcome(result.postcondition),
    confidence:
      result.postcondition.classification === "pending-runtime-proof"
        ? "pending-runtime-proof"
        : "unverified",
    noRepeatAfterUnverified: true,
  };
}

export function governmentChoiceProofOutcome(
  postcondition: Civ7GovernmentChoicePostcondition
): Civ7GovernmentChoiceProofOutcome {
  return postcondition.classification === "not-sent" ? "not-sent" : "unknown";
}
