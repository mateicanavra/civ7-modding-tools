import { artifacts as morphologyLandformsArtifacts } from "@mapgen/domain/morphology/modules/landforms/artifacts/index.js";
import { artifacts as morphologyShelfArtifacts } from "@mapgen/domain/morphology/modules/shelf/artifacts/index.js";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";
import { MAP_PROJECTION_EFFECT_TAGS } from "../../../../../tag-contracts.js";

/**
 * Defines continent projection after `coastsPlotted`, preventing the implementation from
 * classifying a pre-coast engine surface.
 */
export const PlotContinentsStepContract = defineStep({
  id: "plot-continents",
  engine: [
    "validateAndFixTerrain",
    "recalculateAreas",
    "stampContinents",
    "getTerrainType",
    "getElevation",
    "isWater",
    "setTerrainType",
    "storeWaterData",
  ] as const,
  requires: [MAP_PROJECTION_EFFECT_TAGS.map.coastsPlotted],
  provides: [MAP_PROJECTION_EFFECT_TAGS.map.continentsPlotted],
  artifacts: {
    requires: [morphologyLandformsArtifacts.topography, morphologyShelfArtifacts.shelf],
  },
  schema: Type.Object({}),
});
