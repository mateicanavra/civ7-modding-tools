import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";
import { mapArtifacts } from "../../../../map-artifacts.js";
import {
  MAP_PROJECTION_EFFECT_TAGS,
  PLACEMENT_PRODUCT_EFFECT_TAGS,
} from "../../../../tag-contracts.js";
import { artifacts as mapHydrologyArtifacts } from "../../../map-hydrology/artifacts/index.js";
import { artifacts as mapMorphologyArtifacts } from "../../../map-morphology/artifacts/index.js";
import { artifacts as placementArtifacts } from "../../artifacts/index.js";

/**
 * Surface preparation is the transactional boundary that makes the engine safe
 * for placement products. It groups maintenance operations that must happen
 * together before resources, starts, and discoveries read engine state.
 *
 * Ordering after the wonder stamp is carried by the `naturalWondersPlaced`
 * effect tag alone (S6: no read-and-discard artifacts); wonder evidence is
 * validated at its publish site, not re-normalized here.
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
      mapHydrologyArtifacts.engineProjectionLakes,
      mapArtifacts.landmassRegionSlotByTile,
      mapMorphologyArtifacts.coastClassification,
    ],
    provides: [
      placementArtifacts.placementSurfacePreparation,
      mapArtifacts.placementSurfaceValidationBoundary,
    ],
  },
  schema: Type.Object({}, { additionalProperties: false }),
});

export default PreparePlacementSurfaceStepContract;
