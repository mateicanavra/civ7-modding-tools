import { ctxStepSeed, type MapContext } from "@swooper/mapgen-core";
import type { BiomeClassificationArtifact } from "../../../ecology/artifacts/biome-classification.artifact.js";

/**
 * Carries the canonical biome and final-topography inputs consumed by plot-effect
 * scoring so every scorer observes the same map vintage and deterministic seed.
 */
export type PlotEffectsStepInput = {
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
export function buildPlotEffectsInput(
  context: MapContext,
  artifacts: {
    classification: BiomeClassificationArtifact;
    topography: Readonly<{ elevation: Int16Array; landMask: Uint8Array }>;
  },
  stepId: string
): PlotEffectsStepInput {
  const { width, height } = context.setup.dimensions;
  const { classification, topography } = artifacts;

  return {
    width,
    height,
    seed: ctxStepSeed(context, stepId, "ecology/plan-plot-effects"),
    biomeIndex: classification.biomeIndex,
    vegetationDensity: classification.vegetationDensity,
    effectiveMoisture: classification.effectiveMoisture,
    surfaceTemperature: classification.surfaceTemperature,
    aridityIndex: classification.aridityIndex,
    freezeIndex: classification.freezeIndex,
    elevation: topography.elevation,
    landMask: topography.landMask,
  };
}
