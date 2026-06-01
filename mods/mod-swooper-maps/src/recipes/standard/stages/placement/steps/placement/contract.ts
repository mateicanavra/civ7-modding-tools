import { Type, defineStep } from "@swooper/mapgen-core/authoring";

import {
  MAP_PROJECTION_EFFECT_TAGS,
  STANDARD_ENGINE_EFFECT_TAGS,
  PLACEMENT_PRODUCT_EFFECT_TAGS,
} from "../../../../tags.js";
import { placementArtifacts } from "../../artifacts.js";
import { mapArtifacts } from "../../../../map-artifacts.js";

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
