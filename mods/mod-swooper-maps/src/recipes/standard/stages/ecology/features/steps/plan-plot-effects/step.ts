import { ctxStepSeed, type MapContext } from "@swooper/mapgen-core";
import { createStep } from "@swooper/mapgen-core/authoring";
import { config } from "./config.js";

/**
 * Carries the canonical biome and final-topography inputs consumed by plot-effect
 * scoring so every scorer observes the same map vintage and deterministic seed.
 */
type PlotEffectsStepInput = {
  width: number;
  height: number;
  seed: number;
  biomeIndex: Uint8Array;
  vegetationDensity: Float32Array;
  effectiveMoisture: Float32Array;
  surfaceTemperature: Float32Array;
  aridityIndex: Float32Array;
  freezeIndex: Float32Array;
  elevation: Int16Array;
  landMask: Uint8Array;
};

/**
 * Builds the input payload for plot effects planning from published artifacts.
 */
function buildPlotEffectsInput(
  context: MapContext,
  artifacts: {
    classification: Readonly<{
      biomeIndex: Uint8Array;
      vegetationDensity: Float32Array;
    }>;
    climateIndices: Readonly<{
      effectiveMoisture: Float32Array;
      surfaceTemperatureC: Float32Array;
      aridityIndex: Float32Array;
      freezeIndex: Float32Array;
    }>;
    topography: Readonly<{ elevation: Int16Array; landMask: Uint8Array }>;
  },
  stepId: string
): PlotEffectsStepInput {
  const { width, height } = context.setup.dimensions;
  const { classification, climateIndices, topography } = artifacts;

  return {
    width,
    height,
    seed: ctxStepSeed(context, stepId, "ecology/plan-plot-effects"),
    biomeIndex: classification.biomeIndex,
    vegetationDensity: classification.vegetationDensity,
    effectiveMoisture: climateIndices.effectiveMoisture,
    surfaceTemperature: climateIndices.surfaceTemperatureC,
    aridityIndex: climateIndices.aridityIndex,
    freezeIndex: climateIndices.freezeIndex,
    elevation: topography.elevation,
    landMask: topography.landMask,
  };
}

/**
 * Scores climate- and biome-driven snow, sand, burned, and jungle effects into
 * a deterministic intent plan; map-ecology alone applies that plan to Civ7.
 */
export const PlanPlotEffectsStep = createStep(config, {
  run: (context, stepConfig, ops, deps) => {
    const artifacts = {
      classification: deps.artifacts.biomeClassification.read(context),
      climateIndices: deps.artifacts.climateIndices.read(context),
      topography: deps.artifacts.topography.read(context),
    };
    const input = buildPlotEffectsInput(context, artifacts, config.id);
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
      stepConfig.scoreSnow
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
      stepConfig.scoreSand
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
      stepConfig.scoreBurned
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
      stepConfig.scoreJungle
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
      stepConfig.plotEffects
    );

    deps.artifacts.plotEffectPlan.publish(context, result.placements);
  },
});
