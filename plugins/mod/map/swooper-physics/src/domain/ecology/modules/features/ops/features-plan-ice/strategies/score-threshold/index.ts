import { createStrategy } from "@swooper/mapgen-core/authoring";
import type { IceFeaturePlacement } from "../../../../model/atoms/index.js";
import { confidenceFromScore01 } from "../../../../model/policy/feature-score-selection.js";
import PlanIceContract from "../../contract.js";
import { admitIceIntent } from "../../rules/admit-ice-intent.js";
import StrategyDefinition from "./config.js";

/** Selects unoccupied external-water ice intent at the configured confidence threshold. */
const scoreThresholdStrategy = createStrategy(PlanIceContract, StrategyDefinition, {
  run: (input, config) => {
    const width = input.width;
    const height = input.height;
    const size = width * height;

    const placements: IceFeaturePlacement[] = [];
    void input.seed;

    for (let i = 0; i < size; i++) {
      if (input.externalWaterMask[i] !== 1) continue;
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

export default scoreThresholdStrategy;
