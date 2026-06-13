import { createStrategy } from "@swooper/mapgen-core/authoring";

import {
  choosePhysicalCandidate,
  confidenceFromScore01,
  stressFromConfidence01,
  validateGridSize,
} from "../../score-shared/index.js";
import PlanFloodplainsContract from "../contract.js";

type FloodplainCandidate = Readonly<{
  feature: string;
  score01: number;
  tileIndex: number;
}>;

export const defaultStrategy = createStrategy(PlanFloodplainsContract, "default", {
  run: (input, config) => {
    const width = input.width | 0;
    const height = input.height | 0;
    const size = validateGridSize({
      width,
      height,
      fields: [
        { label: "scoreDesertMinor01", arr: input.scoreDesertMinor01 as Float32Array },
        { label: "scoreDesertNavigable01", arr: input.scoreDesertNavigable01 as Float32Array },
        { label: "scoreGrasslandMinor01", arr: input.scoreGrasslandMinor01 as Float32Array },
        {
          label: "scoreGrasslandNavigable01",
          arr: input.scoreGrasslandNavigable01 as Float32Array,
        },
        { label: "scorePlainsMinor01", arr: input.scorePlainsMinor01 as Float32Array },
        { label: "scorePlainsNavigable01", arr: input.scorePlainsNavigable01 as Float32Array },
        { label: "scoreTropicalMinor01", arr: input.scoreTropicalMinor01 as Float32Array },
        { label: "scoreTropicalNavigable01", arr: input.scoreTropicalNavigable01 as Float32Array },
        { label: "scoreTundraMinor01", arr: input.scoreTundraMinor01 as Float32Array },
        { label: "scoreTundraNavigable01", arr: input.scoreTundraNavigable01 as Float32Array },
        { label: "featureIndex", arr: input.featureIndex as Uint16Array },
        { label: "reserved", arr: input.reserved as Uint8Array },
      ],
    });

    const placements: Array<{ x: number; y: number; feature: string; weight?: number }> = [];
    void input.seed;

    for (let i = 0; i < size; i++) {
      if (input.reserved[i] !== 0) continue;
      if (input.featureIndex[i] !== 0) continue;

      const candidates: FloodplainCandidate[] = [
        {
          feature: "FEATURE_DESERT_FLOODPLAIN_MINOR",
          score01: input.scoreDesertMinor01[i] ?? 0,
          tileIndex: i,
        },
        {
          feature: "FEATURE_DESERT_FLOODPLAIN_NAVIGABLE",
          score01: input.scoreDesertNavigable01[i] ?? 0,
          tileIndex: i,
        },
        {
          feature: "FEATURE_GRASSLAND_FLOODPLAIN_MINOR",
          score01: input.scoreGrasslandMinor01[i] ?? 0,
          tileIndex: i,
        },
        {
          feature: "FEATURE_GRASSLAND_FLOODPLAIN_NAVIGABLE",
          score01: input.scoreGrasslandNavigable01[i] ?? 0,
          tileIndex: i,
        },
        {
          feature: "FEATURE_PLAINS_FLOODPLAIN_MINOR",
          score01: input.scorePlainsMinor01[i] ?? 0,
          tileIndex: i,
        },
        {
          feature: "FEATURE_PLAINS_FLOODPLAIN_NAVIGABLE",
          score01: input.scorePlainsNavigable01[i] ?? 0,
          tileIndex: i,
        },
        {
          feature: "FEATURE_TROPICAL_FLOODPLAIN_MINOR",
          score01: input.scoreTropicalMinor01[i] ?? 0,
          tileIndex: i,
        },
        {
          feature: "FEATURE_TROPICAL_FLOODPLAIN_NAVIGABLE",
          score01: input.scoreTropicalNavigable01[i] ?? 0,
          tileIndex: i,
        },
        {
          feature: "FEATURE_TUNDRA_FLOODPLAIN_MINOR",
          score01: input.scoreTundraMinor01[i] ?? 0,
          tileIndex: i,
        },
        {
          feature: "FEATURE_TUNDRA_FLOODPLAIN_NAVIGABLE",
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
