import { Type, defineStep } from "@swooper/mapgen-core/authoring";

import { MAP_PROJECTION_EFFECT_TAGS } from "../../../tags.js";
import { morphologyArtifacts } from "../../morphology/artifacts.js";

const PlotCoastsStepContract = defineStep({
  id: "plot-coasts",
  phase: "gameplay",
  requires: [],
  provides: [MAP_PROJECTION_EFFECT_TAGS.map.coastsPlotted],
  artifacts: {
    requires: [morphologyArtifacts.topography, morphologyArtifacts.coastlineMetrics],
    provides: [],
  },
  schema: Type.Object({}),
});

export default PlotCoastsStepContract;
