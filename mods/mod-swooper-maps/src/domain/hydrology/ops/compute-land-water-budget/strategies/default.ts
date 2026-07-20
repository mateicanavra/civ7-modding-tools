import { createStrategy } from "@swooper/mapgen-core/authoring";
import ComputeLandWaterBudgetContract from "../contract.js";
import { clamp01, lerp01 } from "../rules/index.js";

export const defaultStrategy = createStrategy(ComputeLandWaterBudgetContract, "default", {
  run: (input, config) => {
    const width = input.width;
    const height = input.height;
    const size = width * height;

    const pet = new Float32Array(size);
    const aridityIndex = new Float32Array(size);

    const tMin = config.tMinC;
    const tMax = Math.max(tMin + 1e-6, config.tMaxC);
    const petBase = config.petBase;
    const petTempWeight = config.petTemperatureWeight;
    const humidityDampening = config.humidityDampening;

    for (let i = 0; i < size; i++) {
      if (input.landMask[i] !== 1) {
        pet[i] = 0;
        aridityIndex[i] = 0;
        continue;
      }

      const temp = input.surfaceTemperatureC[i] ?? tMin;
      const humidity = (input.humidity[i] ?? 0) / 255;
      const precip = input.rainfall[i] ?? 0;

      const tempFactor = lerp01(temp, tMin, tMax);
      const damp = 1 - humidityDampening * clamp01(humidity);
      const petValue = (petBase + petTempWeight * tempFactor) * clamp01(damp);
      pet[i] = petValue;

      const denom = petValue + precip + 1;
      aridityIndex[i] = denom <= 0 ? 0 : clamp01(petValue / denom);
    }

    return { pet, aridityIndex } as const;
  },
});
