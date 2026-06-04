import type { Civ7ProductionPostconditionClassification } from "./production-postconditions.js";

export type Civ7ProductionChoicePostconditionOutcome =
  | "cleared"
  | "state-changed"
  | "still-blocked"
  | "no-state-change"
  | "not-sent";

export function productionChoiceRequestVerified(
  classification: Civ7ProductionPostconditionClassification | undefined,
): boolean {
  // Preserve the legacy request-result boolean; proof confirmation is stricter.
  return classification !== "not-sent"
    && classification !== "no-state-change"
    && classification !== "production-state-changed-blocker-still-live";
}

export function productionChoicePostconditionConfirmed(
  classification: Civ7ProductionPostconditionClassification,
): boolean {
  switch (classification) {
    case "production-choice-cleared":
    case "production-state-changed":
      return true;
    case "not-sent":
    case "production-state-changed-blocker-still-live":
    case "validation-changed":
    case "no-state-change":
      return false;
  }
}

export function productionChoicePostconditionOutcome(
  classification: Civ7ProductionPostconditionClassification,
): Civ7ProductionChoicePostconditionOutcome {
  switch (classification) {
    case "not-sent":
      return "not-sent";
    case "production-choice-cleared":
      return "cleared";
    case "production-state-changed":
      return "state-changed";
    case "production-state-changed-blocker-still-live":
    case "validation-changed":
      return "still-blocked";
    case "no-state-change":
      return "no-state-change";
  }
}
