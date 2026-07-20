import { clamp01 } from "@swooper/mapgen-core";

import type {
  PedologyClassifyAdmittedInput,
  PedologyClassifyConfig,
  PedologyClassifyOutput,
} from "../types.js";

/**
 * Classifies soil and fertility for each admitted map tile.
 * Strategies shape only the weights before entering this shared algorithm, so variants cannot
 * bypass operation admission by invoking another strategy descriptor.
 */
export function classifyPedology(
  input: PedologyClassifyAdmittedInput,
  config: PedologyClassifyConfig
): PedologyClassifyOutput {
  const size = input.width * input.height;
  const relief = computeReliefProxy(input.slope, input.elevation, size);
  const sediment = input.sedimentDepth;
  const bedrock = input.bedrockAge;

  const soilType = new Uint8Array(size);
  const fertility = new Float32Array(size);

  for (let i = 0; i < size; i++) {
    if (input.landMask[i] === 0) {
      soilType[i] = 0;
      fertility[i] = 0;
      continue;
    }
    const tileFertility = fertilityForTile({
      rainfall: input.rainfall[i],
      humidity: input.humidity[i],
      relief: relief[i],
      sedimentDepth: sediment ? sediment[i] : 0,
      bedrockAge: bedrock ? bedrock[i] : 0,
      weights: config,
    });
    fertility[i] = tileFertility;
    const moisture = (input.rainfall[i] + input.humidity[i]) / 510;
    soilType[i] = soilPaletteIndex(tileFertility, relief[i], moisture);
  }

  return { soilType, fertility };
}

/**
 * Returns a normalized relief field, using slope when provided or elevation as a fallback.
 */
export function computeReliefProxy(
  slope: Float32Array | undefined,
  elevation: Int16Array,
  size: number
): Float32Array {
  if (slope) {
    return slope;
  }
  // Fallback: normalize elevation magnitude as a proxy for relief.
  let maxAbs = 1;
  for (let i = 0; i < size; i++) {
    const value = Math.abs(elevation[i] ?? 0);
    if (value > maxAbs) maxAbs = value;
  }
  const result = new Float32Array(size);
  const inv = 1 / maxAbs;
  for (let i = 0; i < size; i++) {
    result[i] = clamp01(Math.abs(elevation[i] ?? 0) * inv);
  }
  return result;
}

/**
 * Computes a fertility score for a tile from climate, relief, sediment, and bedrock signals.
 */
export function fertilityForTile({
  rainfall,
  humidity,
  relief,
  sedimentDepth,
  bedrockAge,
  weights,
}: {
  rainfall: number;
  humidity: number;
  relief: number;
  sedimentDepth: number;
  bedrockAge: number;
  weights: {
    climateWeight: number;
    reliefWeight: number;
    sedimentWeight: number;
    bedrockWeight: number;
    fertilityCeiling: number;
  };
}): number {
  const moisture = clamp01((rainfall + humidity) / 510);
  const sedimentSignal = clamp01(sedimentDepth);
  const reliefPenalty = 1 - clamp01(relief);
  const bedrockSignal = clamp01(bedrockAge);

  const weighted =
    moisture * weights.climateWeight +
    reliefPenalty * weights.reliefWeight +
    sedimentSignal * weights.sedimentWeight +
    bedrockSignal * weights.bedrockWeight;

  const normalized =
    weighted /
    (weights.climateWeight +
      weights.reliefWeight +
      weights.sedimentWeight +
      weights.bedrockWeight || 1);
  return Math.min(weights.fertilityCeiling, clamp01(normalized));
}

/**
 * Maps fertility, relief, and moisture to a coarse soil palette bucket.
 */
export function soilPaletteIndex(fertility: number, relief: number, moisture: number): number {
  if (relief > 0.75) return 0; // rocky
  if (fertility > 0.7 && moisture > 0.5) return 2; // loam
  if (moisture > 0.65) return 3; // clayish / wet
  if (fertility < 0.35) return 1; // sandy
  return 2;
}
