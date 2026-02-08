import { clamp01, clampChance } from "@swooper/mapgen-core";
import { type Static } from "@swooper/mapgen-core/authoring";

import PlanVegetatedFeaturePlacementsContract from "../contract.js";

type Config = Static<(typeof PlanVegetatedFeaturePlacementsContract)["strategies"]["default"]>;

export function normalizeVegetatedFeaturePlacementsConfig(config: Config): Config {
  const rules = config.rules;
  return {
    ...config,
    multiplier: Math.max(0, config.multiplier),
    chances: {
      FEATURE_FOREST: clampChance(config.chances.FEATURE_FOREST),
      FEATURE_RAINFOREST: clampChance(config.chances.FEATURE_RAINFOREST),
      FEATURE_TAIGA: clampChance(config.chances.FEATURE_TAIGA),
      FEATURE_SAVANNA_WOODLAND: clampChance(config.chances.FEATURE_SAVANNA_WOODLAND),
      FEATURE_SAGEBRUSH_STEPPE: clampChance(config.chances.FEATURE_SAGEBRUSH_STEPPE),
    },
    rules: {
      ...rules,
      minVegetationByBiome: {
        snow: clamp01(rules.minVegetationByBiome.snow),
        tundra: clamp01(rules.minVegetationByBiome.tundra),
        boreal: clamp01(rules.minVegetationByBiome.boreal),
        temperateDry: clamp01(rules.minVegetationByBiome.temperateDry),
        temperateHumid: clamp01(rules.minVegetationByBiome.temperateHumid),
        tropicalSeasonal: clamp01(rules.minVegetationByBiome.tropicalSeasonal),
        tropicalRainforest: clamp01(rules.minVegetationByBiome.tropicalRainforest),
        desert: clamp01(rules.minVegetationByBiome.desert),
      },
      vegetationChanceScalar: Math.max(0, rules.vegetationChanceScalar),
      desertSagebrushMinVegetation: clamp01(rules.desertSagebrushMinVegetation),
      desertSagebrushMaxAridity: clamp01(rules.desertSagebrushMaxAridity),
      tundraTaigaMinVegetation: clamp01(rules.tundraTaigaMinVegetation),
      tundraTaigaMaxFreeze: clamp01(rules.tundraTaigaMaxFreeze),
      temperateDryForestMaxAridity: clamp01(rules.temperateDryForestMaxAridity),
      temperateDryForestVegetation: clamp01(rules.temperateDryForestVegetation),
      tropicalSeasonalRainforestMaxAridity: clamp01(rules.tropicalSeasonalRainforestMaxAridity),
    },
  };
}

