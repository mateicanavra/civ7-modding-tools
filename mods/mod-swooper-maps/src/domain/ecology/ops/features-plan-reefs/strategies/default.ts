import { createStrategy } from "@swooper/mapgen-core/authoring";
import {
  choosePhysicalCandidate,
  confidenceFromScore01,
  stressFromConfidence01,
} from "../../../model/policy/feature-score-selection.js";
import type { FeatureIntentKey } from "../../../model/schemas/index.js";
import PlanReefsContract from "../contract.js";
import { admitReefIntent, admitReefStride } from "../policy/index.js";

export const defaultStrategy = createStrategy(PlanReefsContract, "default", {
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

      const reef = input.scoreReef01[i] ?? 0;
      const coldReef = input.scoreColdReef01[i] ?? 0;
      const atoll = input.scoreAtoll01[i] ?? 0;
      const lotus = input.lakeMask[i] === 1 ? (input.scoreLotus01[i] ?? 0) : 0;

      const reefConfidence01 = confidenceFromScore01(reef);
      const coldReefConfidence01 = confidenceFromScore01(coldReef);
      const atollConfidence01 = confidenceFromScore01(atoll);
      const lotusConfidence01 = confidenceFromScore01(lotus);

      const best = choosePhysicalCandidate([
        {
          feature: "reef",
          confidence01: reefConfidence01,
          stress01: stressFromConfidence01(reefConfidence01),
          tileIndex: i,
        },
        {
          feature: "cold-reef",
          confidence01: coldReefConfidence01,
          stress01: stressFromConfidence01(coldReefConfidence01),
          tileIndex: i,
        },
        {
          feature: "atoll",
          confidence01: atollConfidence01,
          stress01: stressFromConfidence01(atollConfidence01),
          tileIndex: i,
        },
        {
          feature: "lotus",
          confidence01: lotusConfidence01,
          stress01: stressFromConfidence01(lotusConfidence01),
          tileIndex: i,
        },
      ]);
      if (best === null) continue;
      if (!admitReefIntent(best, config)) continue;
      if (!admitReefStride(best, config)) continue;

      const x = i % width;
      const y = (i / width) | 0;
      placements.push({ x, y, feature: best.feature });
    }
    return { placements };
  },
});
