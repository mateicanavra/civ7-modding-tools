import type { Civ7AdvisorWarningViewedResult } from "../play/notifications/advisor-warning-request.js";

export type Civ7AdvisorWarningProofOutcome =
  | "not-sent"
  | "unknown";

export type Civ7AdvisorWarningProofPostcondition = Readonly<{
  classification:
    | "not-sent"
    | "pending-runtime-proof";
  reason: string;
  outcome: Civ7AdvisorWarningProofOutcome;
  confidence: "unverified" | "pending-runtime-proof";
  noRepeatAfterUnverified: boolean;
}>;

export function advisorWarningProofPostcondition(
  result: Civ7AdvisorWarningViewedResult,
): Civ7AdvisorWarningProofPostcondition {
  if (result.postcondition.classification === "not-sent") {
    return {
      classification: "not-sent",
      reason: result.postcondition.reason,
      outcome: "not-sent",
      confidence: "unverified",
      noRepeatAfterUnverified: true,
    };
  }

  return {
    classification: "pending-runtime-proof",
    reason: result.postcondition.reason,
    outcome: "unknown",
    confidence: "pending-runtime-proof",
    noRepeatAfterUnverified: true,
  };
}
