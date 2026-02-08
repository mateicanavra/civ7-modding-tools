import type { BiomeClassificationTypes } from "../types.js";
import {
  computeEffectiveMoisture,
  computeRiparianMoistureBonus,
  pseudoRandom01,
} from "../rules/index.js";

type MoistureConfig = BiomeClassificationTypes["config"]["default"]["moisture"];
type NoiseConfig = BiomeClassificationTypes["config"]["default"]["noise"];
type RiparianConfig = BiomeClassificationTypes["config"]["default"]["riparian"];

export function computeEffectiveMoistureField(args: {
  width: number;
  height: number;
  landMask: Uint8Array;
  rainfall: Uint8Array;
  humidity: Uint8Array;
  riverClass: Uint8Array;
  moisture: MoistureConfig;
  noise: NoiseConfig;
  riparian: RiparianConfig | undefined;
}): Float64Array {
  const { width, height } = args;
  const size = width * height;

  const effectiveMoisture = new Float64Array(size);

  const noiseScale = args.noise.amplitude * 255;
  const riparianBonusByTile = computeRiparianMoistureBonus({
    width,
    height,
    riverClass: args.riverClass,
    cfg: args.riparian,
  });

  for (let i = 0; i < size; i++) {
    if (args.landMask[i] === 0) {
      effectiveMoisture[i] = 0;
      continue;
    }

    const noise = (pseudoRandom01(i, args.noise.seed) - 0.5) * 2;
    const moistureBonus = riparianBonusByTile[i] ?? 0;
    effectiveMoisture[i] = computeEffectiveMoisture({
      rainfall: args.rainfall[i],
      humidity: args.humidity[i],
      bias: args.moisture.bias,
      humidityWeight: args.moisture.humidityWeight,
      moistureBonus,
      noise,
      noiseScale,
    });
  }

  return effectiveMoisture;
}
