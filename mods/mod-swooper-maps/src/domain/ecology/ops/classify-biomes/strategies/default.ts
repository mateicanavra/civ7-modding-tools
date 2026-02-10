import { createStrategy } from "@swooper/mapgen-core/authoring";

import BiomeClassificationContract from "../contract.js";
import { computeMaxLatitude } from "../rules/index.js";
import { computeAridityIndexField } from "../layers/aridity.js";
import { classifyBiomesFromFields } from "../layers/classify.js";
import { computeEffectiveMoistureField } from "../layers/moisture.js";
import { computeSurfaceTemperatureAndFreezeIndex } from "../layers/temperature.js";

function refineBiomeIndexGaussian(args: {
  width: number;
  height: number;
  biomeIndex: Uint8Array;
  landMask: Uint8Array;
  radius: number;
  iterations: number;
}): Uint8Array {
  const { width, height } = args;
  const size = width * height;
  if (args.biomeIndex.length !== size || args.landMask.length !== size) {
    throw new Error("Biome edge refinement (gaussian): invalid input size.");
  }

  const radius = args.radius | 0;
  const sigma = Math.max(1, radius);
  const kernel: number[] = [];
  let kernelSum = 0;
  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      const weight = Math.exp(-(dx * dx + dy * dy) / (2 * sigma * sigma));
      kernel.push(weight);
      kernelSum += weight;
    }
  }
  if (kernelSum > 0) {
    for (let i = 0; i < kernel.length; i++) kernel[i] = (kernel[i] ?? 0) / kernelSum;
  }

  let working = new Uint8Array(args.biomeIndex);
  for (let iter = 0; iter < args.iterations; iter++) {
    const next = new Uint8Array(size);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        if (args.landMask[idx] === 0) {
          next[idx] = 255;
          continue;
        }

        const weighted: Record<number, number> = Object.create(null);
        let idxKernel = 0;
        for (let dy = -radius; dy <= radius; dy++) {
          const ny = y + dy;
          if (ny < 0 || ny >= height) {
            idxKernel += radius * 2 + 1;
            continue;
          }
          for (let dx = -radius; dx <= radius; dx++) {
            const nx = x + dx;
            if (nx < 0 || nx >= width) {
              idxKernel += 1;
              continue;
            }
            const nIdx = ny * width + nx;
            if (args.landMask[nIdx] === 0) {
              idxKernel += 1;
              continue;
            }
            const weight = kernel[idxKernel] ?? 0;
            const biome = working[nIdx] ?? 255;
            weighted[biome] = (weighted[biome] ?? 0) + weight;
            idxKernel += 1;
          }
        }
        let bestBiome = working[idx] ?? 255;
        let bestScore = -1;
        for (const [biome, score] of Object.entries(weighted)) {
          if (score > bestScore) {
            bestScore = score;
            bestBiome = Number(biome);
          }
        }
        next[idx] = bestBiome;
      }
    }
    working = next;
  }

  return working;
}

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
      freezeIndex,
      aridityIndexF64,
      config: resolvedConfig,
    });

    // M3: Biome edge refinement is integrated into classifyBiomes (no separate refine step).
    const refinedBiomeIndex = refineBiomeIndexGaussian({
      width,
      height,
      biomeIndex,
      landMask,
      radius: resolvedConfig.edgeRefine?.radius ?? 1,
      iterations: resolvedConfig.edgeRefine?.iterations ?? 1,
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
      biomeIndex: refinedBiomeIndex,
      vegetationDensity,
      effectiveMoisture,
      surfaceTemperature,
      aridityIndex,
      freezeIndex,
    };
  },
});
