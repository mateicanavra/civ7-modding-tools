import { createStrategy } from "@swooper/mapgen-core/authoring";

import BiomeClassificationContract from "../contract.js";
import { computeMaxLatitude } from "../rules/index.js";
import { computeAridityIndexField } from "../layers/aridity.js";
import { classifyBiomesFromFields } from "../layers/classify.js";
import { computeEffectiveMoistureField } from "../layers/moisture.js";
import { computeSurfaceTemperatureAndFreezeIndex } from "../layers/temperature.js";

export const defaultStrategy = createStrategy(BiomeClassificationContract, "default", {
  run: (input, config) => {
    const resolvedConfig = config;
    const { width, height } = input;
    const size = width * height;

    const rainfall = input.rainfall as Uint8Array;
    const humidity = input.humidity as Uint8Array;
    const elevation = input.elevation as Int16Array;
    const latitude = input.latitude as Float32Array;
    const landMask = input.landMask as Uint8Array;
    const riverClass = input.riverClass as Uint8Array;

    const maxLatitude = computeMaxLatitude(latitude);
    const { surfaceTemperatureF64, freezeIndex } = computeSurfaceTemperatureAndFreezeIndex({
      width,
      height,
      landMask,
      elevation,
      latitude,
      maxLatitude,
      temperature: resolvedConfig.temperature,
      freeze: resolvedConfig.freeze,
    });

    const effectiveMoistureF64 = computeEffectiveMoistureField({
      width,
      height,
      landMask,
      rainfall,
      humidity,
      riverClass,
      moisture: resolvedConfig.moisture,
      noise: resolvedConfig.noise,
      riparian: resolvedConfig.riparian,
    });

    const aridityIndexF64 = computeAridityIndexField({
      width,
      height,
      landMask,
      rainfall,
      humidity,
      surfaceTemperatureF64,
      aridity: resolvedConfig.aridity,
    });

    const { biomeIndex, vegetationDensity } = classifyBiomesFromFields({
      width,
      height,
      landMask,
      humidity,
      effectiveMoistureF64,
      surfaceTemperatureF64,
      aridityIndexF64,
      config: resolvedConfig,
    });

    // IMPORTANT: Preserve behavior by avoiding intermediate float32 rounding.
    // The original implementation used full-precision JS numbers for classification, then stored
    // results into float32 arrays at the end of each iteration. We preserve that by computing in
    // float64 first, then casting to float32 once here.
    const surfaceTemperature = new Float32Array(size);
    const effectiveMoisture = new Float32Array(size);
    const aridityIndex = new Float32Array(size);
    for (let i = 0; i < size; i++) {
      surfaceTemperature[i] = surfaceTemperatureF64[i] ?? 0;
      effectiveMoisture[i] = effectiveMoistureF64[i] ?? 0;
      aridityIndex[i] = aridityIndexF64[i] ?? 0;
    }

    return {
      biomeIndex,
      vegetationDensity,
      effectiveMoisture,
      surfaceTemperature,
      aridityIndex,
      freezeIndex,
    };
  },
});
