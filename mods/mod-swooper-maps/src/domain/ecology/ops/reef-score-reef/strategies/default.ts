import { clamp01 } from "@swooper/mapgen-core";
import { createStrategy } from "@swooper/mapgen-core/authoring";

import { rampDown01, rampUp01 } from "../../../model/policy/feature-score-selection.js";
import ScoreReefContract from "../contract.js";

export const defaultStrategy = createStrategy(ScoreReefContract, "default", {
  run: (input, config) => {
    const size = input.width * input.height;

    const score01 = new Float32Array(size);

    const shallowDepthM = Math.max(0, config.shallowDepthM | 0);
    const deepDepthM = Math.max(shallowDepthM + 1, config.deepDepthM | 0);
    const maxDistanceToCoast = Math.max(0, config.maxDistanceToCoast | 0);

    for (let i = 0; i < size; i++) {
      if (input.landMask[i] !== 0) continue;
      if (input.shelfMask[i] !== 1) continue;
      if (input.coastalWater[i] !== 1) continue;
      if ((input.distanceToCoast[i] ?? 0) > maxDistanceToCoast) continue;

      // Reef-building corals need warm, shallow, near-coast shelf water; broad
      // tropical ocean suitability must not become a blanket reef intent field.
      const warmSuit = rampUp01(
        input.surfaceTemperature[i],
        config.tempWarmStartC,
        config.tempWarmEndC
      );

      const depth = Math.max(0, -(input.bathymetry[i] | 0));
      const shallowSuit = rampDown01(depth, shallowDepthM, deepDepthM);

      score01[i] = clamp01(warmSuit * shallowSuit);
    }

    return { score01 };
  },
});
