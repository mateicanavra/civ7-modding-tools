import { artifacts as morphologyArtifacts } from "@mapgen/domain/morphology";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";
import { MAP_PROJECTION_EFFECT_TAGS } from "../../../../../tag-contracts.js";
import { artifactModules as mapMorphologyArtifactModules } from "../../artifacts/index.js";

/**
 * Defines continent projection after `coastsPlotted`, preventing the implementation from
 * classifying a pre-coast engine surface and declaring its validation snapshot.
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
    requires: [morphologyArtifacts.topography, morphologyArtifacts.shelf],
    provides: [mapMorphologyArtifactModules.continentValidationTerrainSnapshot],
  },
  schema: Type.Object({}),
});
