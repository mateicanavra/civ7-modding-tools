import { clamp01 } from "@swooper/mapgen-core";
import { createStrategy } from "@swooper/mapgen-core/authoring";

import { validateGridSize } from "../../score-shared/index.js";
import PlanIceContract from "../contract.js";

export const continentalityStrategy = createStrategy(PlanIceContract, "continentality", {
  run: (input, config) => {
    const width = input.width | 0;
    const height = input.height | 0;
    const size = validateGridSize({
      width,
      height,
      fields: [
        { label: "score01", arr: input.score01 as Float32Array },
        { label: "featureIndex", arr: input.featureIndex as Uint16Array },
        { label: "reserved", arr: input.reserved as Uint8Array },
      ],
    });

    const placements: Array<{ x: number; y: number; feature: string; weight?: number }> = [];
    const minScore01 = clamp01(config.minScore01);

    for (let i = 0; i < size; i++) {
      if (input.reserved[i] !== 0) continue;
      if (input.featureIndex[i] !== 0) continue;
      const score = input.score01[i];
      if (!Number.isFinite(score) || score < minScore01) continue;
      const x = i % width;
      const y = (i / width) | 0;
      placements.push({ x, y, feature: "FEATURE_ICE" });
    }

    return { placements };
  },
});
