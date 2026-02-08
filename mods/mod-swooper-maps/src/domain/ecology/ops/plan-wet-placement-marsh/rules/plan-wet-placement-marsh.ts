import type { Static } from "@swooper/mapgen-core/authoring";
import { clampChance, createLabelRng, rollPercent } from "@swooper/mapgen-core";

import { biomeSymbolFromIndex, FEATURE_KEY_INDEX } from "@mapgen/domain/ecology/types.js";

import PlanWetPlacementMarshContract from "../contract.js";

type Config = Static<(typeof PlanWetPlacementMarshContract)["strategies"]["default"]>;
type Input = Static<(typeof PlanWetPlacementMarshContract)["input"]>;
type Placement = Static<(typeof PlanWetPlacementMarshContract)["output"]>["placements"][number];

const NO_FEATURE = -1;

export function planWetPlacementMarsh(
  input: Input,
  config: Config
): Readonly<{ placements: Placement[] }> {
  const rng = createLabelRng(input.seed);
  const { width, height, biomeIndex, surfaceTemperature, landMask, navigableRiverMask } = input;

  const featureField = input.featureKeyField.slice();
  const placements: Placement[] = [];

  const multiplier = config.multiplier;
  if (multiplier <= 0) return { placements };

  const chance = clampChance(config.chances.FEATURE_MARSH * multiplier);
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
      if (isCold) continue;

      if (featureField[idx] !== NO_FEATURE) continue;
      if (!rollPercent(rng, "features:plan:wet:FEATURE_MARSH", chance)) continue;
      featureField[idx] = FEATURE_KEY_INDEX.FEATURE_MARSH;
      placements.push({ x, y, feature: "FEATURE_MARSH" });
    }
  }

  return { placements };
}
