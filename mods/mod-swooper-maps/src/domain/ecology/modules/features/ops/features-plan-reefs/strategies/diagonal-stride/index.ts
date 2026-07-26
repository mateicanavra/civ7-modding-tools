import { createStrategy } from "@swooper/mapgen-core/authoring";
import type { FeatureIntentKey } from "../../../../model/atoms/index.js";
import PlanReefsContract from "../../contract.js";
import {
  admitReefIntent,
  selectReefIntentCandidate,
} from "../../rules/admit-reef-intent.js";
import StrategyDefinition from "./config.js";

/**
 * Selects reef-family intent on one diagonal lane pattern controlled by the authored stride.
 * Lotus remains lake-gated before competing with ocean reef candidates.
 */
const diagonalStrideStrategy = createStrategy(PlanReefsContract, StrategyDefinition, {
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

      const x = i % width;
      const y = (i / width) | 0;

      // One authored stride controls the diagonal lane pattern; no second tile-index gate applies.
      const stripe = (x + 2 * y) % config.stride === 0;
      if (!stripe) continue;

      placements.push({ x, y, feature: best.feature });
    }
    return { placements };
  },
});

export default diagonalStrideStrategy;
