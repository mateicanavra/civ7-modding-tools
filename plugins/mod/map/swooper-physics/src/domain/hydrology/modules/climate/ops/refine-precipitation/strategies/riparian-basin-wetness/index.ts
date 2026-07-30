import { isAnyRiverClass } from "../../../../../hydrography/model/policy/river-class.js";
import { createStrategy } from "@swooper/mapgen-core/authoring";
import { computeMaskDistanceFieldOddQ, idx } from "@swooper/mapgen-core/lib/grid";

import {
  clampRainfall,
  rainfallToHumidityU8,
} from "../../../../model/rules/precipitation-scale.js";
import RefinePrecipitationContract from "../../contract.js";
import RiparianBasinWetnessDefinition from "./config.js";

function isLowBasinClosed(
  x: number,
  y: number,
  width: number,
  height: number,
  elevation: ArrayLike<number>,
  radius: number,
  openThresholdM: number
): boolean {
  const originElevation = elevation[idx(x, y, width)]!;

  for (let dy = -radius; dy <= radius; dy++) {
    const neighborY = y + dy;
    if (neighborY < 0 || neighborY >= height) continue;
    for (let dx = -radius; dx <= radius; dx++) {
      if (dx === 0 && dy === 0) continue;
      const neighborX = x + dx;
      if (neighborX < 0 || neighborX >= width) continue;
      if (elevation[idx(neighborX, neighborY, width)]! < originElevation + openThresholdM) {
        return false;
      }
    }
  }
  return true;
}

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
  for (let tileIndex = 0; tileIndex < size; tileIndex++) {
    const tileDistance = distance[tileIndex]!;
    if (tileDistance >= 0 && tileDistance <= radius) corridor[tileIndex] = 1;
  }
  return corridor;
}

/**
 * Copies the admitted climate vintage, adds river-corridor and enclosed-basin wetness on land,
 * then reclamps rainfall and reprojects humidity without mutating upstream evidence.
 */
export default createStrategy(RefinePrecipitationContract, RiparianBasinWetnessDefinition, {
  run: (input, config) => {
    const { width, height } = input;
    const rainfall = new Uint8Array(input.rainfall);
    const humidity = new Uint8Array(input.humidity);
    const riverCorridorMask = buildRiverCorridorMask(
      width,
      height,
      input.riverClass,
      config.riverCorridor.adjacencyRadius
    );

    for (let y = 0; y < height; y++) {
      const row = y * width;
      for (let x = 0; x < width; x++) {
        const tileIndex = row + x;
        if (input.landMask[tileIndex] === 0) continue;

        const elevation = input.elevation[tileIndex]!;
        let rainfallValue = rainfall[tileIndex]!;
        if (riverCorridorMask[tileIndex] === 1) {
          rainfallValue +=
            elevation < config.riverCorridor.lowlandElevationMax
              ? config.riverCorridor.lowlandAdjacencyBonus
              : config.riverCorridor.highlandAdjacencyBonus;
        }
        if (
          elevation < config.lowBasin.elevationMax &&
          isLowBasinClosed(
            x,
            y,
            width,
            height,
            input.elevation,
            config.lowBasin.radius,
            config.lowBasin.openThresholdM
          )
        ) {
          rainfallValue += config.lowBasin.delta;
        }

        const admittedRainfall = clampRainfall(rainfallValue);
        rainfall[tileIndex] = admittedRainfall;
        humidity[tileIndex] = rainfallToHumidityU8(admittedRainfall);
      }
    }

    return { rainfall, humidity } as const;
  },
});
