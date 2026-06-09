import type {
  Civ7FirstMeetResponsePostcondition,
  Civ7FirstMeetResponsePostconditionClassification,
} from "../play/operations/first-meet-postconditions";
import type { Civ7FirstMeetResponseResult } from "../play/operations/first-meet-request";

export type Civ7FirstMeetResponseProofOutcome =
  | "cleared"
  | "state-changed"
  | "still-blocked"
  | "not-sent"
  | "unknown";

export type Civ7FirstMeetResponseProofPostcondition = Readonly<{
  classification: Civ7FirstMeetResponsePostconditionClassification;
  reason: string;
  outcome: Civ7FirstMeetResponseProofOutcome;
  confidence: "confirmed" | "unverified";
  noRepeatAfterUnverified: boolean;
}>;

export function firstMeetResponseProofPostcondition(
  result: Civ7FirstMeetResponseResult,
): Civ7FirstMeetResponseProofPostcondition {
  return {
    classification: result.postcondition.classification,
    reason: result.postcondition.reason,
    outcome: firstMeetResponseProofOutcome(result.postcondition),
    confidence: firstMeetResponseProofConfirmed(result.postcondition) ? "confirmed" : "unverified",
    noRepeatAfterUnverified: !firstMeetResponseProofConfirmed(result.postcondition),
  };
}

export function firstMeetResponseProofOutcome(
  postcondition: Civ7FirstMeetResponsePostcondition,
): Civ7FirstMeetResponseProofOutcome {
  switch (postcondition.classification) {
    case "turn-unblocked":
    case "first-meet-cleared":
      return "cleared";
    case "first-meet-blocker-transitioned":
      return "state-changed";
    case "first-meet-sticky-blocker":
      return "still-blocked";
    case "not-sent":
      return "not-sent";
    case "first-meet-blocker-unmatched":
      return "unknown";
  }
}

function firstMeetResponseProofConfirmed(
  postcondition: Civ7FirstMeetResponsePostcondition,
): boolean {
  return postcondition.classification === "turn-unblocked"
    || postcondition.classification === "first-meet-cleared";
}
