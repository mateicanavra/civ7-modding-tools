import { BIOME_SYMBOL_TO_INDEX, type BiomeSymbol } from "@mapgen/domain/ecology/types.js";

import type { BiomeClassificationTypes } from "../types.js";
import {
  aridityShiftForIndex,
  biomeSymbolForZones,
  clamp01,
  moistureZoneOf,
  shiftMoistureZone,
  temperatureZoneOf,
  vegetationDensityForBiome,
} from "../rules/index.js";

type DefaultConfig = BiomeClassificationTypes["config"]["default"];

export function classifyBiomesFromFields(args: {
  width: number;
  height: number;
  landMask: Uint8Array;
  humidity: Uint8Array;
  effectiveMoistureF64: Float64Array;
  surfaceTemperatureF64: Float64Array;
  aridityIndexF64: Float64Array;
  config: DefaultConfig;
}): Readonly<{ biomeIndex: Uint8Array; vegetationDensity: Float32Array }> {
  const { width, height } = args;
  const size = width * height;

  const biomeIndex = new Uint8Array(size).fill(255);
  const vegetationDensity = new Float32Array(size);

  const [dry, semiArid, subhumid, humidThreshold] = args.config.moisture.thresholds;
  const moistureNormalization =
    humidThreshold + args.config.vegetation.moistureNormalizationPadding;

  const biomeModifiers = args.config.vegetation
    .biomeModifiers as Record<BiomeSymbol, { multiplier: number; bonus: number }>;

  for (let i = 0; i < size; i++) {
    if (args.landMask[i] === 0) {
      biomeIndex[i] = 255;
      vegetationDensity[i] = 0;
      continue;
    }

    const temperature = args.surfaceTemperatureF64[i];
    const moisture = args.effectiveMoistureF64[i];
    const aridity = args.aridityIndexF64[i];

    const tempZone = temperatureZoneOf(temperature, args.config.temperature);
    const moistureZone = shiftMoistureZone(
      moistureZoneOf(moisture, [dry, semiArid, subhumid, humidThreshold]),
      aridityShiftForIndex(aridity, args.config.aridity.moistureShiftThresholds)
    );
    const symbol = biomeSymbolForZones(tempZone, moistureZone);
    biomeIndex[i] = BIOME_SYMBOL_TO_INDEX[symbol]!;

    const moistureNorm = clamp01(moisture / moistureNormalization);
    const humidityNorm = clamp01(args.humidity[i] / 255);
    vegetationDensity[i] = vegetationDensityForBiome(symbol, {
      base: args.config.vegetation.base,
      moistureWeight: args.config.vegetation.moistureWeight,
      humidityWeight: args.config.vegetation.humidityWeight,
      moistureNorm,
      humidityNorm,
      aridityIndex: aridity,
      aridityPenalty: args.config.aridity.vegetationPenalty,
      modifiers: biomeModifiers,
    });
  }

  return { biomeIndex, vegetationDensity };
}
