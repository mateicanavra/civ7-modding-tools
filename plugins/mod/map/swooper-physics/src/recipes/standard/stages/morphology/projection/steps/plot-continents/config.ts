import { artifacts as morphologyLandformsArtifacts } from "../../../../../../../domain/morphology/modules/landforms/artifacts/index.js";
import { artifacts as morphologyShelfArtifacts } from "../../../../../../../domain/morphology/modules/shelf/artifacts/index.js";
import { defineStep } from "@swooper/mapgen-core/authoring/contracts";
import { STANDARD_COMPLETIONS } from "../../../../../completions.js";

/**
 * Defines continent projection after `coastsPlotted`, preventing the implementation from
 * classifying a pre-coast engine surface.
 */
export const config = defineStep({
  id: "plot-continents",
  engine: [
    "validateAndFixTerrain",
    "recalculateAreas",
    "stampContinents",
    "getTerrainType",
    "readCurrentMapWaterMask",
    "setTerrainType",
    "storeWaterData",
  ] as const,
  requires: [
    STANDARD_COMPLETIONS.coastsPlotted,
    morphologyLandformsArtifacts.topography,
    morphologyShelfArtifacts.shelf,
  ],
  provides: [STANDARD_COMPLETIONS.continentsPlotted],
});
