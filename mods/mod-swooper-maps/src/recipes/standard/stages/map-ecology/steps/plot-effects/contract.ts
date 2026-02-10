import { Type, defineStep } from "@swooper/mapgen-core/authoring";
import ecology from "@mapgen/domain/ecology";

import { ecologyArtifacts } from "../../../ecology/artifacts.js";
import { morphologyArtifacts } from "../../../morphology/artifacts.js";
import { M4_EFFECT_TAGS } from "../../../../tags.js";

const PlotEffectsStepContract = defineStep({
  id: "plot-effects",
  phase: "gameplay",
  requires: [],
  provides: [M4_EFFECT_TAGS.engine.plotEffectsApplied],
  artifacts: {
    requires: [morphologyArtifacts.topography, ecologyArtifacts.biomeClassification],
  },
  ops: {
    scoreSnow: ecology.ops.scorePlotEffectsSnow,
    scoreSand: ecology.ops.scorePlotEffectsSand,
    scoreBurned: ecology.ops.scorePlotEffectsBurned,
    plotEffects: ecology.ops.planPlotEffects,
  },
  schema: Type.Object(
    {},
    {
      description: "Configuration for climate-driven plot effects (snow, sand, burn).",
    }
  ),
});

export default PlotEffectsStepContract;
