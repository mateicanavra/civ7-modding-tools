import { clampChance, createLabelRng } from "@swooper/mapgen-core";
import { createStrategy, type Static } from "@swooper/mapgen-core/authoring";

import { FEATURE_KEY_INDEX } from "@mapgen/domain/ecology/types.js";
import { biomeSymbolFromIndex, type BiomeSymbol } from "@mapgen/domain/ecology/types.js";

import PlanVegetationEmbellishmentsTaigaDensityContract from "../contract.js";

type Config = Static<(typeof PlanVegetationEmbellishmentsTaigaDensityContract)["strategies"]["default"]>;
type Placement = Static<(typeof PlanVegetationEmbellishmentsTaigaDensityContract)["output"]>["placements"][number];

const NO_FEATURE = -1;

const TUNDRA_BIOMES: ReadonlySet<BiomeSymbol> = new Set(["snow", "tundra", "boreal"]);

function normalizeConfig(config: Config): Config {
  const densityCfg = config.featuresDensity;
  return {
    ...config,
    featuresDensity: {
      ...densityCfg,
      taigaExtraChance: clampChance(densityCfg.taigaExtraChance),
      minVegetationForBonus: Math.max(0, Math.min(1, densityCfg.minVegetationForBonus)),
    },
  };
}

export const defaultStrategy = createStrategy(
  PlanVegetationEmbellishmentsTaigaDensityContract,
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
        vegetationDensity,
        elevation,
        navigableRiverTerrain,
      } = input;

      const rng = createLabelRng(input.seed);
      const featureField = featureKeyField.slice();
      const placements: Placement[] = [];

      const densityCfg = config.featuresDensity;

      const taigaExtraChance = densityCfg.taigaExtraChance ?? 0;
      const taigaVegetationScale = densityCfg.taigaVegetationScale ?? 0;
      const taigaMaxElevation = densityCfg.taigaMaxElevation ?? Infinity;
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
          if (!TUNDRA_BIOMES.has(biome)) continue;

          if (elevation[idx] > taigaMaxElevation) continue;

          const chance = clampChance(taigaExtraChance + Math.round(vegetation * taigaVegetationScale));
          if (rng(100, "features:plan:vegetation:taiga") >= chance) continue;

          featureField[idx] = FEATURE_KEY_INDEX.FEATURE_TAIGA;
          placements.push({ x, y, feature: "FEATURE_TAIGA" });
        }
      }

      return { placements };
    },
  }
);

