import { createStrategy } from "@swooper/mapgen-core/authoring";

import {
  choosePhysicalCandidate,
  confidenceFromScore01,
  stressFromConfidence01,
  validateGridSize,
} from "../../score-shared/index.js";
import PlanReefsContract from "../contract.js";

export const defaultStrategy = createStrategy(PlanReefsContract, "default", {
  run: (input, config) => {
    const width = input.width | 0;
    const height = input.height | 0;
    const size = validateGridSize({
      width,
      height,
      fields: [
        { label: "scoreReef01", arr: input.scoreReef01 as Float32Array },
        { label: "scoreColdReef01", arr: input.scoreColdReef01 as Float32Array },
        { label: "scoreAtoll01", arr: input.scoreAtoll01 as Float32Array },
        { label: "scoreLotus01", arr: input.scoreLotus01 as Float32Array },
        { label: "featureIndex", arr: input.featureIndex as Uint16Array },
        { label: "reserved", arr: input.reserved as Uint8Array },
      ],
    });

    const placements: Array<{ x: number; y: number; feature: string; weight?: number }> = [];
    void config;
    void input.seed;

    for (let i = 0; i < size; i++) {
      if (input.reserved[i] !== 0) continue;
      if (input.featureIndex[i] !== 0) continue;

      const reef = input.scoreReef01[i] ?? 0;
      const coldReef = input.scoreColdReef01[i] ?? 0;
      const atoll = input.scoreAtoll01[i] ?? 0;
      const lotus = input.scoreLotus01[i] ?? 0;

      const reefConfidence01 = confidenceFromScore01(reef);
      const coldReefConfidence01 = confidenceFromScore01(coldReef);
      const atollConfidence01 = confidenceFromScore01(atoll);
      const lotusConfidence01 = confidenceFromScore01(lotus);

      const best = choosePhysicalCandidate([
        {
          feature: "FEATURE_REEF",
          confidence01: reefConfidence01,
          stress01: stressFromConfidence01(reefConfidence01),
          tileIndex: i,
        },
        {
          feature: "FEATURE_COLD_REEF",
          confidence01: coldReefConfidence01,
          stress01: stressFromConfidence01(coldReefConfidence01),
          tileIndex: i,
        },
        {
          feature: "FEATURE_ATOLL",
          confidence01: atollConfidence01,
          stress01: stressFromConfidence01(atollConfidence01),
          tileIndex: i,
        },
        {
          feature: "FEATURE_LOTUS",
          confidence01: lotusConfidence01,
          stress01: stressFromConfidence01(lotusConfidence01),
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
