import { createStrategy } from "@swooper/mapgen-core/authoring";
import ComputeThermalStateContract from "../contract.js";
import { clampNumber } from "../rules/index.js";

export const defaultStrategy = createStrategy(ComputeThermalStateContract, "default", {
  run: (input, config) => {
    const width = input.width;
    const height = input.height;
    const size = width * height;

    const surfaceTemperatureC = new Float32Array(size);
    const base = config.baseTemperatureC;
    const insolationScale = config.insolationScaleC;
    const lapseRate = config.lapseRateCPerM;
    const landCooling = config.landCoolingC;
    const minC = config.minC;
    const maxC = config.maxC;
    const sstC = input.sstC;

    for (let i = 0; i < size; i++) {
      const forcing = (input.insolation[i] ?? 0) - 0.5;
      const elevation = input.elevation[i] | 0;
      const isLand = input.landMask[i] === 1;
      if (!isLand && sstC) {
        surfaceTemperatureC[i] = clampNumber(sstC[i] ?? minC, minC, maxC);
        continue;
      }
      const temp =
        base + forcing * insolationScale + elevation * lapseRate - (isLand ? landCooling : 0);
      surfaceTemperatureC[i] = clampNumber(temp, minC, maxC);
    }

    return { surfaceTemperatureC } as const;
  },
});
