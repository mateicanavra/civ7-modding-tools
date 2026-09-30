import { clamp01 } from "@swooper/mapgen-core";
import { createStrategy } from "@swooper/mapgen-core/authoring";

import { rampDown01, rampUp01 } from "../../../../model/policy/feature-score-selection.js";
import Contract from "../../contract.js";
import { computeCertifiedLakeShoreDistance } from "../../rules/certified-lake-shore-distance.js";
import StrategyDefinition from "./config.js";

/** Favors warm, shallow, near-shore lake tiles and leaves ocean habitat to reef scorers. */
const warmShallowLakeStrategy = createStrategy(Contract, StrategyDefinition, {
  run: (input, config) => {
    const size = input.width * input.height;

    const score01 = new Float32Array(size);

    const shallowDepthM = Math.max(0, config.shallowDepthM | 0);
    const deepDepthM = Math.max(shallowDepthM + 1, config.deepDepthM | 0);
    const maxDistanceToCoast = Math.max(0, config.maxDistanceToCoast | 0);

    const shoreDistance = computeCertifiedLakeShoreDistance(input);
    for (let i = 0; i < size; i++) {
      if (input.lakeMask[i] !== 1) continue;
      if (shoreDistance[i] < 0 || shoreDistance[i] > maxDistanceToCoast) continue;
      const depth = input.waterSurface[i] - input.elevation[i];
      if (depth <= 0) continue;
      const warmSuit = rampUp01(
        input.surfaceTemperature[i],
        config.tempWarmStartC,
        config.tempWarmEndC
      );

      const shallowSuit = rampDown01(depth, shallowDepthM, deepDepthM);

      score01[i] = clamp01(warmSuit * shallowSuit);
    }

    return { score01 };
  },
});

export default warmShallowLakeStrategy;
