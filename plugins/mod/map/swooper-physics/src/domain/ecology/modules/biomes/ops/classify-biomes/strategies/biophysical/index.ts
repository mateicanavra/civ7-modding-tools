import { createStrategy } from "@swooper/mapgen-core/authoring";
import { clamp01 } from "@swooper/mapgen-core/lib/math";

import Contract from "../../contract.js";
import { classifyBiomesFromFields } from "../../rules/classify.js";
import StrategyDefinition from "./config.js";

/** Applies local biophysical climate thresholds and permafrost-derived treeline while preserving the water sentinel. */
const biophysicalStrategy = createStrategy(Contract, StrategyDefinition, {
  run: (input, config) => {
    const { width, height } = input;
    const size = width * height;

    const effectiveMoistureIn = input.effectiveMoisture;
    const surfaceTemperatureC = input.surfaceTemperatureC;
    const aridityIndexIn = input.aridityIndex;
    const freezeIndex = input.freezeIndex;
    const landMask = input.landMask;
    const soilType = input.soilType;
    const fertility = input.fertility;

    // M3: Biomes consumes Hydrology’s derived indices rather than re-deriving locally.
    const surfaceTemperatureF64 = new Float64Array(size);
    const aridityIndexF64 = new Float64Array(size);
    const effectiveMoistureF64 = new Float64Array(size);
    for (let i = 0; i < size; i++) {
      surfaceTemperatureF64[i] = surfaceTemperatureC[i] ?? 0;
      aridityIndexF64[i] = aridityIndexIn[i] ?? 0;
      effectiveMoistureF64[i] = effectiveMoistureIn[i] ?? 0;
    }

    const { biomeIndex, vegetationDensity } = classifyBiomesFromFields({
      width,
      height,
      landMask,
      effectiveMoistureF64,
      surfaceTemperatureF64,
      freezeIndex,
      aridityIndexF64,
      plantEffectiveMoisture: input.plantEffectiveMoisture,
      plantWaterStress: input.plantWaterStress,
      soilType,
      fertility,
      config,
    });

    const treeLine01 = new Float32Array(size);
    for (let i = 0; i < size; i++) {
      treeLine01[i] = clamp01(1 - (input.permafrost01[i] ?? 0));
    }

    return {
      biomeIndex,
      vegetationDensity,
      treeLine01,
      effectiveMoisture: new Float32Array(effectiveMoistureIn),
      surfaceTemperature: new Float32Array(surfaceTemperatureC),
      aridityIndex: new Float32Array(aridityIndexIn),
      freezeIndex: new Float32Array(freezeIndex),
    };
  },
});

export default biophysicalStrategy;
