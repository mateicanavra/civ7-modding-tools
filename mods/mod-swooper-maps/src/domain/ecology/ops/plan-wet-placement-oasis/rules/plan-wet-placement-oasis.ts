import type { Static } from "@swooper/mapgen-core/authoring";
import { clampChance, createLabelRng, rollPercent } from "@swooper/mapgen-core";

import { biomeSymbolFromIndex, FEATURE_KEY_INDEX } from "@mapgen/domain/ecology/types.js";

import PlanWetPlacementOasisContract from "../contract.js";
import { hasAdjacentFeatureType } from "./has-adjacent-feature-type.js";
import { isCoastalLand } from "./is-coastal-land.js";

type Config = Static<(typeof PlanWetPlacementOasisContract)["strategies"]["default"]>;
type Input = Static<(typeof PlanWetPlacementOasisContract)["input"]>;
type Placement = Static<(typeof PlanWetPlacementOasisContract)["output"]>["placements"][number];

const NO_FEATURE = -1;

export function planWetPlacementOasis(
  input: Input,
  config: Config
): Readonly<{ placements: Placement[] }> {
  const rng = createLabelRng(input.seed);
  const { width, height, biomeIndex, landMask, navigableRiverMask } = input;

  const featureField = input.featureKeyField.slice();
  const placements: Placement[] = [];

  const multiplier = config.multiplier;
  if (multiplier <= 0) return { placements };

  const chance = clampChance(config.chances.FEATURE_OASIS * multiplier);
  if (chance <= 0) return { placements };

  const isWater = (x: number, y: number): boolean => landMask[y * width + x] === 0;
  const oasisBiomeSet = new Set(config.rules.oasisBiomeSymbols);
  const coastalRadius = config.rules.coastalAdjacencyRadius;
  const spacingRadius = config.rules.isolatedSpacingRadius;
  const featureIdx = FEATURE_KEY_INDEX.FEATURE_OASIS;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * width;
    for (let x = 0; x < width; x++) {
      const idx = rowOffset + x;
      if (landMask[idx] === 0) continue;
      if (navigableRiverMask[idx] === 1) continue;
      if (isCoastalLand(isWater, width, height, x, y, coastalRadius)) continue;
      if (input.isolatedRiverMask[idx] === 1) continue;

      const symbol = biomeSymbolFromIndex(biomeIndex[idx] | 0);
      if (!oasisBiomeSet.has(symbol)) continue;

      if (featureField[idx] !== NO_FEATURE) continue;
      if (hasAdjacentFeatureType(featureField, width, height, x, y, featureIdx, spacingRadius)) {
        continue;
      }
      if (!rollPercent(rng, "features:plan:wet:FEATURE_OASIS", chance)) continue;

      featureField[idx] = featureIdx;
      placements.push({ x, y, feature: "FEATURE_OASIS" });
    }
  }

  return { placements };
}

