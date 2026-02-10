import { clamp01 } from "@swooper/mapgen-core";
import { createLabelRng } from "@swooper/mapgen-core/lib/rng";
import { createStrategy } from "@swooper/mapgen-core/authoring";

import { validateGridSize } from "../../score-shared/index.js";
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
    const minScore01 = clamp01(config.minScore01);
    const rng = createLabelRng(input.seed);
    const candidates: string[] = [];

    for (let i = 0; i < size; i++) {
      if (input.reserved[i] !== 0) continue;
      if (input.featureIndex[i] !== 0) continue;

      const reef = input.scoreReef01[i] ?? 0;
      const coldReef = input.scoreColdReef01[i] ?? 0;
      const atoll = input.scoreAtoll01[i] ?? 0;
      const lotus = input.scoreLotus01[i] ?? 0;

      let bestScore = reef;
      candidates.length = 0;
      candidates.push("FEATURE_REEF");

      if (coldReef > bestScore) {
        bestScore = coldReef;
        candidates.length = 0;
        candidates.push("FEATURE_COLD_REEF");
      } else if (coldReef === bestScore) {
        candidates.push("FEATURE_COLD_REEF");
      }

      if (atoll > bestScore) {
        bestScore = atoll;
        candidates.length = 0;
        candidates.push("FEATURE_ATOLL");
      } else if (atoll === bestScore) {
        candidates.push("FEATURE_ATOLL");
      }

      if (lotus > bestScore) {
        bestScore = lotus;
        candidates.length = 0;
        candidates.push("FEATURE_LOTUS");
      } else if (lotus === bestScore) {
        candidates.push("FEATURE_LOTUS");
      }

      if (!Number.isFinite(bestScore) || bestScore < minScore01) continue;

      const feature =
        candidates.length === 1 ? candidates[0]! : candidates[rng(candidates.length, `reef:${i}`)]!;

      const x = i % width;
      const y = (i / width) | 0;
      placements.push({ x, y, feature });
    }
    return { placements };
  },
});
