import type { ExtendedMapContext, HeightfieldBuffer } from "@swooper/mapgen-core";
import { deriveStepSeed } from "@swooper/mapgen-core/lib/rng";
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
  }
): PlotEffectsStepInput {
  const { width, height } = context.dimensions;
  const { classification, heightfield } = artifacts;

  return {
    width,
    height,
    seed: deriveStepSeed(context.env.seed, "ecology:planPlotEffects"),
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
