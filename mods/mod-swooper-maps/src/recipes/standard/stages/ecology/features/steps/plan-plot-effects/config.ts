import {
  default as ecology,
  artifactModules as ecologyArtifactModules,
  artifacts as ecologyArtifacts,
} from "@mapgen/domain/ecology";
import { artifacts as hydrologyArtifacts } from "@mapgen/domain/hydrology";
import { artifacts as morphologyArtifacts } from "@mapgen/domain/morphology";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Plot-effect planning belongs to Ecology truth, not map projection.
 *
 * This step computes snow/sand/burned intent from climate/biome/topography
 * products. `map-ecology/plot-effects` consumes the resulting artifact and only
 * applies it to the engine.
 */
export const PlanPlotEffectsStepContract = defineStep({
  id: "plan-plot-effects",
  requires: [],
  provides: [],
  artifacts: {
    requires: [
      morphologyArtifacts.topography,
      hydrologyArtifacts.climateIndices,
      ecologyArtifacts.biomeClassification,
    ],
    provides: [ecologyArtifactModules.plotEffectPlan],
  },
  ops: {
    scoreSnow: ecology.ops.scorePlotEffectsSnow,
    scoreSand: ecology.ops.scorePlotEffectsSand,
    scoreBurned: ecology.ops.scorePlotEffectsBurned,
    scoreJungle: ecology.ops.scorePlotEffectsJungle,
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
