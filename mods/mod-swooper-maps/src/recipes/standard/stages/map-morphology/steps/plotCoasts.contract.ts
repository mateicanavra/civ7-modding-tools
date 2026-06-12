import { Type, defineStep } from "@swooper/mapgen-core/authoring";

import { MAP_PROJECTION_EFFECT_TAGS } from "../../../tags.js";
import { morphologyArtifacts } from "../../morphology/artifacts.js";
import { mapMorphologyArtifacts } from "../artifacts.js";

const PlotCoastsStepContract = defineStep({
  id: "plot-coasts",
  phase: "morphology",
  requires: [],
  provides: [MAP_PROJECTION_EFFECT_TAGS.map.coastsPlotted],
  artifacts: {
    requires: [morphologyArtifacts.topography, morphologyArtifacts.coastlineMetrics],
    provides: [
      mapMorphologyArtifacts.coastClassification,
      mapMorphologyArtifacts.coastEngineTerrainSnapshot,
    ],
  },
  schema: Type.Object({}),
});

export default PlotCoastsStepContract;
