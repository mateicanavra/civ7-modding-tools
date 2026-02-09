import { clampChance } from "@swooper/mapgen-core";
import type { Static } from "@swooper/mapgen-core/authoring";

import PlanWetPlacementMangroveContract from "../contract.js";

type Config = Static<(typeof PlanWetPlacementMangroveContract)["strategies"]["default"]>;

function normalizeRadius(value: number): number {
  return Math.max(1, Math.floor(value));
}

export function normalizePlanWetPlacementMangroveConfig(config: Config): Config {
  const rules = config.rules;
  return {
    ...config,
    multiplier: Math.max(0, config.multiplier),
    chances: {
      FEATURE_MARSH: clampChance(config.chances.FEATURE_MARSH),
      FEATURE_TUNDRA_BOG: clampChance(config.chances.FEATURE_TUNDRA_BOG),
      FEATURE_MANGROVE: clampChance(config.chances.FEATURE_MANGROVE),
      FEATURE_OASIS: clampChance(config.chances.FEATURE_OASIS),
      FEATURE_WATERING_HOLE: clampChance(config.chances.FEATURE_WATERING_HOLE),
    },
    rules: {
      ...rules,
      nearRiverRadius: normalizeRadius(rules.nearRiverRadius),
      coastalAdjacencyRadius: normalizeRadius(rules.coastalAdjacencyRadius),
      isolatedRiverRadius: normalizeRadius(rules.isolatedRiverRadius),
      isolatedSpacingRadius: normalizeRadius(rules.isolatedSpacingRadius),
    },
  };
}

