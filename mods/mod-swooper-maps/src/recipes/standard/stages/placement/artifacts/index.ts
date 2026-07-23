import { defineArtifactCatalog } from "@swooper/mapgen-core/authoring/contracts";
import { artifact as advancedStartAssignment } from "./advanced-start-assignment.artifact.js";
import { artifact as discoveryPlacementOutcomes } from "./discovery-placement-outcomes.artifact.js";
import { artifact as engineState } from "./engine-state.artifact.js";
import { artifact as landmassRegionSlotByTile } from "./landmass-region-slot-by-tile.artifact.js";
import { artifact as naturalWonderPlacement } from "./natural-wonder-placement.artifact.js";
import { artifact as naturalWonderPlan } from "./natural-wonder-plan.artifact.js";
import { artifact as placementEngineTerrainSnapshot } from "./placement-engine-terrain-snapshot.artifact.js";
import { artifact as placementInputs } from "./placement-inputs.artifact.js";
import { artifact as placementOutputs } from "./placement-outputs.artifact.js";
import { artifact as placementSurfacePreparation } from "./placement-surface-preparation.artifact.js";
import { artifact as placementSurfaceValidationBoundary } from "./placement-surface-validation-boundary.artifact.js";
import { artifact as resourceDemandPlan } from "./resource-demand-plan.artifact.js";
import { artifact as resourceEligibility } from "./resource-eligibility.artifact.js";
import { artifact as resourcePlacementOutcomes } from "./resource-placement-outcomes.artifact.js";
import { artifact as resourcePlan } from "./resource-plan.artifact.js";
import { artifact as resourcePlanAdjusted } from "./resource-plan-adjusted.artifact.js";
import { artifact as startAssignment } from "./start-assignment.artifact.js";

/** placement artifact authorities keyed for contracts and consumers. */
export const artifacts = defineArtifactCatalog({
  advancedStartAssignment,
  discoveryPlacementOutcomes,
  engineState,
  landmassRegionSlotByTile,
  naturalWonderPlacement,
  naturalWonderPlan,
  placementEngineTerrainSnapshot,
  placementInputs,
  placementOutputs,
  placementSurfacePreparation,
  placementSurfaceValidationBoundary,
  resourceDemandPlan,
  resourceEligibility,
  resourcePlacementOutcomes,
  resourcePlan,
  resourcePlanAdjusted,
  startAssignment,
});
