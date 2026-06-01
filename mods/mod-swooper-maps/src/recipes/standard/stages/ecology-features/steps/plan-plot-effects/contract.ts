import { Type, defineStep } from "@swooper/mapgen-core/authoring";
import ecology from "@mapgen/domain/ecology";

import { ecologyArtifacts } from "../../../ecology/artifacts.js";
import { morphologyArtifacts } from "../../../morphology/artifacts.js";

/**
 * Plot-effect planning belongs to Ecology truth, not map projection.
 *
 * This step computes snow/sand/burned intent from climate/biome/topography
 * products. `map-ecology/plot-effects` consumes the resulting artifact and only
 * applies it to the engine.
 */
const PlanPlotEffectsStepContract = defineStep({
  id: "plan-plot-effects",
  phase: "ecology",
  requires: [],
  provides: [],
  artifacts: {
    requires: [morphologyArtifacts.topography, ecologyArtifacts.biomeClassification],
    provides: [ecologyArtifacts.plotEffectPlan],
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
      description:
        "Computes climate-driven plot-effect intent. Engine projection is handled by map-ecology.",
    }
  ),
});

export default PlanPlotEffectsStepContract;
