import { clampChance, createLabelRng } from "@swooper/mapgen-core";
import { createStrategy, type Static } from "@swooper/mapgen-core/authoring";

import { FEATURE_KEY_INDEX } from "@mapgen/domain/ecology/types.js";
import { biomeSymbolFromIndex, type BiomeSymbol } from "@mapgen/domain/ecology/types.js";

import PlanVegetationEmbellishmentsForestDensityContract from "../contract.js";

type Config = Static<(typeof PlanVegetationEmbellishmentsForestDensityContract)["strategies"]["default"]>;
type Placement = Static<(typeof PlanVegetationEmbellishmentsForestDensityContract)["output"]>["placements"][number];

const NO_FEATURE = -1;

const GRASSLAND_BIOMES: ReadonlySet<BiomeSymbol> = new Set(["temperateHumid", "tropicalSeasonal"]);

function normalizeConfig(config: Config): Config {
  const densityCfg = config.featuresDensity;
  return {
    ...config,
    featuresDensity: {
      ...densityCfg,
      forestExtraChance: clampChance(densityCfg.forestExtraChance),
      minVegetationForBonus: Math.max(0, Math.min(1, densityCfg.minVegetationForBonus)),
    },
  };
}

export const defaultStrategy = createStrategy(
  PlanVegetationEmbellishmentsForestDensityContract,
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

      const forestExtraChance = densityCfg.forestExtraChance ?? 0;
      const forestVegetationScale = densityCfg.forestVegetationScale ?? 0;
      const forestMinRainfall = densityCfg.forestMinRainfall ?? 0;
      const minVegetationForBonus = densityCfg.minVegetationForBonus;

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
          if (!GRASSLAND_BIOMES.has(biome)) continue;

          const rainfallValue = rainfall[idx] | 0;
          if (rainfallValue < forestMinRainfall) continue;

          const chance = clampChance(
            forestExtraChance + Math.round(vegetation * forestVegetationScale)
          );
          if (rng(100, "features:plan:vegetation:forest") >= chance) continue;

          featureField[idx] = FEATURE_KEY_INDEX.FEATURE_FOREST;
          placements.push({ x, y, feature: "FEATURE_FOREST" });
        }
      }

      return { placements };
    },
  }
);

