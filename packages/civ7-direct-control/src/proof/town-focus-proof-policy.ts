import type {
  Civ7TownFocusPostcondition,
  Civ7TownFocusPostconditionClassification,
  Civ7TownFocusRequestResult,
} from "../play/city/town-focus-request";

export type Civ7TownFocusProofOutcome = "not-sent" | "unknown";

export type Civ7TownFocusProofPostcondition = Readonly<{
  classification: Civ7TownFocusPostconditionClassification;
  reason: string;
  outcome: Civ7TownFocusProofOutcome;
  confidence: "pending-runtime-proof" | "unverified";
  noRepeatAfterUnverified: boolean;
}>;

export function townFocusProofPostcondition(
  result: Civ7TownFocusRequestResult
): Civ7TownFocusProofPostcondition {
  return {
    classification: result.postcondition.classification,
    reason: result.postcondition.reason,
    outcome: townFocusProofOutcome(result.postcondition),
    confidence:
      result.postcondition.classification === "pending-runtime-proof"
        ? "pending-runtime-proof"
        : "unverified",
    noRepeatAfterUnverified: true,
  };
}

export function townFocusProofOutcome(
  postcondition: Civ7TownFocusPostcondition
): Civ7TownFocusProofOutcome {
  return postcondition.classification === "not-sent" ? "not-sent" : "unknown";
}
