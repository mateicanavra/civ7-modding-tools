import { Type, defineStep } from "@swooper/mapgen-core/authoring";

import { MAP_PROJECTION_EFFECT_TAGS } from "../../../tags.js";
import { morphologyArtifacts } from "../../morphology/artifacts.js";

const PlotMountainsStepContract = defineStep({
  id: "plot-mountains",
  phase: "morphology",
  requires: [MAP_PROJECTION_EFFECT_TAGS.map.continentsPlotted],
  provides: [MAP_PROJECTION_EFFECT_TAGS.map.mountainsPlotted],
  artifacts: {
    requires: [morphologyArtifacts.mountains, morphologyArtifacts.topography],
    provides: [],
  },
  schema: Type.Object(
    {},
    {
      additionalProperties: false,
      description: "Gameplay mountain projection config. Mountain intent is produced by Morphology.",
    }
  ),
});

export default PlotMountainsStepContract;
