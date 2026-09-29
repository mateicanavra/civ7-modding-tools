import ecology from "../../../../../../../domain/ecology/index.js";
import { artifacts as biomeArtifacts } from "../../../../../../../domain/ecology/modules/biomes/artifacts/index.js";
import { artifacts as plotEffectArtifacts } from "../../../../../../../domain/ecology/modules/plot-effects/artifacts/index.js";
import { artifacts as climateArtifacts } from "../../../../../../../domain/hydrology/modules/climate/artifacts/index.js";
import { artifacts as morphologyLandformsArtifacts } from "../../../../../../../domain/morphology/modules/landforms/artifacts/index.js";
import { defineStep } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Plot-effect planning belongs to Ecology truth, not map projection.
 *
 * This step computes snow/sand/burned intent from climate/biome/topography
 * products. `map-ecology/plot-effects` consumes the resulting artifact and only
 * applies it to the engine.
 */
export const config = defineStep({
  id: "plan-plot-effects",
  description:
    "Computes climate-driven plot-effect intent before the later engine-projection boundary.",
  requires: [
    morphologyLandformsArtifacts.topography,
    climateArtifacts.climateIndices,
    biomeArtifacts.biomeClassification,
  ],
  provides: [plotEffectArtifacts.plotEffectPlan],

  ops: {
    scoreSnow: ecology.plotEffects.ops.scorePlotEffectsSnow,
    scoreSand: ecology.plotEffects.ops.scorePlotEffectsSand,
    scoreBurned: ecology.plotEffects.ops.scorePlotEffectsBurned,
    scoreJungle: ecology.plotEffects.ops.scorePlotEffectsJungle,
    plotEffects: ecology.plotEffects.ops.planPlotEffects,
  },
});
