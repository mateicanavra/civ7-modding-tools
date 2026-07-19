import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";

import { MAP_PROJECTION_EFFECT_TAGS } from "../../../../tag-contracts.js";
import { artifacts as morphologyArtifacts } from "../../../morphology/artifacts/index.js";

/**
 * Defines volcano projection after continent terrain is stable. Its effect tag declares
 * projection completion, not ownership of volcano truth.
 */
export const PlotVolcanoesStepContract = defineStep({
  id: "plot-volcanoes",
  requires: [MAP_PROJECTION_EFFECT_TAGS.map.continentsPlotted],
  provides: [MAP_PROJECTION_EFFECT_TAGS.map.volcanoesPlotted],
  artifacts: {
    requires: [morphologyArtifacts.topography, morphologyArtifacts.volcanoes],
    provides: [],
  },
  schema: Type.Object({}),
});
