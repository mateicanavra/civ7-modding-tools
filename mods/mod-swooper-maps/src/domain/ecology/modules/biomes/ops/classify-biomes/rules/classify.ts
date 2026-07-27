import { BIOME_SYMBOL_TO_INDEX } from "../../../../../model/atoms/index.js";
import { aridityShiftForIndex, shiftMoistureZone } from "./aridity.js";
import { biomeSymbolForZones } from "./lookup.js";
import { moistureZoneOf } from "./moisture.js";
import { temperatureZoneOf } from "./temperature.js";
import { clamp01 } from "./util.js";
import { vegetationDensityForBiome } from "./vegetation.js";

type BiophysicalGaussianConfig = Readonly<{
  moisture: Readonly<{ thresholds: readonly [number, number, number, number] }>;
  vegetation: Readonly<{
    base: number;
    moistureWeight: number;
    moistureNormalizationPadding: number;
  }>;
  temperature: Readonly<{
    polarCutoff: number;
    tundraCutoff: number;
    midLatitude: number;
    tropicalThreshold: number;
  }>;
  aridity: Readonly<{
    moistureShiftThresholds: readonly [number, number];
    vegetationPenalty: number;
  }>;
}>;

/**
 * Classifies land tiles into biome symbols and vegetation density from prepared
 * ecology fields using the classify-biomes operation policy.
 */
export function classifyBiomesFromFields(args: {
  readonly width: number;
  readonly height: number;
  readonly landMask: ArrayLike<number>;
  readonly effectiveMoistureF64: ArrayLike<number>;
  readonly surfaceTemperatureF64: ArrayLike<number>;
  readonly freezeIndex: ArrayLike<number>;
  readonly aridityIndexF64: ArrayLike<number>;
  readonly soilType: ArrayLike<number>;
  readonly fertility: ArrayLike<number>;
  readonly config: Readonly<BiophysicalGaussianConfig>;
}): Readonly<{ biomeIndex: Uint8Array; vegetationDensity: Float32Array }> {
  const { width, height } = args;
  const size = width * height;

  const biomeIndex = new Uint8Array(size).fill(255);
  const vegetationDensity = new Float32Array(size);

  const [dry, semiArid, subhumid, humidThreshold] = args.config.moisture.thresholds;
  const moistureNormalization =
    humidThreshold + args.config.vegetation.moistureNormalizationPadding;
  const energyMin = args.config.temperature.polarCutoff;
  const energyMax = args.config.temperature.tropicalThreshold;
  const energyRange = Math.max(1e-6, energyMax - energyMin);

  for (let i = 0; i < size; i++) {
    if (args.landMask[i] === 0) {
      biomeIndex[i] = 255;
      vegetationDensity[i] = 0;
      continue;
    }

    const temperature = args.surfaceTemperatureF64[i] ?? 0;
    const moisture = args.effectiveMoistureF64[i] ?? 0;
    const aridity = args.aridityIndexF64[i] ?? 0;
    const freezeIndex = args.freezeIndex[i] ?? 0;
    const energy01 = clamp01((temperature - energyMin) / energyRange);

    const aridityShift = aridityShiftForIndex(aridity, args.config.aridity.moistureShiftThresholds);
    const moistureZone = shiftMoistureZone(
      moistureZoneOf(moisture, [dry, semiArid, subhumid, humidThreshold]),
      aridityShift
    );

    const tropicalThreshold = args.config.temperature.tropicalThreshold;
    const transitionBandC = 1.25;

    let tempZone = temperatureZoneOf(temperature, args.config.temperature);
    if (
      (tempZone === "temperate" || tempZone === "tropical") &&
      Math.abs(temperature - tropicalThreshold) <= transitionBandC
    ) {
      // Soft transition: use a stronger x-varying wetness signal (Hydrology effectiveMoisture)
      // to prevent row-perfect biome cutoffs near the tropical threshold.
      const transitionDenom = Math.max(1e-6, humidThreshold - subhumid);
      const wetness01 = clamp01((moisture - subhumid) / transitionDenom);
      const wetnessShiftRaw = (wetness01 - 0.55) * 2.0;
      const wetnessShiftC = Math.max(-1, Math.min(1, wetnessShiftRaw)); // [-1C..+1C]
      const wetnessShiftScaleC = 1.4;
      const effectiveThreshold = tropicalThreshold - wetnessShiftC * wetnessShiftScaleC;
      tempZone = temperature >= effectiveThreshold ? "tropical" : "temperate";
    }

    const symbol = biomeSymbolForZones(tempZone, moistureZone);
    biomeIndex[i] = BIOME_SYMBOL_TO_INDEX[symbol]!;

    const moistureNorm = clamp01(moisture / moistureNormalization);
    vegetationDensity[i] = vegetationDensityForBiome(symbol, {
      base: args.config.vegetation.base,
      moistureWeight: args.config.vegetation.moistureWeight,
      moistureNorm,
      energy01,
      freezeIndex,
      aridityIndex: aridity,
      aridityStressWeight: args.config.aridity.vegetationPenalty,
      fertility01: args.fertility[i] ?? 0,
      soilType: args.soilType[i] ?? 0,
    });
  }

  return { biomeIndex, vegetationDensity };
}
