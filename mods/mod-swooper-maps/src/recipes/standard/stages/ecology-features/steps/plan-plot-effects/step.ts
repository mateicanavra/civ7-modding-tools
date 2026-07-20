import { createStep } from "@swooper/mapgen-core/authoring";
import { PlanPlotEffectsStepContract } from "./config.js";
import { logSnowEligibilitySummary } from "./diagnostics.js";
import { buildPlotEffectsInput } from "./inputs.js";

/**
 * Scores climate- and biome-driven snow, sand, burned, and jungle effects into
 * a deterministic intent plan; map-ecology alone applies that plan to Civ7.
 */
export const PlanPlotEffectsStep = createStep(PlanPlotEffectsStepContract, {
  run: (context, config, ops, deps) => {
    const artifacts = {
      classification: deps.artifacts.biomeClassification.read(context),
      topography: deps.artifacts.topography.read(context),
    };
    const input = buildPlotEffectsInput(context, artifacts, PlanPlotEffectsStepContract.id);
    const scoreSnow = ops.scoreSnow(
      {
        width: input.width,
        height: input.height,
        landMask: input.landMask,
        elevation: input.elevation,
        effectiveMoisture: input.effectiveMoisture,
        surfaceTemperature: input.surfaceTemperature,
        aridityIndex: input.aridityIndex,
        freezeIndex: input.freezeIndex,
      },
      config.scoreSnow
    );
    const scoreSand = ops.scoreSand(
      {
        width: input.width,
        height: input.height,
        landMask: input.landMask,
        biomeIndex: input.biomeIndex,
        vegetationDensity: input.vegetationDensity,
        effectiveMoisture: input.effectiveMoisture,
        surfaceTemperature: input.surfaceTemperature,
        aridityIndex: input.aridityIndex,
        freezeIndex: input.freezeIndex,
      },
      config.scoreSand
    );
    const scoreBurned = ops.scoreBurned(
      {
        width: input.width,
        height: input.height,
        landMask: input.landMask,
        biomeIndex: input.biomeIndex,
        vegetationDensity: input.vegetationDensity,
        effectiveMoisture: input.effectiveMoisture,
        surfaceTemperature: input.surfaceTemperature,
        aridityIndex: input.aridityIndex,
        freezeIndex: input.freezeIndex,
      },
      config.scoreBurned
    );
    const scoreJungle = ops.scoreJungle(
      {
        width: input.width,
        height: input.height,
        landMask: input.landMask,
        biomeIndex: input.biomeIndex,
        vegetationDensity: input.vegetationDensity,
        effectiveMoisture: input.effectiveMoisture,
        surfaceTemperature: input.surfaceTemperature,
      },
      config.scoreJungle
    );

    const result = ops.plotEffects(
      {
        width: input.width,
        height: input.height,
        seed: input.seed,
        snowScore01: scoreSnow.score01,
        snowEligibleMask: scoreSnow.eligibleMask,
        sandScore01: scoreSand.score01,
        sandEligibleMask: scoreSand.eligibleMask,
        burnedScore01: scoreBurned.score01,
        burnedEligibleMask: scoreBurned.eligibleMask,
        jungleScore01: scoreJungle.score01,
        jungleEligibleMask: scoreJungle.eligibleMask,
      },
      config.plotEffects
    );

    if (context.trace.isVerbose) {
      logSnowEligibilitySummary(
        context.trace,
        input,
        config.scoreSnow.config,
        config.plotEffects.config.snow,
        result.placements
      );
    }

    deps.artifacts.plotEffectPlan.publish(context, result.placements);
  },
});
