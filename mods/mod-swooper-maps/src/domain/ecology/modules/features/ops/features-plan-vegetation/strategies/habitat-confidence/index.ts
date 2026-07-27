import { createStrategy } from "@swooper/mapgen-core/authoring";
import { BIOME_SYMBOL_TO_INDEX } from "../../../../../../model/atoms/index.js";
import type {
  VegetationFeatureIntentKey,
  VegetationFeaturePlacement,
} from "../../../../model/atoms/index.js";
import {
  choosePhysicalCandidate,
  confidenceFromScore01,
  stressFromConfidence01,
} from "../../../../model/policy/feature-score-selection.js";
import Contract from "../../contract.js";
import { admitVegetationIntent } from "../../rules/admit-vegetation-intent.js";
import StrategyDefinition from "./config.js";

function isBroadVegetationHabitat(
  feature: VegetationFeatureIntentKey,
  tileIndex: number,
  fields: {
    readonly biomeIndex: ArrayLike<number>;
    readonly surfaceTemperature: ArrayLike<number>;
    readonly effectiveMoisture: ArrayLike<number>;
    readonly aridityIndex: ArrayLike<number>;
    readonly vegetationDensity: ArrayLike<number>;
  }
): boolean {
  const biome = fields.biomeIndex[tileIndex] ?? 255;
  const temp = fields.surfaceTemperature[tileIndex] ?? 0;
  const moisture = fields.effectiveMoisture[tileIndex] ?? 0;
  const aridity = fields.aridityIndex[tileIndex] ?? 0;
  const vegetation = fields.vegetationDensity[tileIndex] ?? 0;

  switch (feature) {
    case "forest":
      return biome === BIOME_SYMBOL_TO_INDEX.temperateHumid && vegetation >= 0.08;
    case "rainforest":
      return (
        biome === BIOME_SYMBOL_TO_INDEX.tropicalRainforest &&
        temp >= 16 &&
        moisture >= 85 &&
        vegetation >= 0.18
      );
    case "taiga":
      return (
        biome === BIOME_SYMBOL_TO_INDEX.snow ||
        biome === BIOME_SYMBOL_TO_INDEX.tundra ||
        biome === BIOME_SYMBOL_TO_INDEX.boreal
      );
    case "savanna-woodland":
      return (
        biome === BIOME_SYMBOL_TO_INDEX.tropicalSeasonal &&
        temp >= 12 &&
        aridity <= 0.9 &&
        vegetation <= 0.78
      );
    case "sagebrush-steppe":
      return (
        biome === BIOME_SYMBOL_TO_INDEX.desert && temp >= -12 && temp <= 32 && vegetation <= 0.72
      );
    default:
      return false;
  }
}

/** Arbitrates forest, rainforest, taiga, savanna woodland, and sagebrush steppe by confidence and stress. */
const habitatConfidenceStrategy = createStrategy(Contract, StrategyDefinition, {
  run: (input, config) => {
    const width = input.width;
    const height = input.height;
    const size = width * height;
    const flatLandMask = input.flatLandMask;
    const biomeIndex = input.biomeIndex;
    const broadHabitatFields = {
      biomeIndex,
      surfaceTemperature: input.surfaceTemperature,
      effectiveMoisture: input.effectiveMoisture,
      aridityIndex: input.aridityIndex,
      vegetationDensity: input.vegetationDensity,
    };

    const placements: VegetationFeaturePlacement[] = [];
    void input.seed;

    for (let i = 0; i < size; i++) {
      if (input.landMask[i] === 0) continue;
      if (flatLandMask[i] !== 1) continue;
      if (input.featureOccupancyMask[i] !== 0) continue;

      const forest = input.scoreForest01[i] ?? 0;
      const rainforest = input.scoreRainforest01[i] ?? 0;
      const taiga = input.scoreTaiga01[i] ?? 0;
      const savannaWoodland = input.scoreSavannaWoodland01[i] ?? 0;
      const sagebrushSteppe = input.scoreSagebrushSteppe01[i] ?? 0;

      const forestConfidence01 = confidenceFromScore01(forest);
      const rainforestConfidence01 = confidenceFromScore01(rainforest);
      const taigaConfidence01 = confidenceFromScore01(taiga);
      const savannaConfidence01 = confidenceFromScore01(savannaWoodland);
      const steppeConfidence01 = confidenceFromScore01(sagebrushSteppe);

      const candidates = [
        {
          feature: "forest",
          confidence01: forestConfidence01,
          stress01: stressFromConfidence01(forestConfidence01),
          tileIndex: i,
        },
        {
          feature: "rainforest",
          confidence01: rainforestConfidence01,
          stress01: stressFromConfidence01(rainforestConfidence01),
          tileIndex: i,
        },
        {
          feature: "taiga",
          confidence01: taigaConfidence01,
          stress01: stressFromConfidence01(taigaConfidence01),
          tileIndex: i,
        },
        {
          feature: "savanna-woodland",
          confidence01: savannaConfidence01,
          stress01: stressFromConfidence01(savannaConfidence01),
          tileIndex: i,
        },
        {
          feature: "sagebrush-steppe",
          confidence01: steppeConfidence01,
          stress01: stressFromConfidence01(steppeConfidence01),
          tileIndex: i,
        },
      ] as const;

      // Each vegetation feature owns its own admission amplitude. Filtering
      // before selection keeps rainforest from winning only because its score
      // scale is naturally higher than cold or dry open-cover habitats.
      const best = choosePhysicalCandidate(
        candidates.filter(
          (candidate) =>
            isBroadVegetationHabitat(candidate.feature, i, broadHabitatFields) &&
            admitVegetationIntent(candidate, config)
        )
      );
      if (best === null) continue;

      const x = i % width;
      const y = (i / width) | 0;
      placements.push({ x, y, feature: best.feature });
    }

    return { placements };
  },
});

export default habitatConfidenceStrategy;
