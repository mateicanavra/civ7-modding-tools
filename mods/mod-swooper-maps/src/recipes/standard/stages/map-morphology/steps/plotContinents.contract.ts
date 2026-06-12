import { Type, defineStep } from "@swooper/mapgen-core/authoring";

import { MAP_PROJECTION_EFFECT_TAGS } from "../../../tags.js";
import { mapMorphologyArtifacts } from "../artifacts.js";
import { morphologyArtifacts } from "../../morphology/artifacts.js";

const PlotContinentsStepContract = defineStep({
  id: "plot-continents",
  phase: "morphology",
  requires: [MAP_PROJECTION_EFFECT_TAGS.map.coastsPlotted],
  provides: [MAP_PROJECTION_EFFECT_TAGS.map.continentsPlotted],
  artifacts: {
    requires: [morphologyArtifacts.topography],
    provides: [mapMorphologyArtifacts.continentValidationTerrainSnapshot],
  },
  schema: Type.Object({}),
});

export default PlotContinentsStepContract;
