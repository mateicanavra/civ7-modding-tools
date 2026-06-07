import { ctxStepSeed, type ExtendedMapContext, type HeightfieldBuffer } from "@swooper/mapgen-core";
import type { BiomeClassificationArtifact } from "../../../ecology/artifacts.js";

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
  context: ExtendedMapContext,
  artifacts: {
    classification: BiomeClassificationArtifact;
    heightfield: HeightfieldBuffer;
  },
  stepId: string
): PlotEffectsStepInput {
  const { width, height } = context.dimensions;
  const { classification, heightfield } = artifacts;

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
    elevation: heightfield.elevation,
    landMask: heightfield.landMask,
  };
}
