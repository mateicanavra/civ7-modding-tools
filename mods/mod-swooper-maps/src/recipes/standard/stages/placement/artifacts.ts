/**
 * Placement stage artifact collection (placement-realignment S6).
 *
 * Artifact contracts live one-per-file under `artifacts/*.artifact.ts`;
 * this module only assembles the stage consumer surface.
 */
import { advancedStartAssignmentArtifact } from "./artifacts/advanced-start-assignment.artifact.js";
import { discoveryPlacementOutcomesArtifact } from "./artifacts/discovery-placement-outcomes.artifact.js";
import { engineStateArtifact } from "./artifacts/engine-state.artifact.js";
import { naturalWonderPlacementArtifact } from "./artifacts/natural-wonder-placement.artifact.js";
import { naturalWonderPlanArtifact } from "./artifacts/natural-wonder-plan.artifact.js";
import { placementInputsArtifact } from "./artifacts/placement-inputs.artifact.js";
import { placementOutputsArtifact } from "./artifacts/placement-outputs.artifact.js";
import { placementSurfacePreparationArtifact } from "./artifacts/placement-surface-preparation.artifact.js";
import { resourceDemandPlanArtifact } from "./artifacts/resource-demand-plan.artifact.js";
import { resourceEligibilityArtifact } from "./artifacts/resource-eligibility.artifact.js";
import { resourcePlacementOutcomesArtifact } from "./artifacts/resource-placement-outcomes.artifact.js";
import { resourcePlanArtifact } from "./artifacts/resource-plan.artifact.js";
import { resourcePlanAdjustedArtifact } from "./artifacts/resource-plan-adjusted.artifact.js";
import { startAssignmentArtifact } from "./artifacts/start-assignment.artifact.js";

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
  placementOutputs: placementOutputsArtifact,
  engineState: engineStateArtifact,
} as const;
