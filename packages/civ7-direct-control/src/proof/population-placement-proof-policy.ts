import {
  populationPlacementPostconditionConfirmed,
  populationPlacementPostconditionOutcome,
} from "../play/operations/population-placement-proof.js";

import type {
  Civ7PopulationPlacementPostcondition,
  Civ7PopulationPlacementPostconditionClassification,
} from "../play/operations/population-postconditions.js";
import type {
  Civ7OperationProofBoundary,
  Civ7OperationTelemetryPostcondition,
  Civ7OperationTelemetryPostconditionOutcome,
} from "./operation-telemetry.js";

export type Civ7PopulationPlacementProofSource = Readonly<{
  sent: boolean;
  populationPostcondition?: Civ7PopulationPlacementPostcondition;
}>;

export function populationPlacementProofPostcondition(
  result: Civ7PopulationPlacementProofSource,
  proofBoundary: Civ7OperationProofBoundary | undefined
): Civ7OperationTelemetryPostcondition | undefined {
  const postcondition = result.populationPostcondition;
  if (!result.sent && !postcondition) return undefined;
  if (proofBoundary === "pending-runtime-proof") {
    return {
      classification: postcondition?.classification ?? "pending-runtime-proof",
      reason: postcondition?.reason ?? "Runtime postcondition proof is pending.",
      outcome: "unknown",
      noRepeatAfterUnverified: true,
      confidence: "pending-runtime-proof",
    };
  }
  if (!postcondition) {
    return {
      classification: "missing-postcondition",
      reason: "The population placement result did not include explicit postcondition evidence.",
      outcome: "unknown",
      noRepeatAfterUnverified: true,
      confidence: "unverified",
    };
  }
  if (!populationPlacementPostconditionConfirmed(postcondition.classification)) {
    return {
      classification: postcondition.classification,
      reason: postcondition.reason,
      outcome: populationPlacementProofOutcome(postcondition.classification),
      noRepeatAfterUnverified: true,
      confidence: "unverified",
    };
  }
  return {
    classification: postcondition.classification,
    reason: postcondition.reason,
    outcome: populationPlacementProofOutcome(postcondition.classification),
    noRepeatAfterUnverified: populationPlacementProofNoRepeatAfterConfirmed(
      postcondition.classification
    ),
    confidence: "confirmed",
  };
}

export function populationPlacementProofOutcome(
  classification: Civ7PopulationPlacementPostconditionClassification
): Civ7OperationTelemetryPostconditionOutcome {
  return populationPlacementPostconditionOutcome(classification);
}

function populationPlacementProofNoRepeatAfterConfirmed(
  classification: Civ7PopulationPlacementPostconditionClassification
): boolean {
  return classification === "placement-state-changed";
}
