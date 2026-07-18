import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";
import {
  artifactModules as standardArtifactModules,
  artifacts as standardArtifacts,
} from "../../../../artifacts/index.js";
import {
  MAP_PROJECTION_EFFECT_TAGS,
  PLACEMENT_PRODUCT_EFFECT_TAGS,
} from "../../../../tag-contracts.js";
import { artifacts as mapHydrologyArtifacts } from "../../../map-hydrology/artifacts/index.js";
import { artifacts as mapMorphologyArtifacts } from "../../../map-morphology/artifacts/index.js";
import { artifactModules as placementArtifactModules } from "../../artifacts/index.js";

/**
 * Defines the one maintenance transaction after wonder stamping, publishing
 * the engine readback that all later placement products consume.
 */
export const PreparePlacementSurfaceStepContract = defineStep({
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
      standardArtifacts.landmassRegionSlotByTile,
      mapMorphologyArtifacts.coastClassification,
    ],
    provides: [
      placementArtifactModules.placementSurfacePreparation,
      standardArtifactModules.placementSurfaceValidationBoundary,
    ],
  },
  schema: Type.Object({}, { additionalProperties: false }),
});
