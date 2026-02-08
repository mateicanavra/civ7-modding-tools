import { createStrategy, type Static } from "@swooper/mapgen-core/authoring";
import { clamp, clampChance, createLabelRng, rollPercent } from "@swooper/mapgen-core";

import { FEATURE_PLACEMENT_KEYS, type FeatureKey } from "@mapgen/domain/ecology/types.js";

import PlanAquaticAtollPlacementsContract from "../contract.js";
import { hasAdjacentFeatureType, isAdjacentToShallowWater } from "../rules/index.js";

type Config = Static<(typeof PlanAquaticAtollPlacementsContract)["strategies"]["default"]>;
type Placement = Static<(typeof PlanAquaticAtollPlacementsContract)["output"]>["placements"][number];

const FEATURE_KEY_INDEX: Record<FeatureKey, number> = FEATURE_PLACEMENT_KEYS.reduce(
  (acc, key, index) => {
    acc[key] = index;
    return acc;
  },
  {} as Record<FeatureKey, number>
);

const NO_FEATURE = -1;

function normalizeConfig(config: Config): Config {
  const rules = config.rules;
  return {
    ...config,
    multiplier: Math.max(0, config.multiplier),
    chance: clampChance(config.chance),
    rules: {
      enableClustering: rules.enableClustering,
      clusterRadius: clamp(Math.floor(rules.clusterRadius), 0, 2),
      equatorialBandMaxAbsLatitude: clamp(rules.equatorialBandMaxAbsLatitude, 0, 90),
      shallowWaterAdjacencyGateChance: clampChance(rules.shallowWaterAdjacencyGateChance),
      shallowWaterAdjacencyRadius: Math.max(1, Math.floor(rules.shallowWaterAdjacencyRadius)),
      growthChanceEquatorial: clampChance(rules.growthChanceEquatorial),
      growthChanceNonEquatorial: clampChance(rules.growthChanceNonEquatorial),
    },
  };
}

export const defaultStrategy = createStrategy(PlanAquaticAtollPlacementsContract, "default", {
  normalize: (config) => normalizeConfig(config),
  run: (input, config) => {
    const baseChance = clampChance(config.chance * config.multiplier);
    if (baseChance <= 0) return { placements: [] };

    const rng = createLabelRng(input.seed);
    const { width, height, landMask, terrainType, latitude, featureKeyField, coastTerrain } = input;

    const isWater = (x: number, y: number): boolean => landMask[y * width + x] === 0;
    const getTerrainType = (x: number, y: number): number => terrainType[y * width + x];

    const featureField = featureKeyField.slice();
    const placements: Placement[] = [];

    const atollIdx = FEATURE_KEY_INDEX.FEATURE_ATOLL;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        if (!isWater(x, y)) continue;
        if (featureField[idx] !== NO_FEATURE) continue;

        let chance = baseChance;
        if (config.rules.enableClustering && config.rules.clusterRadius > 0) {
          if (hasAdjacentFeatureType(featureField, width, height, x, y, atollIdx, config.rules.clusterRadius)) {
            const absLat = Math.abs(latitude[idx]);
            chance =
              absLat <= config.rules.equatorialBandMaxAbsLatitude
                ? config.rules.growthChanceEquatorial
                : config.rules.growthChanceNonEquatorial;
          }
        }

        if (chance <= 0) continue;
        if (
          config.rules.shallowWaterAdjacencyGateChance > 0 &&
          isAdjacentToShallowWater(getTerrainType, coastTerrain, width, height, x, y, config.rules.shallowWaterAdjacencyRadius)
        ) {
          if (!rollPercent(rng, "features:plan:atoll:shallow-gate", config.rules.shallowWaterAdjacencyGateChance)) continue;
        }

        if (!rollPercent(rng, "features:plan:atoll", clampChance(chance))) continue;
        featureField[idx] = atollIdx;
        placements.push({ x, y, feature: "FEATURE_ATOLL" });
      }
    }

    return { placements };
  },
});

