import { ctxStepSeed } from "@swooper/mapgen-core";
import { createStep } from "@swooper/mapgen-core/authoring";
import { config } from "./config.js";

/**
 * Scores climate- and biome-driven snow, sand, burned, and jungle effects into
 * a deterministic intent plan; map-ecology alone applies that plan to Civ7.
 */
export const PlanPlotEffectsStep = createStep(config, {
  run: (context, stepConfig, ops, deps) => {
    const classification = deps.artifacts.biomeClassification.read();
    const climateIndices = deps.artifacts.climateIndices.read();
    const topography = deps.artifacts.topography.read();
    const { width, height } = context.setup.dimensions;
    const scoreSnow = ops.scoreSnow(
      {
        width,
        height,
        landMask: topography.landMask,
        elevation: topography.elevation,
        effectiveMoisture: climateIndices.effectiveMoisture,
        surfaceTemperature: climateIndices.surfaceTemperatureC,
        aridityIndex: climateIndices.aridityIndex,
        freezeIndex: climateIndices.freezeIndex,
      },
      stepConfig.scoreSnow
    );
    const scoreSand = ops.scoreSand(
      {
        width,
        height,
        landMask: topography.landMask,
        biomeIndex: classification.biomeIndex,
        vegetationDensity: classification.vegetationDensity,
        effectiveMoisture: climateIndices.effectiveMoisture,
        surfaceTemperature: climateIndices.surfaceTemperatureC,
        aridityIndex: climateIndices.aridityIndex,
        freezeIndex: climateIndices.freezeIndex,
      },
      stepConfig.scoreSand
    );
    const scoreBurned = ops.scoreBurned(
      {
        width,
        height,
        landMask: topography.landMask,
        biomeIndex: classification.biomeIndex,
        vegetationDensity: classification.vegetationDensity,
        effectiveMoisture: climateIndices.effectiveMoisture,
        surfaceTemperature: climateIndices.surfaceTemperatureC,
        aridityIndex: climateIndices.aridityIndex,
        freezeIndex: climateIndices.freezeIndex,
      },
      stepConfig.scoreBurned
    );
    const scoreJungle = ops.scoreJungle(
      {
        width,
        height,
        landMask: topography.landMask,
        biomeIndex: classification.biomeIndex,
        vegetationDensity: classification.vegetationDensity,
        effectiveMoisture: climateIndices.effectiveMoisture,
        surfaceTemperature: climateIndices.surfaceTemperatureC,
      },
      stepConfig.scoreJungle
    );

    const result = ops.plotEffects(
      {
        width,
        height,
        seed: ctxStepSeed(context, config.id, "ecology/plan-plot-effects"),
        snowScore01: scoreSnow.score01,
        snowEligibleMask: scoreSnow.eligibleMask,
        sandScore01: scoreSand.score01,
        sandEligibleMask: scoreSand.eligibleMask,
        burnedScore01: scoreBurned.score01,
        burnedEligibleMask: scoreBurned.eligibleMask,
        jungleScore01: scoreJungle.score01,
        jungleEligibleMask: scoreJungle.eligibleMask,
      },
      stepConfig.plotEffects
    );

    deps.artifacts.plotEffectPlan.publish(result.placements);
  },
});
