import { clamp01, normalizeRange } from "@swooper/mapgen-core";
import { createStrategy, type Static } from "@swooper/mapgen-core/authoring";

import { biomeSymbolFromIndex } from "@mapgen/domain/ecology/types.js";

import PlotEffectsScoreBurnedContract from "../contract.js";

type Config = Static<(typeof PlotEffectsScoreBurnedContract)["strategies"]["default"]>;

export const defaultStrategy = createStrategy(PlotEffectsScoreBurnedContract, "default", {
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
        const aridity = input.aridityIndex[idx];
        const freeze = input.freezeIndex[idx];
        const symbol = biomeSymbolFromIndex(input.biomeIndex[idx]);

        if (
          aridity < config.minAridity ||
          temp < config.minTemperature ||
          moisture > config.maxMoisture ||
          freeze > config.maxFreeze ||
          vegetation > config.maxVegetation ||
          !allowedBiomes.has(symbol)
        ) {
          continue;
        }

        eligibleMask[idx] = 1;

        const aridityFactor = normalizeRange(aridity, config.minAridity, 1);
        const tempFactor = normalizeRange(temp, config.minTemperature, config.minTemperature + 10);
        const freezeFactor = 1 - normalizeRange(freeze, 0, Math.max(0.0001, config.maxFreeze));
        const vegetationFactor =
          1 - normalizeRange(vegetation, 0, Math.max(0.0001, config.maxVegetation));
        const moistureFactor =
          1 - normalizeRange(moisture, 0, Math.max(0.0001, config.maxMoisture));
        const score = clamp01(
          (aridityFactor + tempFactor + freezeFactor + vegetationFactor + moistureFactor) / 5
        );
        score01[idx] = score;
      }
    }

    return { score01, eligibleMask };
  },
});

