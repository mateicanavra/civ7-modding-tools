import { createStrategy } from "@swooper/mapgen-core/authoring";
import type { ReefFeaturePlacement } from "../../../../model/atoms/index.js";
import PlanReefsContract from "../../contract.js";
import {
  admitReefIntent,
  admitReefStride,
  selectReefIntentCandidate,
} from "../../rules/admit-reef-intent.js";
import StrategyDefinition from "./config.js";

/**
 * Selects the strongest reef-family habitat per tile, with lotus restricted to lakes.
 * The authored stride thins adjacent candidates deterministically without changing habitat law.
 */
const habitatStrategy = createStrategy(PlanReefsContract, StrategyDefinition, {
  run: (input, config) => {
    const width = input.width;
    const height = input.height;
    const size = width * height;

    const placements: ReefFeaturePlacement[] = [];
    void input.seed;

    for (let i = 0; i < size; i++) {
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

export default habitatStrategy;
