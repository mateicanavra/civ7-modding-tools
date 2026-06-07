import { Type, defineStep } from "@swooper/mapgen-core/authoring";

import {
  MAP_PROJECTION_EFFECT_TAGS,
  PLACEMENT_PRODUCT_EFFECT_TAGS,
} from "../../../../tags.js";
import { mapArtifacts } from "../../../../map-artifacts.js";
import { mapHydrologyArtifacts } from "../../../map-hydrology/artifacts.js";
import { placementArtifacts } from "../../artifacts.js";

/**
 * Surface preparation is the transactional boundary that makes the engine safe
 * for placement products. It groups maintenance operations that must happen
 * together before resources, starts, and discoveries read engine state.
 */
const PreparePlacementSurfaceStepContract = defineStep({
  id: "prepare-placement-surface",
  phase: "placement",
  requires: [
    MAP_PROJECTION_EFFECT_TAGS.map.landmassRegionsPlotted,
    PLACEMENT_PRODUCT_EFFECT_TAGS.placement.naturalWondersPlaced,
  ],
  provides: [PLACEMENT_PRODUCT_EFFECT_TAGS.placement.surfacePrepared],
  artifacts: {
    requires: [
      placementArtifacts.placementInputs,
      placementArtifacts.naturalWonderPlacement,
      mapHydrologyArtifacts.engineProjectionLakes,
      mapArtifacts.landmassRegionSlotByTile,
    ],
    provides: [
      placementArtifacts.placementSurfacePreparation,
      mapArtifacts.placementSurfaceValidationBoundary,
    ],
  },
  schema: Type.Object({}, { additionalProperties: false }),
});

export default PreparePlacementSurfaceStepContract;
