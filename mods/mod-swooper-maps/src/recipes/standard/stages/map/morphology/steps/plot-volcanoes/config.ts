import { artifacts as morphologyLandformsArtifacts } from "@mapgen/domain/morphology/modules/landforms/artifacts/index.js";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";
import { MAP_PROJECTION_EFFECT_TAGS } from "../../../../../tag-contracts.js";

/**
 * Defines volcano projection after continent terrain is stable. Its effect tag declares
 * projection completion, not ownership of volcano truth.
 */
export const PlotVolcanoesStepContract = defineStep({
  id: "plot-volcanoes",
  engine: ["setTerrainType", "setFeatureType", "isWater"] as const,
  requires: [MAP_PROJECTION_EFFECT_TAGS.map.continentsPlotted],
  provides: [MAP_PROJECTION_EFFECT_TAGS.map.volcanoesPlotted],
  artifacts: {
    requires: [morphologyLandformsArtifacts.topography, morphologyLandformsArtifacts.volcanoes],
    provides: [],
  },
  schema: Type.Object({}),
});
