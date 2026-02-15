import { createStrategy } from "@swooper/mapgen-core/authoring";

import BiomeClassificationContract from "../contract.js";
import { classifyBiomesFromFields } from "../layers/classify.js";
import { computeEffectiveMoistureField } from "../layers/moisture.js";

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
    const surfaceTemperatureC = input.surfaceTemperatureC as Float32Array;
    const aridityIndexIn = input.aridityIndex as Float32Array;
    const freezeIndex = input.freezeIndex as Float32Array;
    const landMask = input.landMask as Uint8Array;
    const riverClass = input.riverClass as Uint8Array;

    // M3: Biomes consumes Hydrology’s derived indices rather than re-deriving locally.
    const surfaceTemperatureF64 = new Float64Array(size);
    const aridityIndexF64 = new Float64Array(size);
    for (let i = 0; i < size; i++) {
      surfaceTemperatureF64[i] = surfaceTemperatureC[i] ?? 0;
      aridityIndexF64[i] = aridityIndexIn[i] ?? 0;
    }

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

    const effectiveMoisture = new Float32Array(size);
    for (let i = 0; i < size; i++) {
      effectiveMoisture[i] = effectiveMoistureF64[i] ?? 0;
    }

    return {
      biomeIndex: refinedBiomeIndex,
      vegetationDensity,
      effectiveMoisture,
      surfaceTemperature: surfaceTemperatureC,
      aridityIndex: aridityIndexIn,
      freezeIndex,
    };
  },
});
