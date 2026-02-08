import type { BiomeClassificationTypes } from "../types.js";
import { computeAridityIndex } from "../rules/index.js";

type AridityConfig = BiomeClassificationTypes["config"]["default"]["aridity"];

export function computeAridityIndexField(args: {
  width: number;
  height: number;
  landMask: Uint8Array;
  rainfall: Uint8Array;
  humidity: Uint8Array;
  surfaceTemperatureF64: Float64Array;
  aridity: AridityConfig;
}): Float64Array {
  const { width, height } = args;
  const size = width * height;

  const aridityIndex = new Float64Array(size);
  for (let i = 0; i < size; i++) {
    if (args.landMask[i] === 0) {
      aridityIndex[i] = 0;
      continue;
    }
    aridityIndex[i] = computeAridityIndex({
      temperature: args.surfaceTemperatureF64[i],
      humidity: args.humidity[i],
      rainfall: args.rainfall[i],
      cfg: args.aridity,
    });
  }
  return aridityIndex;
}
