import ecology from "@mapgen/domain/ecology";
import { artifacts as biomeArtifacts } from "@mapgen/domain/ecology/modules/biomes/artifacts/index.js";
import { artifacts as plotEffectArtifacts } from "@mapgen/domain/ecology/modules/plot-effects/artifacts/index.js";
import { artifacts as climateArtifacts } from "@mapgen/domain/hydrology/modules/climate/artifacts/index.js";
import { artifacts as morphologyLandformsArtifacts } from "@mapgen/domain/morphology/modules/landforms/artifacts/index.js";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Plot-effect planning belongs to Ecology truth, not map projection.
 *
 * This step computes snow/sand/burned intent from climate/biome/topography
 * products. `map-ecology/plot-effects` consumes the resulting artifact and only
 * applies it to the engine.
 */
export const config = defineStep({
  id: "plan-plot-effects",
  requires: [],
  provides: [],
  artifacts: {
    requires: [
      morphologyLandformsArtifacts.topography,
      climateArtifacts.climateIndices,
      biomeArtifacts.biomeClassification,
    ],
    provides: [plotEffectArtifacts.plotEffectPlan],
  },
  ops: {
    scoreSnow: ecology.plotEffects.ops.scorePlotEffectsSnow,
    scoreSand: ecology.plotEffects.ops.scorePlotEffectsSand,
    scoreBurned: ecology.plotEffects.ops.scorePlotEffectsBurned,
    scoreJungle: ecology.plotEffects.ops.scorePlotEffectsJungle,
    plotEffects: ecology.plotEffects.ops.planPlotEffects,
  },
  schema: Type.Object(
    {},
    {
      description:
        "Computes climate-driven plot-effect intent. Engine projection is handled by map-ecology.",
    }
  ),
});
