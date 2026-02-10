import { clamp01, normalizeRange } from "@swooper/mapgen-core";
import { createStrategy, type Static } from "@swooper/mapgen-core/authoring";

import PlotEffectsScoreSnowContract from "../contract.js";
import { resolveSnowElevationRange } from "../../plan-plot-effects/rules/index.js";

type Config = Static<(typeof PlotEffectsScoreSnowContract)["strategies"]["default"]>;

export const defaultStrategy = createStrategy(PlotEffectsScoreSnowContract, "default", {
  run: (input, config) => {
    const { width, height, landMask } = input;
    const tileCount = width * height;

    const score01 = new Float32Array(tileCount);
    const eligibleMask = new Uint8Array(tileCount);

    const snowElevation = resolveSnowElevationRange(input, {
      snow: {
        elevationStrategy: config.elevationStrategy,
        elevationPercentileMin: config.elevationPercentileMin,
        elevationPercentileMax: config.elevationPercentileMax,
        elevationMin: config.elevationMin,
        elevationMax: config.elevationMax,
      },
    });
    const elevationMin = snowElevation.min;
    const elevationMax = snowElevation.max;

    for (let y = 0; y < height; y++) {
      const rowOffset = y * width;
      for (let x = 0; x < width; x++) {
        const idx = rowOffset + x;
        if (landMask[idx] === 0) continue;

        const temp = input.surfaceTemperature[idx];
        const aridity = input.aridityIndex[idx];

        if (temp > config.maxTemperature || aridity > config.maxAridity) {
          continue;
        }

        eligibleMask[idx] = 1;

        const freeze = input.freezeIndex[idx];
        const elevation = input.elevation[idx];
        const moisture = input.effectiveMoisture[idx];

        const elevationFactor = normalizeRange(elevation, elevationMin, elevationMax);
        const moistureFactor = normalizeRange(moisture, config.moistureMin, config.moistureMax);
        const scoreRaw =
          freeze * config.freezeWeight +
          elevationFactor * config.elevationWeight +
          moistureFactor * config.moistureWeight +
          config.scoreBias;
        const score = clamp01(scoreRaw / Math.max(0.0001, config.scoreNormalization));
        score01[idx] = score;
      }
    }

    return { score01, eligibleMask };
  },
});
