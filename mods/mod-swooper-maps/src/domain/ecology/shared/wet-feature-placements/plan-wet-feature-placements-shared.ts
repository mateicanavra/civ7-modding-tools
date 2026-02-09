import type { Static } from "@swooper/mapgen-core/authoring";
import { clampChance, createLabelRng, rollPercent } from "@swooper/mapgen-core";

import {
  FEATURE_KEY_INDEX,
  biomeSymbolFromIndex,
  type FeatureKey,
} from "@mapgen/domain/ecology/types.js";

import { WetFeaturePlacementsContractParts } from "./contract-parts.js";
import { hasAdjacentFeatureType, isCoastalLand } from "./adjacency.js";

type Config = Static<(typeof WetFeaturePlacementsContractParts)["strategies"]["default"]>;
type Input = Static<(typeof WetFeaturePlacementsContractParts)["input"]>;
type Placement = Static<
  (typeof WetFeaturePlacementsContractParts)["output"]
>["placements"][number];

const NO_FEATURE = -1;

type WetFeatureKey =
  | "FEATURE_MARSH"
  | "FEATURE_TUNDRA_BOG"
  | "FEATURE_MANGROVE"
  | "FEATURE_OASIS"
  | "FEATURE_WATERING_HOLE";

export function planWetFeaturePlacementsShared(args: {
  input: Input;
  config: Config;
  featureKey: WetFeatureKey;
}): Readonly<{ placements: Placement[] }> {
  const { input, config, featureKey } = args;

  const rng = createLabelRng(input.seed);
  const { width, height, biomeIndex, surfaceTemperature, landMask, navigableRiverMask } = input;

  const featureField = input.featureKeyField.slice();
  const placements: Placement[] = [];

  const isWater = (x: number, y: number): boolean => landMask[y * width + x] === 0;
  const isNavigableRiverPlot = (x: number, y: number): boolean =>
    navigableRiverMask[y * width + x] === 1;

  const canPlaceAt = (x: number, y: number): boolean =>
    featureField[y * width + x] === NO_FEATURE;

  const setPlanned = (x: number, y: number, key: FeatureKey): void => {
    const idx = y * width + x;
    featureField[idx] = FEATURE_KEY_INDEX[key];
    placements.push({ x, y, feature: key });
  };

  const multiplier = config.multiplier;
  if (multiplier <= 0) return { placements };

  const chances = config.chances;
  const rules = config.rules;

  switch (featureKey) {
    case "FEATURE_MARSH":
    case "FEATURE_TUNDRA_BOG": {
      const marshChance = clampChance(chances.FEATURE_MARSH * multiplier);
      const bogChance = clampChance(chances.FEATURE_TUNDRA_BOG * multiplier);
      const chance = featureKey === "FEATURE_MARSH" ? marshChance : bogChance;
      if (chance <= 0) return { placements };

      const coldBiomeSet = new Set(rules.coldBiomeSymbols);
      for (let y = 0; y < height; y++) {
        const rowOffset = y * width;
        for (let x = 0; x < width; x++) {
          const idx = rowOffset + x;
          if (landMask[idx] === 0) continue;
          if (isNavigableRiverPlot(x, y)) continue;
          if (input.nearRiverMask[idx] !== 1) continue;

          const symbol = biomeSymbolFromIndex(biomeIndex[idx] | 0);
          const isCold =
            coldBiomeSet.has(symbol) || surfaceTemperature[idx] <= rules.coldTemperatureMax;
          if (featureKey === "FEATURE_MARSH" ? isCold : !isCold) continue;

          if (!canPlaceAt(x, y)) continue;
          if (!rollPercent(rng, `features:plan:wet:${featureKey}`, chance)) continue;
          setPlanned(x, y, featureKey);
        }
      }

      return { placements };
    }

    case "FEATURE_MANGROVE": {
      const mangroveChance = clampChance(chances.FEATURE_MANGROVE * multiplier);
      if (mangroveChance <= 0) return { placements };

      const warmBiomeSet = new Set(rules.mangroveWarmBiomeSymbols);
      const coastalRadius = rules.coastalAdjacencyRadius;
      for (let y = 0; y < height; y++) {
        const rowOffset = y * width;
        for (let x = 0; x < width; x++) {
          const idx = rowOffset + x;
          if (landMask[idx] === 0) continue;
          if (isNavigableRiverPlot(x, y)) continue;
          if (!isCoastalLand(isWater, width, height, x, y, coastalRadius)) continue;

          const symbol = biomeSymbolFromIndex(biomeIndex[idx] | 0);
          const isWarm =
            warmBiomeSet.has(symbol) ||
            surfaceTemperature[idx] >= rules.mangroveWarmTemperatureMin;
          if (!isWarm) continue;

          if (!canPlaceAt(x, y)) continue;
          if (!rollPercent(rng, "features:plan:wet:mangrove", mangroveChance)) continue;
          setPlanned(x, y, "FEATURE_MANGROVE");
        }
      }

      return { placements };
    }

    case "FEATURE_OASIS":
    case "FEATURE_WATERING_HOLE": {
      const oasisChance = clampChance(chances.FEATURE_OASIS * multiplier);
      const wateringChance = clampChance(chances.FEATURE_WATERING_HOLE * multiplier);
      const chance = featureKey === "FEATURE_OASIS" ? oasisChance : wateringChance;
      if (chance <= 0) return { placements };

      const oasisBiomeSet = new Set(rules.oasisBiomeSymbols);
      const featureIdx =
        featureKey === "FEATURE_OASIS"
          ? FEATURE_KEY_INDEX.FEATURE_OASIS
          : FEATURE_KEY_INDEX.FEATURE_WATERING_HOLE;
      const coastalRadius = rules.coastalAdjacencyRadius;
      const spacingRadius = rules.isolatedSpacingRadius;

      for (let y = 0; y < height; y++) {
        const rowOffset = y * width;
        for (let x = 0; x < width; x++) {
          const idx = rowOffset + x;
          if (landMask[idx] === 0) continue;
          if (isNavigableRiverPlot(x, y)) continue;
          if (isCoastalLand(isWater, width, height, x, y, coastalRadius)) continue;
          if (input.isolatedRiverMask[idx] === 1) continue;

          const symbol = biomeSymbolFromIndex(biomeIndex[idx] | 0);
          const isOasisBiome = oasisBiomeSet.has(symbol);
          if (featureKey === "FEATURE_OASIS" ? !isOasisBiome : isOasisBiome) continue;

          if (!canPlaceAt(x, y)) continue;
          if (
            hasAdjacentFeatureType(
              featureField,
              width,
              height,
              x,
              y,
              featureIdx,
              spacingRadius
            )
          ) {
            continue;
          }
          if (!rollPercent(rng, `features:plan:wet:${featureKey}`, chance)) continue;
          setPlanned(x, y, featureKey);
        }
      }

      return { placements };
    }
  }
}

