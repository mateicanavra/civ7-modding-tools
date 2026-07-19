import { createStrategy } from "@swooper/mapgen-core/authoring";
import {
  choosePhysicalCandidate,
  confidenceFromScore01,
  stressFromConfidence01,
} from "../../../model/policy/feature-score-selection.js";
import type { FeatureIntentKey } from "../../../model/schemas/index.js";
import PlanFloodplainsContract from "../contract.js";

type FloodplainCandidate = Readonly<{
  feature: FeatureIntentKey;
  score01: number;
  tileIndex: number;
}>;

export const defaultStrategy = createStrategy(PlanFloodplainsContract, "default", {
  run: (input, config) => {
    const width = input.width;
    const height = input.height;
    const size = width * height;

    const placements: Array<{ x: number; y: number; feature: FeatureIntentKey; weight?: number }> =
      [];
    void input.seed;

    for (let i = 0; i < size; i++) {
      if (input.reserved[i] !== 0) continue;
      if (input.featureOccupancyMask[i] !== 0) continue;

      const candidates: FloodplainCandidate[] = [
        {
          feature: "desert-floodplain-minor",
          score01: input.scoreDesertMinor01[i] ?? 0,
          tileIndex: i,
        },
        {
          feature: "desert-floodplain-navigable",
          score01: input.scoreDesertNavigable01[i] ?? 0,
          tileIndex: i,
        },
        {
          feature: "grassland-floodplain-minor",
          score01: input.scoreGrasslandMinor01[i] ?? 0,
          tileIndex: i,
        },
        {
          feature: "grassland-floodplain-navigable",
          score01: input.scoreGrasslandNavigable01[i] ?? 0,
          tileIndex: i,
        },
        {
          feature: "plains-floodplain-minor",
          score01: input.scorePlainsMinor01[i] ?? 0,
          tileIndex: i,
        },
        {
          feature: "plains-floodplain-navigable",
          score01: input.scorePlainsNavigable01[i] ?? 0,
          tileIndex: i,
        },
        {
          feature: "tropical-floodplain-minor",
          score01: input.scoreTropicalMinor01[i] ?? 0,
          tileIndex: i,
        },
        {
          feature: "tropical-floodplain-navigable",
          score01: input.scoreTropicalNavigable01[i] ?? 0,
          tileIndex: i,
        },
        {
          feature: "tundra-floodplain-minor",
          score01: input.scoreTundraMinor01[i] ?? 0,
          tileIndex: i,
        },
        {
          feature: "tundra-floodplain-navigable",
          score01: input.scoreTundraNavigable01[i] ?? 0,
          tileIndex: i,
        },
      ];

      const best = choosePhysicalCandidate(
        candidates
          .map((candidate) => {
            const confidence01 = confidenceFromScore01(candidate.score01);
            return {
              feature: candidate.feature,
              confidence01,
              stress01: stressFromConfidence01(confidence01),
              tileIndex: candidate.tileIndex,
            };
          })
          .filter((candidate) => candidate.confidence01 >= config.minConfidence01)
      );
      if (best === null) continue;

      placements.push({
        x: i % width,
        y: (i / width) | 0,
        feature: best.feature,
      });
    }

    return { placements };
  },
});
