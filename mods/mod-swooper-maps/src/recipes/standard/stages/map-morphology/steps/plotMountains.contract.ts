import { Type, defineStep } from "@swooper/mapgen-core/authoring";
import morphology from "@mapgen/domain/morphology";

import { M10_EFFECT_TAGS } from "../../../tags.js";
import { morphologyArtifacts } from "../../morphology/artifacts.js";

const PlotMountainsStepContract = defineStep({
  id: "plot-mountains",
  phase: "gameplay",
  requires: [M10_EFFECT_TAGS.map.continentsPlotted],
  provides: [M10_EFFECT_TAGS.map.mountainsPlotted],
  artifacts: {
    requires: [morphologyArtifacts.beltDrivers, morphologyArtifacts.topography],
    provides: [],
  },
  ops: {
    ridges: morphology.ops.planRidges,
    foothills: morphology.ops.planFoothills,
  },
  schema: Type.Object(
    {},
    {
      additionalProperties: false,
      description:
        "Gameplay mountain projection config (op envelopes for morphology/plan-ridges + morphology/plan-foothills).",
    }
  ),
});

export default PlotMountainsStepContract;
