import { clamp01 } from "@swooper/mapgen-core";
import { createStrategy } from "@swooper/mapgen-core/authoring";
import { forEachHexNeighborOddQ, getHexNeighborIndicesOddQ } from "@swooper/mapgen-core/lib/grid";
import { PerlinNoise } from "@swooper/mapgen-core/lib/noise";
import { BIOME_SYMBOL_TO_INDEX } from "../../../../../../model/atoms/index.js";

import Contract from "../../contract.js";
import StrategyDefinition from "./config.js";

const MINOR_FLOODPLAIN_DISCHARGE_NORMALIZER = 1000;
const FLOODPLAIN_RELIEF_NORMALIZER_M = 260;
const FLOODPLAIN_PATCH_NOISE_SCALE = 0.11;
const RELIEF_SCORE_FLOOR = 0.35;
const RELIEF_SCORE_WEIGHT = 0.65;
const FERTILITY_SCORE_FLOOR = 0.55;
const FERTILITY_SCORE_WEIGHT = 0.45;
const PATCH_SCORE_FLOOR = 0.3;
const PATCH_SCORE_WEIGHT = 0.7;

function maxAdjacentNavigableDischarge(
  tileIndex: number,
  width: number,
  height: number,
  navigableRiverMask: Uint8Array,
  discharge: Float32Array
): number {
  const y = (tileIndex / width) | 0;
  const x = tileIndex - y * width;
  let maximum = 0;
  for (const neighbor of getHexNeighborIndicesOddQ(x, y, width, height)) {
    if ((navigableRiverMask[neighbor] ?? 0) !== 1) continue;
    maximum = Math.max(maximum, discharge[neighbor] ?? 0);
  }
  return maximum;
}

function localReliefM(
  tileIndex: number,
  width: number,
  height: number,
  landMask: Uint8Array,
  elevation: Int16Array
): number {
  if (landMask[tileIndex] !== 1) return Number.POSITIVE_INFINITY;
  const y = (tileIndex / width) | 0;
  const x = tileIndex - y * width;
  const here = elevation[tileIndex] ?? 0;
  let relief = 0;
  forEachHexNeighborOddQ(x, y, width, height, (neighborX, neighborY) => {
    const neighbor = neighborY * width + neighborX;
    if (landMask[neighbor] !== 1) return;
    relief = Math.max(relief, Math.abs(here - (elevation[neighbor] ?? 0)));
  });
  return relief;
}

/** Projects alluvial suitability into the floodplain family selected by each tile's biome and river context. */
const alluvialReliefStrategy = createStrategy(Contract, StrategyDefinition, {
  run: (input) => {
    const { width, height } = input;
    const size = width * height;
    const layers = {
      "desert-floodplain-minor": new Float32Array(size),
      "desert-floodplain-navigable": new Float32Array(size),
      "grassland-floodplain-minor": new Float32Array(size),
      "grassland-floodplain-navigable": new Float32Array(size),
      "plains-floodplain-minor": new Float32Array(size),
      "plains-floodplain-navigable": new Float32Array(size),
      "tropical-floodplain-minor": new Float32Array(size),
      "tropical-floodplain-navigable": new Float32Array(size),
      "tundra-floodplain-minor": new Float32Array(size),
      "tundra-floodplain-navigable": new Float32Array(size),
    } as const;
    const floodplainNoise = new PerlinNoise(input.seed);

    for (let tileIndex = 0; tileIndex < size; tileIndex++) {
      if (
        input.landMask[tileIndex] !== 1 ||
        input.mountainMask[tileIndex] === 1 ||
        input.hillMask[tileIndex] === 1 ||
        input.volcanoMask[tileIndex] === 1
      ) {
        continue;
      }

      const isFloodplainSubstrate = input.floodplainMask[tileIndex] === 1;
      const isNavigableFloodplain =
        isFloodplainSubstrate && input.navigableRiverMask[tileIndex] === 1;
      const adjacentNavigableDischarge = maxAdjacentNavigableDischarge(
        tileIndex,
        width,
        height,
        input.navigableRiverMask,
        input.discharge
      );
      const isMinorFloodplain =
        isFloodplainSubstrate && !isNavigableFloodplain && adjacentNavigableDischarge > 0;
      if (!isMinorFloodplain && !isNavigableFloodplain) continue;

      const dischargeScore = isNavigableFloodplain
        ? 1
        : clamp01(adjacentNavigableDischarge / MINOR_FLOODPLAIN_DISCHARGE_NORMALIZER);
      const y = (tileIndex / width) | 0;
      const x = tileIndex - y * width;
      const reliefScore =
        1 -
        clamp01(
          localReliefM(tileIndex, width, height, input.landMask, input.elevation) /
            FLOODPLAIN_RELIEF_NORMALIZER_M
        );
      const fertilityScore = clamp01(input.fertility[tileIndex] ?? 0);
      const patchScore = clamp01(
        (floodplainNoise.noise2D(
          x * FLOODPLAIN_PATCH_NOISE_SCALE,
          y * FLOODPLAIN_PATCH_NOISE_SCALE
        ) +
          1) /
          2
      );
      const score =
        dischargeScore *
        (RELIEF_SCORE_FLOOR + reliefScore * RELIEF_SCORE_WEIGHT) *
        (FERTILITY_SCORE_FLOOR + fertilityScore * FERTILITY_SCORE_WEIGHT) *
        (PATCH_SCORE_FLOOR + patchScore * PATCH_SCORE_WEIGHT);

      switch (input.biomeIndex[tileIndex]) {
        case BIOME_SYMBOL_TO_INDEX.desert:
          (isNavigableFloodplain
            ? layers["desert-floodplain-navigable"]
            : layers["desert-floodplain-minor"])[tileIndex] = score;
          break;
        case BIOME_SYMBOL_TO_INDEX.temperateHumid:
          (isNavigableFloodplain
            ? layers["grassland-floodplain-navigable"]
            : layers["grassland-floodplain-minor"])[tileIndex] = score;
          break;
        case BIOME_SYMBOL_TO_INDEX.temperateDry:
        case BIOME_SYMBOL_TO_INDEX.tropicalSeasonal:
          (isNavigableFloodplain
            ? layers["plains-floodplain-navigable"]
            : layers["plains-floodplain-minor"])[tileIndex] = score;
          break;
        case BIOME_SYMBOL_TO_INDEX.tropicalRainforest:
          (isNavigableFloodplain
            ? layers["tropical-floodplain-navigable"]
            : layers["tropical-floodplain-minor"])[tileIndex] = score;
          break;
        case BIOME_SYMBOL_TO_INDEX.snow:
        case BIOME_SYMBOL_TO_INDEX.tundra:
        case BIOME_SYMBOL_TO_INDEX.boreal:
          (isNavigableFloodplain
            ? layers["tundra-floodplain-navigable"]
            : layers["tundra-floodplain-minor"])[tileIndex] = score;
          break;
      }
    }

    return { layers };
  },
});

export default alluvialReliefStrategy;
