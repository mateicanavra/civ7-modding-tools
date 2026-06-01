import { Type, defineStep } from "@swooper/mapgen-core/authoring";

import { MAP_PROJECTION_EFFECT_TAGS } from "../../../tags.js";
import { morphologyArtifacts } from "../../morphology/artifacts.js";

const PlotContinentsStepContract = defineStep({
  id: "plot-continents",
  phase: "gameplay",
  requires: [MAP_PROJECTION_EFFECT_TAGS.map.coastsPlotted],
  provides: [MAP_PROJECTION_EFFECT_TAGS.map.continentsPlotted],
  artifacts: {
    requires: [morphologyArtifacts.topography],
    provides: [],
  },
  schema: Type.Object({}),
});

export default PlotContinentsStepContract;
