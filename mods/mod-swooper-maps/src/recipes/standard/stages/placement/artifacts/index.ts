import * as advancedStartAssignment from "./advanced-start-assignment.artifact.js";
import * as discoveryPlacementOutcomes from "./discovery-placement-outcomes.artifact.js";
import * as engineState from "./engine-state.artifact.js";
import * as naturalWonderPlacement from "./natural-wonder-placement.artifact.js";
import * as naturalWonderPlan from "./natural-wonder-plan.artifact.js";
import * as placementInputs from "./placement-inputs.artifact.js";
import * as placementOutputs from "./placement-outputs.artifact.js";
import * as placementSurfacePreparation from "./placement-surface-preparation.artifact.js";
import * as resourceDemandPlan from "./resource-demand-plan.artifact.js";
import * as resourceEligibility from "./resource-eligibility.artifact.js";
import * as resourcePlacementOutcomes from "./resource-placement-outcomes.artifact.js";
import * as resourcePlan from "./resource-plan.artifact.js";
import * as resourcePlanAdjusted from "./resource-plan-adjusted.artifact.js";
import * as startAssignment from "./start-assignment.artifact.js";

export { advancedStartAssignment, discoveryPlacementOutcomes, engineState, naturalWonderPlacement, naturalWonderPlan, placementInputs, placementOutputs, placementSurfacePreparation, resourceDemandPlan, resourceEligibility, resourcePlacementOutcomes, resourcePlan, resourcePlanAdjusted, startAssignment };

export const artifactContracts = {
  advancedStartAssignment,
  discoveryPlacementOutcomes,
  engineState,
  naturalWonderPlacement,
  naturalWonderPlan,
  placementInputs,
  placementOutputs,
  placementSurfacePreparation,
  resourceDemandPlan,
  resourceEligibility,
  resourcePlacementOutcomes,
  resourcePlan,
  resourcePlanAdjusted,
  startAssignment,
} as const;

export const artifacts = {
  advancedStartAssignment: advancedStartAssignment.artifact,
  discoveryPlacementOutcomes: discoveryPlacementOutcomes.artifact,
  engineState: engineState.artifact,
  naturalWonderPlacement: naturalWonderPlacement.artifact,
  naturalWonderPlan: naturalWonderPlan.artifact,
  placementInputs: placementInputs.artifact,
  placementOutputs: placementOutputs.artifact,
  placementSurfacePreparation: placementSurfacePreparation.artifact,
  resourceDemandPlan: resourceDemandPlan.artifact,
  resourceEligibility: resourceEligibility.artifact,
  resourcePlacementOutcomes: resourcePlacementOutcomes.artifact,
  resourcePlan: resourcePlan.artifact,
  resourcePlanAdjusted: resourcePlanAdjusted.artifact,
  startAssignment: startAssignment.artifact,
} as const;

export const validators = {
  advancedStartAssignment: advancedStartAssignment.validate,
  discoveryPlacementOutcomes: discoveryPlacementOutcomes.validate,
  engineState: engineState.validate,
  naturalWonderPlacement: naturalWonderPlacement.validate,
  naturalWonderPlan: naturalWonderPlan.validate,
  placementInputs: placementInputs.validate,
  placementOutputs: placementOutputs.validate,
  placementSurfacePreparation: placementSurfacePreparation.validate,
  resourceDemandPlan: resourceDemandPlan.validate,
  resourceEligibility: resourceEligibility.validate,
  resourcePlacementOutcomes: resourcePlacementOutcomes.validate,
  resourcePlan: resourcePlan.validate,
  resourcePlanAdjusted: resourcePlanAdjusted.validate,
  startAssignment: startAssignment.validate,
} as const;
