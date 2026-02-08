import { clamp01, clampChance, createLabelRng, rollPercent } from "@swooper/mapgen-core";

import {
  FEATURE_KEY_INDEX,
  biomeSymbolFromIndex,
} from "@mapgen/domain/ecology/types.js";

import { pickVegetatedFeature } from "./selection.js";

type VegetatedFeatureKey =
  | "FEATURE_FOREST"
  | "FEATURE_RAINFOREST"
  | "FEATURE_TAIGA"
  | "FEATURE_SAVANNA_WOODLAND"
  | "FEATURE_SAGEBRUSH_STEPPE";

type VegetatedPlacementInput = Readonly<{
  width: number;
  height: number;
  seed: number;
  biomeIndex: Uint8Array;
  vegetationDensity: Float32Array;
  effectiveMoisture: Float32Array;
  surfaceTemperature: Float32Array;
  aridityIndex: Float32Array;
  freezeIndex: Float32Array;
  landMask: Uint8Array;
  navigableRiverMask: Uint8Array;
  featureKeyField: Int16Array;
}>;

type VegetatedPlacementConfig = Readonly<{
  multiplier: number;
  chances: Readonly<Record<VegetatedFeatureKey, number>>;
  rules: Readonly<{
    minVegetationByBiome: Readonly<Record<ReturnType<typeof biomeSymbolFromIndex>, number>>;
    vegetationChanceScalar: number;
    desertSagebrushMinVegetation: number;
    desertSagebrushMaxAridity: number;
    tundraTaigaMinVegetation: number;
    tundraTaigaMinTemperature: number;
    tundraTaigaMaxFreeze: number;
    temperateDryForestMoisture: number;
    temperateDryForestMaxAridity: number;
    temperateDryForestVegetation: number;
    tropicalSeasonalRainforestMoisture: number;
    tropicalSeasonalRainforestMaxAridity: number;
  }>;
}>;

export type VegetatedFeaturePlacementsPlanArgs = Readonly<{
  input: VegetatedPlacementInput;
  config: VegetatedPlacementConfig;
}>;

const NO_FEATURE = -1;

export function planVegetatedFeaturePlacementsShared(args: {
  input: VegetatedPlacementInput;
  config: VegetatedPlacementConfig;
  featureKey: VegetatedFeatureKey;
}): Readonly<{ placements: Array<{ x: number; y: number; feature: VegetatedFeatureKey }> }> {
  const { input, config, featureKey } = args;

  const rng = createLabelRng(input.seed);

  const { width, height, landMask, navigableRiverMask, featureKeyField } = input;
  const isNavigableRiverPlot = (x: number, y: number): boolean =>
    navigableRiverMask[y * width + x] === 1;

  const featureField = featureKeyField.slice();
  const placements: Array<{ x: number; y: number; feature: VegetatedFeatureKey }> = [];

  const canPlaceAt = (x: number, y: number): boolean =>
    featureField[y * width + x] === NO_FEATURE;

  const setPlanned = (x: number, y: number): void => {
    const idx = y * width + x;
    const featureIdx = FEATURE_KEY_INDEX[featureKey];
    featureField[idx] = featureIdx;
    placements.push({ x, y, feature: featureKey });
  };

  const multiplier = config.multiplier;
  if (multiplier <= 0) {
    return { placements };
  }

  const baseChance = clampChance(config.chances[featureKey] * multiplier);
  if (baseChance <= 0) {
    return { placements };
  }

  const rules = config.rules;
  const minVegetationByBiome = rules.minVegetationByBiome;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * width;
    for (let x = 0; x < width; x++) {
      const idx = rowOffset + x;
      if (landMask[idx] === 0) continue;
      if (isNavigableRiverPlot(x, y)) continue;

      const vegetationValue = input.vegetationDensity[idx];
      const symbolIndex = input.biomeIndex[idx] | 0;
      const minVeg = minVegetationByBiome[biomeSymbolFromIndex(symbolIndex)];
      if (vegetationValue < minVeg) continue;

      const selected = pickVegetatedFeature({
        symbolIndex,
        moistureValue: input.effectiveMoisture[idx],
        temperatureValue: input.surfaceTemperature[idx],
        vegetationValue,
        aridityIndex: input.aridityIndex[idx],
        freezeIndex: input.freezeIndex[idx],
        rules: {
          desertSagebrushMinVegetation: rules.desertSagebrushMinVegetation,
          desertSagebrushMaxAridity: rules.desertSagebrushMaxAridity,
          tundraTaigaMinVegetation: rules.tundraTaigaMinVegetation,
          tundraTaigaMinTemperature: rules.tundraTaigaMinTemperature,
          tundraTaigaMaxFreeze: rules.tundraTaigaMaxFreeze,
          temperateDryForestMoisture: rules.temperateDryForestMoisture,
          temperateDryForestMaxAridity: rules.temperateDryForestMaxAridity,
          temperateDryForestVegetation: rules.temperateDryForestVegetation,
          tropicalSeasonalRainforestMoisture: rules.tropicalSeasonalRainforestMoisture,
          tropicalSeasonalRainforestMaxAridity: rules.tropicalSeasonalRainforestMaxAridity,
        },
      });
      if (selected !== featureKey) continue;
      if (!canPlaceAt(x, y)) continue;

      const vegetationScalar = clamp01(vegetationValue * rules.vegetationChanceScalar);
      const chance = clampChance(baseChance * vegetationScalar);
      if (!rollPercent(rng, `features:plan:vegetated:${featureKey}`, chance)) continue;
      setPlanned(x, y);
    }
  }

  return { placements };
}

