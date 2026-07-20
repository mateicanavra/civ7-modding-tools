import { createStrategy } from "@swooper/mapgen-core/authoring";
import type { FeatureIntentKey } from "../../../model/schemas/index.js";
import PlanReefsContract from "../contract.js";
import { admitReefIntent, admitReefStride, selectReefIntentCandidate } from "../policy/index.js";

/**
 * Selects the strongest reef-family habitat per tile, with lotus restricted to lakes.
 * The authored stride thins adjacent candidates deterministically without changing habitat law.
 */
export const habitatStrategy = createStrategy(PlanReefsContract, "habitat", {
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

      const best = selectReefIntentCandidate(input, i);
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
