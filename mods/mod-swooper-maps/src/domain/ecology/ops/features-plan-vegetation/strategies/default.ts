import { createStrategy } from "@swooper/mapgen-core/authoring";

import {
  choosePhysicalCandidate,
  confidenceFromScore01,
  stressFromConfidence01,
  validateGridSize,
} from "../../score-shared/index.js";
import PlanVegetationContract from "../contract.js";

export const defaultStrategy = createStrategy(PlanVegetationContract, "default", {
  run: (input, config) => {
    const width = input.width | 0;
    const height = input.height | 0;
    const size = validateGridSize({
      width,
      height,
      fields: [
        { label: "scoreForest01", arr: input.scoreForest01 as Float32Array },
        { label: "scoreRainforest01", arr: input.scoreRainforest01 as Float32Array },
        { label: "scoreTaiga01", arr: input.scoreTaiga01 as Float32Array },
        { label: "scoreSavannaWoodland01", arr: input.scoreSavannaWoodland01 as Float32Array },
        { label: "scoreSagebrushSteppe01", arr: input.scoreSagebrushSteppe01 as Float32Array },
        { label: "landMask", arr: input.landMask as Uint8Array },
        { label: "featureIndex", arr: input.featureIndex as Uint16Array },
        { label: "reserved", arr: input.reserved as Uint8Array },
      ],
    });

    const placements: Array<{ x: number; y: number; feature: string; weight?: number }> = [];
    void config;
    void input.seed;

    for (let i = 0; i < size; i++) {
      if (input.landMask[i] === 0) continue;
      if (input.reserved[i] !== 0) continue;
      if (input.featureIndex[i] !== 0) continue;

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

      const best = choosePhysicalCandidate([
        {
          feature: "FEATURE_FOREST",
          confidence01: forestConfidence01,
          stress01: stressFromConfidence01(forestConfidence01),
          tileIndex: i,
        },
        {
          feature: "FEATURE_RAINFOREST",
          confidence01: rainforestConfidence01,
          stress01: stressFromConfidence01(rainforestConfidence01),
          tileIndex: i,
        },
        {
          feature: "FEATURE_TAIGA",
          confidence01: taigaConfidence01,
          stress01: stressFromConfidence01(taigaConfidence01),
          tileIndex: i,
        },
        {
          feature: "FEATURE_SAVANNA_WOODLAND",
          confidence01: savannaConfidence01,
          stress01: stressFromConfidence01(savannaConfidence01),
          tileIndex: i,
        },
        {
          feature: "FEATURE_SAGEBRUSH_STEPPE",
          confidence01: steppeConfidence01,
          stress01: stressFromConfidence01(steppeConfidence01),
          tileIndex: i,
        },
      ]);
      if (best === null) continue;
      if (best.confidence01 <= 0) continue;

      const x = i % width;
      const y = (i / width) | 0;
      placements.push({ x, y, feature: best.feature });
    }

    return { placements };
  },
});
