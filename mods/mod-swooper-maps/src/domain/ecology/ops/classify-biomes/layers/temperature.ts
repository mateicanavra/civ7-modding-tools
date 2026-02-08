import type { BiomeClassificationTypes } from "../types.js";
import { computeFreezeIndex, computeTemperature } from "../rules/index.js";

type TemperatureConfig = BiomeClassificationTypes["config"]["default"]["temperature"];
type FreezeConfig = BiomeClassificationTypes["config"]["default"]["freeze"];

export function computeSurfaceTemperatureAndFreezeIndex(args: {
  width: number;
  height: number;
  landMask: Uint8Array;
  elevation: Int16Array;
  latitude: Float32Array;
  maxLatitude: number;
  temperature: TemperatureConfig;
  freeze: FreezeConfig;
}): Readonly<{ surfaceTemperatureF64: Float64Array; freezeIndex: Float32Array }> {
  const { width, height, landMask, elevation, latitude } = args;
  const size = width * height;

  const surfaceTemperatureF64 = new Float64Array(size);
  const freezeIndex = new Float32Array(size);

  for (let i = 0; i < size; i++) {
    const elevationMeters = landMask[i] === 0 ? 0 : elevation[i];
    const temperature = computeTemperature({
      latitudeAbs: Math.abs(latitude[i]),
      maxLatitude: args.maxLatitude,
      elevationMeters,
      cfg: args.temperature,
    });
    surfaceTemperatureF64[i] = temperature;
    freezeIndex[i] = computeFreezeIndex(temperature, args.freeze);
  }

  return { surfaceTemperatureF64, freezeIndex };
}
