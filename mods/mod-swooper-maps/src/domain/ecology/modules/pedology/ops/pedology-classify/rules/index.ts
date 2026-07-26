import { clamp01 } from "@swooper/mapgen-core";
import { forEachHexNeighborOddQ } from "@swooper/mapgen-core/lib/grid";

type PedologyInput = Readonly<{
  width: number;
  height: number;
  landMask: Uint8Array;
  elevation: Int16Array;
  rainfall: Uint8Array;
  humidity: Uint8Array;
  sedimentDepth?: Float32Array;
  bedrockAge?: Int16Array;
}>;

type PedologyWeights = Readonly<{
  climateWeight: number;
  reliefWeight: number;
  sedimentWeight: number;
  bedrockWeight: number;
  fertilityCeiling: number;
}>;

type PedologyOutput = Readonly<{
  soilType: Uint8Array;
  fertility: Float32Array;
}>;

/**
 * Classifies soil and fertility for each admitted map tile.
 * Strategies shape only the weights before entering this shared algorithm, so variants cannot
 * bypass operation admission by invoking another strategy descriptor.
 */
export function classifyPedology(input: PedologyInput, config: PedologyWeights): PedologyOutput {
  const size = input.width * input.height;
  const relief = computeLocalReliefProxy(input);
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
 * Derives normalized local relief from elevation differences between neighboring land tiles.
 * Water never contributes to a land tile's relief, preserving the coastline-independent
 * pedology behavior previously owned by the Standard recipe step.
 */
function computeLocalReliefProxy(
  input: Pick<PedologyInput, "width" | "height" | "landMask" | "elevation">
): Float32Array {
  const { width, height, landMask, elevation } = input;
  const size = width * height;
  const maxDropByTile = new Float32Array(size);
  let maxDrop = 1;

  for (let i = 0; i < size; i++) {
    if (landMask[i] !== 1) continue;
    const x = i % width;
    const y = Math.floor(i / width);
    const here = elevation[i] ?? 0;
    let localMaxDrop = 0;
    forEachHexNeighborOddQ(x, y, width, height, (neighborX, neighborY) => {
      const neighborIndex = neighborY * width + neighborX;
      if (landMask[neighborIndex] !== 1) return;
      localMaxDrop = Math.max(localMaxDrop, Math.abs(here - (elevation[neighborIndex] ?? 0)));
    });
    maxDropByTile[i] = localMaxDrop;
    maxDrop = Math.max(maxDrop, localMaxDrop);
  }

  const invMaxDrop = 1 / maxDrop;
  for (let i = 0; i < size; i++) {
    maxDropByTile[i] *= invMaxDrop;
  }
  return maxDropByTile;
}

/**
 * Computes a fertility score for a tile from climate, relief, sediment, and bedrock signals.
 */
function fertilityForTile({
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
function soilPaletteIndex(fertility: number, relief: number, moisture: number): number {
  if (relief > 0.75) return 0; // rocky
  if (fertility > 0.7 && moisture > 0.5) return 2; // loam
  if (moisture > 0.65) return 3; // clayish / wet
  if (fertility < 0.35) return 1; // sandy
  return 2;
}
