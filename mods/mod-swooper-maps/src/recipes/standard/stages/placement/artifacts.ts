/**
 * Placement stage artifact collection (placement-realignment S6).
 *
 * Artifact contracts live one-per-file under `artifacts/contract/` per the
 * repo-wide artifact-contract normalization (ownership-boundaries layout);
 * this module only assembles the stage consumer surface.
 */
import { advancedStartAssignmentArtifact } from "./artifacts/contract/advanced-start-assignment.contract.js";
import { discoveryPlacementOutcomesArtifact } from "./artifacts/contract/discovery-placement-outcomes.contract.js";
import { discoveryPlanArtifact } from "./artifacts/contract/discovery-plan.contract.js";
import { engineStateArtifact } from "./artifacts/contract/engine-state.contract.js";
import { naturalWonderPlacementArtifact } from "./artifacts/contract/natural-wonder-placement.contract.js";
import { naturalWonderPlanArtifact } from "./artifacts/contract/natural-wonder-plan.contract.js";
import { placementInputsArtifact } from "./artifacts/contract/placement-inputs.contract.js";
import { placementOutputsArtifact } from "./artifacts/contract/placement-outputs.contract.js";
import { placementSurfacePreparationArtifact } from "./artifacts/contract/placement-surface-preparation.contract.js";
import { resourceDemandPlanArtifact } from "./artifacts/contract/resource-demand-plan.contract.js";
import { resourceEligibilityArtifact } from "./artifacts/contract/resource-eligibility.contract.js";
import { resourcePlacementOutcomesArtifact } from "./artifacts/contract/resource-placement-outcomes.contract.js";
import { resourcePlanArtifact } from "./artifacts/contract/resource-plan.contract.js";
import { resourcePlanAdjustedArtifact } from "./artifacts/contract/resource-plan-adjusted.contract.js";
import { startAssignmentArtifact } from "./artifacts/contract/start-assignment.contract.js";

export const placementArtifacts = {
  placementInputs: placementInputsArtifact,
  resourceDemandPlan: resourceDemandPlanArtifact,
  resourcePlan: resourcePlanArtifact,
  resourceEligibility: resourceEligibilityArtifact,
  resourcePlanAdjusted: resourcePlanAdjustedArtifact,
  naturalWonderPlan: naturalWonderPlanArtifact,
  naturalWonderPlacement: naturalWonderPlacementArtifact,
  placementSurfacePreparation: placementSurfacePreparationArtifact,
  resourcePlacementOutcomes: resourcePlacementOutcomesArtifact,
  discoveryPlacementOutcomes: discoveryPlacementOutcomesArtifact,
  startAssignment: startAssignmentArtifact,
  advancedStartAssignment: advancedStartAssignmentArtifact,
  discoveryPlan: discoveryPlanArtifact,
  placementOutputs: placementOutputsArtifact,
  engineState: engineStateArtifact,
} as const;
