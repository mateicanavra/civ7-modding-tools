import { clampChance, createLabelRng } from "@swooper/mapgen-core";
import { createStrategy, type Static } from "@swooper/mapgen-core/authoring";

import { FEATURE_KEY_INDEX } from "@mapgen/domain/ecology/types.js";
import { biomeSymbolFromIndex, type BiomeSymbol } from "@mapgen/domain/ecology/types.js";

import PlanVegetationEmbellishmentsRainforestDensityContract from "../contract.js";

type Config = Static<(typeof PlanVegetationEmbellishmentsRainforestDensityContract)["strategies"]["default"]>;
type Placement = Static<(typeof PlanVegetationEmbellishmentsRainforestDensityContract)["output"]>["placements"][number];

const NO_FEATURE = -1;

function normalizeConfig(config: Config): Config {
  const densityCfg = config.featuresDensity;
  return {
    ...config,
    featuresDensity: {
      ...densityCfg,
      rainforestExtraChance: clampChance(densityCfg.rainforestExtraChance),
      minVegetationForBonus: Math.max(0, Math.min(1, densityCfg.minVegetationForBonus)),
    },
  };
}

export const defaultStrategy = createStrategy(
  PlanVegetationEmbellishmentsRainforestDensityContract,
  "default",
  {
    normalize: (config) => normalizeConfig(config),
    run: (input, config) => {
      const {
        width,
        height,
        landMask,
        terrainType,
        featureKeyField,
        biomeIndex,
        rainfall,
        vegetationDensity,
        navigableRiverTerrain,
      } = input;

      const rng = createLabelRng(input.seed);
      const featureField = featureKeyField.slice();
      const placements: Placement[] = [];

      const densityCfg = config.featuresDensity;

      const rainforestExtraChance = densityCfg.rainforestExtraChance ?? 0;
      const rainforestVegetationScale = densityCfg.rainforestVegetationScale ?? 0;
      const rainforestMinRainfall = densityCfg.rainforestMinRainfall ?? 0;
      const minVegetationForBonus = densityCfg.minVegetationForBonus;

      const tropicalBiome: BiomeSymbol = "tropicalRainforest";

      for (let y = 0; y < height; y++) {
        const row = y * width;
        for (let x = 0; x < width; x++) {
          const idx = row + x;
          if (landMask[idx] === 0) continue;
          if (featureField[idx] !== NO_FEATURE) continue;
          if (navigableRiverTerrain >= 0 && terrainType[idx] === navigableRiverTerrain) continue;

          const vegetation = vegetationDensity[idx];
          if (vegetation < minVegetationForBonus) continue;

          const biome = biomeSymbolFromIndex(biomeIndex[idx] | 0);
          if (biome !== tropicalBiome) continue;

          const rainfallValue = rainfall[idx] | 0;
          if (rainfallValue < rainforestMinRainfall) continue;

          const chance = clampChance(
            rainforestExtraChance + Math.round(vegetation * rainforestVegetationScale)
          );
          if (rng(100, "features:plan:vegetation:rainforest") >= chance) continue;

          featureField[idx] = FEATURE_KEY_INDEX.FEATURE_RAINFOREST;
          placements.push({ x, y, feature: "FEATURE_RAINFOREST" });
        }
      }

      return { placements };
    },
  }
);

