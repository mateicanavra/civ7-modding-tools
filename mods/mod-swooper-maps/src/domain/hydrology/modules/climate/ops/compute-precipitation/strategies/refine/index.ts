import { isAnyRiverClass } from "@mapgen/domain/hydrology/modules/hydrography/model/policy/river-class.js";
import { createStrategy } from "@swooper/mapgen-core/authoring";
import { computeMaskDistanceFieldOddQ } from "@swooper/mapgen-core/lib/grid";

import ComputePrecipitationContract from "../../contract.js";
import { clampRainfall, isLowBasinClosed, rainfallToHumidityU8 } from "../../rules/index.js";
import RefineDefinition from "./config.js";

function buildRiverCorridorMask(
  width: number,
  height: number,
  riverClass: ArrayLike<number>,
  radius: number
): Uint8Array {
  const size = width * height;
  const sources: number[] = [];
  for (let tileIndex = 0; tileIndex < size; tileIndex++) {
    if (isAnyRiverClass(riverClass[tileIndex]!)) sources.push(tileIndex);
  }
  const traversable = new Uint8Array(size).fill(1);
  const distance = computeMaskDistanceFieldOddQ({
    mask: traversable,
    width,
    height,
    sources,
    maxDistance: radius,
  });
  const corridor = new Uint8Array(size);
  const admittedRadius = Math.max(1, radius | 0);
  for (let tileIndex = 0; tileIndex < size; tileIndex++) {
    const tileDistance = distance[tileIndex]!;
    if (tileDistance >= 0 && tileDistance <= admittedRadius) corridor[tileIndex] = 1;
  }
  return corridor;
}

/**
 * Copies the admitted baseline arrays, adds river-adjacency and enclosed-basin wetness on land, then
 * reclamps rainfall and recomputes humidity. Copy-on-entry preserves the baseline artifact as a
 * distinct causal vintage.
 */
const refineStrategy = createStrategy(ComputePrecipitationContract, RefineDefinition, {
  run: (input, config) => {
    const width = input.width;
    const height = input.height;

    const rainfall = new Uint8Array(input.rainfallIn);
    const humidity = new Uint8Array(input.humidityIn);

    const adjacencyRadius = config.riverCorridor.adjacencyRadius | 0;
    const riverCorridorMask = buildRiverCorridorMask(
      width,
      height,
      input.riverClass,
      adjacencyRadius
    );
    const lowlandElevationMax = config.riverCorridor.lowlandElevationMax | 0;
    const lowlandBonus = config.riverCorridor.lowlandAdjacencyBonus;
    const highlandBonus = config.riverCorridor.highlandAdjacencyBonus;

    const basinRadius = config.lowBasin.radius | 0;
    const basinDelta = config.lowBasin.delta;
    const basinElevationMax = config.lowBasin.elevationMax | 0;
    const openThresholdM = config.lowBasin.openThresholdM | 0;

    for (let y = 0; y < height; y++) {
      const row = y * width;
      for (let x = 0; x < width; x++) {
        const i = row + x;
        if (input.landMask[i] === 0) continue;

        let rf = rainfall[i] | 0;
        const elev = input.elevation[i] | 0;

        if (riverCorridorMask[i] === 1) {
          rf += elev < lowlandElevationMax ? lowlandBonus : highlandBonus;
        }

        if (
          elev < basinElevationMax &&
          isLowBasinClosed(x, y, width, height, input.elevation, basinRadius, openThresholdM)
        ) {
          rf += basinDelta;
        }

        const clamped = clampRainfall(rf);
        rainfall[i] = (clamped | 0) & 0xff;
        humidity[i] = rainfallToHumidityU8(clamped);
      }
    }

    return { rainfall, humidity } as const;
  },
});

export default refineStrategy;
