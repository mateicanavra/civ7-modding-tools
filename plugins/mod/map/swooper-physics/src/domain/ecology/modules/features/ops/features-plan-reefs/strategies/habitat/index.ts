import { createStrategy } from "@swooper/mapgen-core/authoring";
import { getHexRadiusIndicesOddQ } from "@swooper/mapgen-core/lib/grid";
import type {
  ReefFeatureIntentKey,
  ReefFeaturePlacement,
} from "../../../../model/atoms/index.js";
import {
  comparePhysicalCandidates,
  type PhysicalCandidate,
} from "../../../../model/policy/feature-score-selection.js";
import PlanReefsContract from "../../contract.js";
import { admitReefIntent, selectReefIntentCandidate } from "../../rules/admit-reef-intent.js";
import StrategyDefinition from "./config.js";

/**
 * Selects the strongest reef-family habitat per tile, with lotus restricted to lakes.
 * Higher-confidence habitat claims wrapped hex neighborhoods before weaker candidates;
 * isolated admitted habitat survives regardless of coordinate origin.
 */
const habitatStrategy = createStrategy(PlanReefsContract, StrategyDefinition, {
  run: (input, config) => {
    const width = input.width;
    const height = input.height;
    const size = width * height;

    const candidates: PhysicalCandidate<ReefFeatureIntentKey>[] = [];
    void input.seed;

    for (let i = 0; i < size; i++) {
      if (input.featureOccupancyMask[i] !== 0) continue;

      const best = selectReefIntentCandidate(input, i);
      if (best === null) continue;
      if (!admitReefIntent(best, config)) continue;
      candidates.push(best);
    }

    candidates.sort(comparePhysicalCandidates);
    const blocked = new Uint8Array(size);
    const placements: ReefFeaturePlacement[] = [];
    for (const candidate of candidates) {
      if (blocked[candidate.tileIndex] !== 0) continue;

      const x = candidate.tileIndex % width;
      const y = (candidate.tileIndex / width) | 0;
      placements.push({ x, y, feature: candidate.feature });
      // Only accepted reef-family intent suppresses neighbors, including across the X seam.
      for (const index of getHexRadiusIndicesOddQ(
        candidate.tileIndex,
        width,
        height,
        config.minSpacingTiles - 1
      )) {
        blocked[index] = 1;
      }
    }

    placements.sort((a, b) => a.y * width + a.x - (b.y * width + b.x));
    return { placements };
  },
});

export default habitatStrategy;
