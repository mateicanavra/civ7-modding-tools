import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";
import { mapArtifacts } from "../../../../map-artifacts.js";
import {
  MAP_PROJECTION_EFFECT_TAGS,
  PLACEMENT_PRODUCT_EFFECT_TAGS,
  STANDARD_ENGINE_EFFECT_TAGS,
} from "../../../../tag-contracts.js";
import { placementArtifacts } from "../../artifacts.js";

/**
 * Terminal placement evidence step. DECLARED parity read (ADR-009): this step
 * intentionally reads the Morphology physics heightfield buffer and compares
 * it against an engine readback snapshot - that physics-vs-engine comparison
 * (waterDriftCount, placementEngineTerrainSnapshot) is the step's product,
 * so both sides of the comparison are evidence inputs, not planning truth.
 */
const PlacementStepContract = defineStep({
  id: "placement",
  phase: "placement",
  requires: [PLACEMENT_PRODUCT_EFFECT_TAGS.placement.advancedStartsAssigned],
  provides: [
    STANDARD_ENGINE_EFFECT_TAGS.engine.placementApplied,
    MAP_PROJECTION_EFFECT_TAGS.map.placementParityCaptured,
  ],
  artifacts: {
    requires: [
      placementArtifacts.naturalWonderPlacement,
      placementArtifacts.placementSurfacePreparation,
      placementArtifacts.resourcePlacementOutcomes,
      placementArtifacts.startAssignment,
      placementArtifacts.discoveryPlacementOutcomes,
      placementArtifacts.advancedStartAssignment,
      mapArtifacts.landmassRegionSlotByTile,
    ],
    provides: [
      placementArtifacts.placementOutputs,
      placementArtifacts.engineState,
      mapArtifacts.placementEngineTerrainSnapshot,
    ],
  },
  schema: Type.Object({}),
});

export default PlacementStepContract;
