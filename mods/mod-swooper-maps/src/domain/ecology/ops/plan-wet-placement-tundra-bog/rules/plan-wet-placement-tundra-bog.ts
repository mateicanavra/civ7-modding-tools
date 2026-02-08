import type { Static } from "@swooper/mapgen-core/authoring";
import { clampChance, createLabelRng, rollPercent } from "@swooper/mapgen-core";

import { biomeSymbolFromIndex, FEATURE_KEY_INDEX } from "@mapgen/domain/ecology/types.js";

import PlanWetPlacementTundraBogContract from "../contract.js";

type Config = Static<(typeof PlanWetPlacementTundraBogContract)["strategies"]["default"]>;
type Input = Static<(typeof PlanWetPlacementTundraBogContract)["input"]>;
type Placement =
  Static<(typeof PlanWetPlacementTundraBogContract)["output"]>["placements"][number];

const NO_FEATURE = -1;

export function planWetPlacementTundraBog(
  input: Input,
  config: Config
): Readonly<{ placements: Placement[] }> {
  const rng = createLabelRng(input.seed);
  const { width, height, biomeIndex, surfaceTemperature, landMask, navigableRiverMask } = input;

  const featureField = input.featureKeyField.slice();
  const placements: Placement[] = [];

  const multiplier = config.multiplier;
  if (multiplier <= 0) return { placements };

  const chance = clampChance(config.chances.FEATURE_TUNDRA_BOG * multiplier);
  if (chance <= 0) return { placements };

  const coldBiomeSet = new Set(config.rules.coldBiomeSymbols);
  for (let y = 0; y < height; y++) {
    const rowOffset = y * width;
    for (let x = 0; x < width; x++) {
      const idx = rowOffset + x;
      if (landMask[idx] === 0) continue;
      if (navigableRiverMask[idx] === 1) continue;
      if (input.nearRiverMask[idx] !== 1) continue;

      const symbol = biomeSymbolFromIndex(biomeIndex[idx] | 0);
      const isCold = coldBiomeSet.has(symbol) || surfaceTemperature[idx] <= config.rules.coldTemperatureMax;
      if (!isCold) continue;

      if (featureField[idx] !== NO_FEATURE) continue;
      if (!rollPercent(rng, "features:plan:wet:FEATURE_TUNDRA_BOG", chance)) continue;
      featureField[idx] = FEATURE_KEY_INDEX.FEATURE_TUNDRA_BOG;
      placements.push({ x, y, feature: "FEATURE_TUNDRA_BOG" });
    }
  }

  return { placements };
}
