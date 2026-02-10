import { clamp01 } from "@swooper/mapgen-core";
import { createLabelRng } from "@swooper/mapgen-core/lib/rng";
import { createStrategy } from "@swooper/mapgen-core/authoring";

import { validateGridSize } from "../../score-shared/index.js";
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
    const minScore01 = clamp01(config.minScore01);
    const rng = createLabelRng(input.seed);
    const candidates: string[] = [];

    for (let i = 0; i < size; i++) {
      if (input.landMask[i] === 0) continue;
      if (input.reserved[i] !== 0) continue;
      if (input.featureIndex[i] !== 0) continue;

      const forest = input.scoreForest01[i] ?? 0;
      const rainforest = input.scoreRainforest01[i] ?? 0;
      const taiga = input.scoreTaiga01[i] ?? 0;
      const savannaWoodland = input.scoreSavannaWoodland01[i] ?? 0;
      const sagebrushSteppe = input.scoreSagebrushSteppe01[i] ?? 0;

      let bestScore = forest;
      candidates.length = 0;
      candidates.push("FEATURE_FOREST");

      if (rainforest > bestScore) {
        bestScore = rainforest;
        candidates.length = 0;
        candidates.push("FEATURE_RAINFOREST");
      } else if (rainforest === bestScore) {
        candidates.push("FEATURE_RAINFOREST");
      }

      if (taiga > bestScore) {
        bestScore = taiga;
        candidates.length = 0;
        candidates.push("FEATURE_TAIGA");
      } else if (taiga === bestScore) {
        candidates.push("FEATURE_TAIGA");
      }

      if (savannaWoodland > bestScore) {
        bestScore = savannaWoodland;
        candidates.length = 0;
        candidates.push("FEATURE_SAVANNA_WOODLAND");
      } else if (savannaWoodland === bestScore) {
        candidates.push("FEATURE_SAVANNA_WOODLAND");
      }

      if (sagebrushSteppe > bestScore) {
        bestScore = sagebrushSteppe;
        candidates.length = 0;
        candidates.push("FEATURE_SAGEBRUSH_STEPPE");
      } else if (sagebrushSteppe === bestScore) {
        candidates.push("FEATURE_SAGEBRUSH_STEPPE");
      }

      if (!Number.isFinite(bestScore) || bestScore < minScore01) continue;

      const feature =
        candidates.length === 1 ? candidates[0]! : candidates[rng(candidates.length, `veg:${i}`)]!;
      const x = i % width;
      const y = (i / width) | 0;
      placements.push({ x, y, feature });
    }

    return { placements };
  },
});

