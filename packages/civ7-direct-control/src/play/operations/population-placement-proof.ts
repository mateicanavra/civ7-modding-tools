import type { Civ7PopulationPlacementPostconditionClassification } from "./population-postconditions.js";

export type Civ7PopulationPlacementPostconditionOutcome =
  | "cleared"
  | "state-changed"
  | "still-blocked"
  | "no-state-change"
  | "not-sent";

export function populationPlacementRequestVerified(
  classification: Civ7PopulationPlacementPostconditionClassification | undefined,
): boolean {
  // Preserve the legacy request-result boolean; proof confidence is stricter.
  return classification !== "not-sent" && classification !== "no-state-change";
}

export function populationPlacementPostconditionConfirmed(
  classification: Civ7PopulationPlacementPostconditionClassification,
): boolean {
  switch (classification) {
    case "population-ready-cleared":
    case "placement-state-changed":
      return true;
    case "not-sent":
    case "validation-changed":
    case "no-state-change":
      return false;
  }
}

export function populationPlacementPostconditionOutcome(
  classification: Civ7PopulationPlacementPostconditionClassification,
): Civ7PopulationPlacementPostconditionOutcome {
  switch (classification) {
    case "not-sent":
      return "not-sent";
    case "population-ready-cleared":
      return "cleared";
    case "placement-state-changed":
      return "state-changed";
    case "validation-changed":
      return "still-blocked";
    case "no-state-change":
      return "no-state-change";
  }
}
