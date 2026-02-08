import { createStrategy, type Static } from "@swooper/mapgen-core/authoring";
import { clamp, clampChance, createLabelRng, rollPercent } from "@swooper/mapgen-core";

import { FEATURE_PLACEMENT_KEYS, type FeatureKey } from "@mapgen/domain/ecology/types.js";

import PlanAquaticReefPlacementsContract from "../contract.js";

type Config = Static<(typeof PlanAquaticReefPlacementsContract)["strategies"]["default"]>;
type Placement = Static<(typeof PlanAquaticReefPlacementsContract)["output"]>["placements"][number];

const FEATURE_KEY_INDEX: Record<FeatureKey, number> = FEATURE_PLACEMENT_KEYS.reduce(
  (acc, key, index) => {
    acc[key] = index;
    return acc;
  },
  {} as Record<FeatureKey, number>
);

const NO_FEATURE = -1;

function normalizeConfig(config: Config): Config {
  return {
    ...config,
    multiplier: Math.max(0, config.multiplier),
    chance: clampChance(config.chance),
    reefLatitudeSplit: clamp(config.reefLatitudeSplit, 0, 90),
  };
}

export const defaultStrategy = createStrategy(PlanAquaticReefPlacementsContract, "default", {
  normalize: (config) => normalizeConfig(config),
  run: (input, config) => {
    const chance = clampChance(config.chance * config.multiplier);
    if (chance <= 0) return { placements: [] };

    const rng = createLabelRng(input.seed);
    const { width, height, landMask, latitude, featureKeyField } = input;

    const featureField = featureKeyField.slice();
    const placements: Placement[] = [];

    for (let y = 0; y < height; y++) {
      const row = y * width;
      for (let x = 0; x < width; x++) {
        const idx = row + x;
        if (landMask[idx] !== 0) continue;
        if (featureField[idx] !== NO_FEATURE) continue;
        const absLat = Math.abs(latitude[idx]);
        if (absLat >= config.reefLatitudeSplit) continue;
        if (!rollPercent(rng, "features:plan:reef:FEATURE_REEF", chance)) continue;
        featureField[idx] = FEATURE_KEY_INDEX.FEATURE_REEF;
        placements.push({ x, y, feature: "FEATURE_REEF" });
      }
    }

    return { placements };
  },
});

