import { clamp01 } from "@swooper/mapgen-core";

import { biomeSymbolFromIndex, type FeatureKey } from "@mapgen/domain/ecology/types.js";

type VegetationPlanInput = Readonly<{
  width: number;
  height: number;
  biomeIndex: Uint8Array;
  vegetationDensity: Float32Array;
  effectiveMoisture: Float32Array;
  surfaceTemperature: Float32Array;
  fertility: Float32Array;
  landMask: Uint8Array;
}>;

type VegetationPlanConfig = Readonly<{
  baseDensity: number;
  fertilityWeight: number;
  moistureWeight: number;
  moistureNormalization: number;
  coldCutoff: number;
}>;

type Placement = Readonly<{
  x: number;
  y: number;
  feature: FeatureKey;
  weight: number;
}>;

export function planVegetationFeaturePlacements(args: {
  input: VegetationPlanInput;
  config: VegetationPlanConfig;
  mode: "default" | "clustered";
  featureKey: FeatureKey;
}): Readonly<{ placements: Placement[] }> {
  const { input, config, mode, featureKey } = args;
  const placements: Placement[] = [];

  const { width, height } = input;
  const moistureNormalization = Math.max(0.0001, config.moistureNormalization ?? 230);
  const fertility = input.fertility;

  const noise =
    mode === "clustered"
      ? (x: number, y: number) => (Math.sin((x + 1.3) * (y + 0.7)) + 1) * 0.25
      : null;

  for (let y = 0; y < height; y++) {
    const row = y * width;
    for (let x = 0; x < width; x++) {
      const idx = row + x;
      if (input.landMask[idx] === 0) continue;
      const vegetation = input.vegetationDensity[idx];
      if (vegetation <= 0) continue;
      const temp = input.surfaceTemperature[idx];
      if (temp < config.coldCutoff) continue;

      const fertilityValue = fertility[idx];
      const moisture = input.effectiveMoisture[idx];
      const moistureNorm = clamp01(moisture / moistureNormalization);
      const clusterBonus = noise ? noise(x, y) : 0;
      const weight = clamp01(
        vegetation *
          (config.baseDensity +
            fertilityValue * config.fertilityWeight +
            moistureNorm * config.moistureWeight +
            clusterBonus * (mode === "clustered" ? 0.15 : 0))
      );
      if (weight < 0.15) continue;

      const biomeSymbol = biomeSymbolFromIndex(input.biomeIndex[idx]);
      const selected: FeatureKey =
        biomeSymbol === "boreal"
          ? "FEATURE_TAIGA"
          : biomeSymbol === "temperateDry"
            ? "FEATURE_SAVANNA_WOODLAND"
            : biomeSymbol === "desert"
              ? "FEATURE_SAGEBRUSH_STEPPE"
              : mode === "clustered"
                ? vegetation + clusterBonus > 0.75
                  ? "FEATURE_RAINFOREST"
                  : "FEATURE_FOREST"
                : vegetation > 0.7
                  ? "FEATURE_RAINFOREST"
                  : "FEATURE_FOREST";

      if (selected !== featureKey) continue;
      placements.push({ x, y, feature: selected, weight });
    }
  }

  return { placements };
}

