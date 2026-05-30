import { Type, defineStep } from "@swooper/mapgen-core/authoring";

import {
  STANDARD_ENGINE_EFFECT_TAGS,
  MAP_PROJECTION_EFFECT_TAGS,
  PLACEMENT_PRODUCT_EFFECT_TAGS,
} from "../../../../tags.js";
import { placementArtifacts } from "../../artifacts.js";
import { mapArtifacts } from "../../../../map-artifacts.js";

const PlacementStepContract = defineStep({
  id: "placement",
  phase: "placement",
  requires: [
    MAP_PROJECTION_EFFECT_TAGS.map.landmassRegionsPlotted,
    PLACEMENT_PRODUCT_EFFECT_TAGS.placement.naturalWondersPlaced,
  ],
  provides: [
    STANDARD_ENGINE_EFFECT_TAGS.engine.placementApplied,
    MAP_PROJECTION_EFFECT_TAGS.map.placementParityCaptured,
  ],
  artifacts: {
    requires: [
      placementArtifacts.placementInputs,
      placementArtifacts.resourcePlan,
      placementArtifacts.naturalWonderPlacement,
      placementArtifacts.naturalWonderPlan,
      placementArtifacts.discoveryPlan,
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
