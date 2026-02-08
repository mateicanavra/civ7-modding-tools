import { clampChance, createLabelRng } from "@swooper/mapgen-core";
import { createStrategy, type Static } from "@swooper/mapgen-core/authoring";

import { FEATURE_KEY_INDEX } from "@mapgen/domain/ecology/types.js";
import { biomeSymbolFromIndex, type BiomeSymbol } from "@mapgen/domain/ecology/types.js";

import PlanVegetationEmbellishmentsVolcanicForestContract from "../contract.js";
import { isNearVolcanic } from "../rules/index.js";

type Config = Static<(typeof PlanVegetationEmbellishmentsVolcanicForestContract)["strategies"]["default"]>;
type Placement = Static<(typeof PlanVegetationEmbellishmentsVolcanicForestContract)["output"]>["placements"][number];

const NO_FEATURE = -1;

const WARM_BIOMES: ReadonlySet<BiomeSymbol> = new Set([
  "temperateHumid",
  "tropicalSeasonal",
  "tropicalRainforest",
]);

function normalizeConfig(config: Config): Config {
  const featuresCfg = config.story.features;

  return {
    ...config,
    story: {
      ...config.story,
      features: {
        ...featuresCfg,
        volcanicForestChance: clampChance(featuresCfg.volcanicForestChance),
        volcanicForestBonus: clampChance(featuresCfg.volcanicForestBonus),
        volcanicRadius: Math.max(1, Math.floor(featuresCfg.volcanicRadius)),
      },
    },
    featuresDensity: {
      ...config.featuresDensity,
      minVegetationForBonus: Math.max(0, Math.min(1, config.featuresDensity.minVegetationForBonus)),
    },
  };
}

export const defaultStrategy = createStrategy(
  PlanVegetationEmbellishmentsVolcanicForestContract,
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
        rainfall,
        vegetationDensity,
        volcanicMask,
        navigableRiverTerrain,
      } = input;

      const rng = createLabelRng(input.seed);
      const featureField = featureKeyField.slice();
      const placements: Placement[] = [];

      const featuresCfg = config.story.features;
      const densityCfg = config.featuresDensity;

      const volcanicForestChance = clampChance(
        (featuresCfg.volcanicForestChance ?? 0) + (featuresCfg.volcanicForestBonus ?? 0)
      );
      const volcanicRadius = Math.max(1, Math.floor(featuresCfg.volcanicRadius ?? 1));
      const volcanicForestMinRainfall = featuresCfg.volcanicForestMinRainfall ?? 0;
      const minVegetationForBonus = densityCfg.minVegetationForBonus;

      if (!volcanicMask.some((v) => v === 1)) return { placements };

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
          if (!WARM_BIOMES.has(biome)) continue;
          if ((rainfall[idx] | 0) < volcanicForestMinRainfall) continue;

          if (
            !isNearVolcanic({
              width,
              height,
              x,
              y,
              volcanicMask,
              radius: volcanicRadius,
            })
          ) {
            continue;
          }

          if (rng(100, "features:plan:vegetation:volcanic-forest") >= volcanicForestChance) continue;

          featureField[idx] = FEATURE_KEY_INDEX.FEATURE_FOREST;
          placements.push({ x, y, feature: "FEATURE_FOREST" });
        }
      }

      return { placements };
    },
  }
);

