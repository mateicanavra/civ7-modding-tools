import { Type, defineStep } from "@swooper/mapgen-core/authoring";

import { MAP_PROJECTION_EFFECT_TAGS } from "../../../tags.js";
import { morphologyArtifacts } from "../../morphology/artifacts.js";

const PlotVolcanoesStepContract = defineStep({
  id: "plot-volcanoes",
  phase: "gameplay",
  requires: [MAP_PROJECTION_EFFECT_TAGS.map.continentsPlotted],
  provides: [MAP_PROJECTION_EFFECT_TAGS.map.volcanoesPlotted],
  artifacts: {
    requires: [morphologyArtifacts.topography, morphologyArtifacts.volcanoes],
    provides: [],
  },
  schema: Type.Object({}),
});

export default PlotVolcanoesStepContract;
