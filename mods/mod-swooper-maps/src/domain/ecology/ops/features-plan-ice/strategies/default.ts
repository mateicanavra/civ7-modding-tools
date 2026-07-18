import { createStrategy } from "@swooper/mapgen-core/authoring";
import {
  confidenceFromScore01,
  validateGridFields,
} from "../../../model/policy/feature-score-selection.js";
import type { FeatureIntentKey } from "../../../model/schemas/index.js";
import PlanIceContract from "../contract.js";
import { admitIceIntent } from "../policy/index.js";

export const defaultStrategy = createStrategy(PlanIceContract, "default", {
  run: (input, config) => {
    const width = input.width;
    const height = input.height;
    const size = validateGridFields({
      width,
      height,
      fields: [
        { label: "score01", arr: input.score01 as Float32Array },
        { label: "featureOccupancyMask", arr: input.featureOccupancyMask as Uint8Array },
        { label: "reserved", arr: input.reserved as Uint8Array },
      ],
    });

    const placements: Array<{ x: number; y: number; feature: FeatureIntentKey; weight?: number }> =
      [];
    void input.seed;

    for (let i = 0; i < size; i++) {
      if (input.reserved[i] !== 0) continue;
      if (input.featureOccupancyMask[i] !== 0) continue;
      const score = input.score01[i] ?? 0;
      const confidence01 = confidenceFromScore01(score);
      if (!admitIceIntent({ confidence01 }, config)) continue;
      const x = i % width;
      const y = (i / width) | 0;
      placements.push({ x, y, feature: "ice" });
    }

    return { placements };
  },
});
