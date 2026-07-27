import { artifacts as morphologyLandformsArtifacts } from "@mapgen/domain/morphology/modules/landforms/artifacts/index.js";
import { defineStep } from "@swooper/mapgen-core/authoring/contracts";
import { MAP_PROJECTION_EFFECT_TAGS } from "../../../../../tag-contracts.js";

/**
 * Defines volcano projection after continent terrain is stable. Its effect tag declares
 * projection completion, not ownership of volcano truth.
 */
export const config = defineStep({
  id: "plot-volcanoes",
  engine: [
    "setTerrainType",
    "setFeatureType",
    "readCurrentMapWaterMask",
    "readCurrentMapTerrainTypes",
    "readCurrentMapFeatureTypes",
  ] as const,
  requires: [
    MAP_PROJECTION_EFFECT_TAGS.map.continentsPlotted,
    morphologyLandformsArtifacts.topography,
    morphologyLandformsArtifacts.volcanoes,
  ],
  provides: [MAP_PROJECTION_EFFECT_TAGS.map.volcanoesPlotted],
});
