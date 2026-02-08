import type { Static } from "@swooper/mapgen-core/authoring";
import { clampChance, createLabelRng, rollPercent } from "@swooper/mapgen-core";

import { biomeSymbolFromIndex, FEATURE_KEY_INDEX } from "@mapgen/domain/ecology/types.js";

import PlanWetPlacementMangroveContract from "../contract.js";
import { isCoastalLand } from "./is-coastal-land.js";

type Config = Static<(typeof PlanWetPlacementMangroveContract)["strategies"]["default"]>;
type Input = Static<(typeof PlanWetPlacementMangroveContract)["input"]>;
type Placement =
  Static<(typeof PlanWetPlacementMangroveContract)["output"]>["placements"][number];

const NO_FEATURE = -1;

export function planWetPlacementMangrove(
  input: Input,
  config: Config
): Readonly<{ placements: Placement[] }> {
  const rng = createLabelRng(input.seed);
  const { width, height, biomeIndex, surfaceTemperature, landMask, navigableRiverMask } = input;

  const featureField = input.featureKeyField.slice();
  const placements: Placement[] = [];

  const multiplier = config.multiplier;
  if (multiplier <= 0) return { placements };

  const chance = clampChance(config.chances.FEATURE_MANGROVE * multiplier);
  if (chance <= 0) return { placements };

  const isWater = (x: number, y: number): boolean => landMask[y * width + x] === 0;
  const warmBiomeSet = new Set(config.rules.mangroveWarmBiomeSymbols);
  const coastalRadius = config.rules.coastalAdjacencyRadius;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * width;
    for (let x = 0; x < width; x++) {
      const idx = rowOffset + x;
      if (landMask[idx] === 0) continue;
      if (navigableRiverMask[idx] === 1) continue;
      if (!isCoastalLand(isWater, width, height, x, y, coastalRadius)) continue;

      const symbol = biomeSymbolFromIndex(biomeIndex[idx] | 0);
      const isWarm =
        warmBiomeSet.has(symbol) || surfaceTemperature[idx] >= config.rules.mangroveWarmTemperatureMin;
      if (!isWarm) continue;

      if (featureField[idx] !== NO_FEATURE) continue;
      if (!rollPercent(rng, "features:plan:wet:mangrove", chance)) continue;

      featureField[idx] = FEATURE_KEY_INDEX.FEATURE_MANGROVE;
      placements.push({ x, y, feature: "FEATURE_MANGROVE" });
    }
  }

  return { placements };
}

