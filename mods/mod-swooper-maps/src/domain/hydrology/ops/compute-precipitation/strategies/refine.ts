import { createStrategy } from "@swooper/mapgen-core/authoring";

import ComputePrecipitationContract from "../contract.js";
import {
  clampRainfall,
  isAdjacentToRivers,
  isLowBasinClosed,
  rainfallToHumidityU8,
} from "../rules/index.js";

export const refineStrategy = createStrategy(ComputePrecipitationContract, "refine", {
  run: (input, config) => {
    const width = input.width;
    const height = input.height;

    const rainfall = new Uint8Array(input.rainfallIn);
    const humidity = new Uint8Array(input.humidityIn);

    const adjacencyRadius = config.riverCorridor.adjacencyRadius | 0;
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

        if (isAdjacentToRivers(x, y, width, height, input.riverAdjacency, adjacencyRadius)) {
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
