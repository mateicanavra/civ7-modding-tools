import { defineArtifactCatalog } from "@swooper/mapgen-core/authoring/contracts";
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

const catalog = defineArtifactCatalog({
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
});

/** placement artifact modules pairing every contract with its complete admission validator. */
export const artifactModules = catalog.modules;

/** placement artifact handles derived from the module catalog for contracts and consumers. */
export const artifacts = catalog.artifacts;
