import { biomeSymbolFromIndex } from "@mapgen/domain/ecology/types.js";
import { clamp01, normalizeRange } from "@swooper/mapgen-core";
import { createStrategy, type Static } from "@swooper/mapgen-core/authoring";

import PlotEffectsScoreJungleContract from "../contract.js";

type Config = Static<(typeof PlotEffectsScoreJungleContract)["strategies"]["default"]>;

export const defaultStrategy = createStrategy(PlotEffectsScoreJungleContract, "default", {
  run: (input, config) => {
    const { width, height, landMask } = input;
    const tileCount = width * height;

    const score01 = new Float32Array(tileCount);
    const eligibleMask = new Uint8Array(tileCount);

    const allowedBiomes = new Set(config.allowedBiomes);

    for (let y = 0; y < height; y++) {
      const rowOffset = y * width;
      for (let x = 0; x < width; x++) {
        const idx = rowOffset + x;
        if (landMask[idx] === 0) continue;

        const temp = input.surfaceTemperature[idx];
        const moisture = input.effectiveMoisture[idx];
        const vegetation = input.vegetationDensity[idx];
        const symbol = biomeSymbolFromIndex(input.biomeIndex[idx]);

        if (
          temp < config.minTemperature ||
          moisture < config.minMoisture ||
          vegetation < config.minVegetation ||
          !allowedBiomes.has(symbol)
        ) {
          continue;
        }

        eligibleMask[idx] = 1;

        // Hotter, wetter, denser = deeper jungle = higher stress.
        const tempFactor = normalizeRange(temp, config.minTemperature, config.minTemperature + 10);
        const moistureFactor = normalizeRange(moisture, config.minMoisture, config.minMoisture + 80);
        const vegetationFactor = normalizeRange(vegetation, config.minVegetation, 1);
        const score = clamp01((tempFactor + moistureFactor + vegetationFactor) / 3);
        score01[idx] = score;
      }
    }

    return { score01, eligibleMask };
  },
});
