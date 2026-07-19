import { clamp01 } from "@swooper/mapgen-core";
import { createStrategy } from "@swooper/mapgen-core/authoring";

import { rampUp01 } from "../../../model/policy/feature-score-selection.js";
import ScoreWetWateringHoleContract from "../contract.js";

export const defaultStrategy = createStrategy(ScoreWetWateringHoleContract, "default", {
  run: (input, config) => {
    const size = input.width * input.height;

    const score01 = new Float32Array(size);

    for (let i = 0; i < size; i++) {
      if (input.landMask[i] === 0) continue;
      if (input.isolatedWaterPointMask[i] === 0) continue;

      // Watering holes share the arid water-source substrate with oases but
      // stay drier and less fertile through their own scoring policy.
      const drySuit = rampUp01(input.aridityIndex[i], config.dryMin01, config.dryMax01);
      const waterSuit = rampUp01(input.water01[i], config.waterMin01, 1);
      const fertilitySuit = rampUp01(input.fertility01[i], config.fertilityMin01, 1);
      const warmSuit = rampUp01(
        input.surfaceTemperature[i],
        config.tempWarmStartC,
        config.tempWarmEndC
      );

      score01[i] = clamp01(drySuit * waterSuit * fertilitySuit * warmSuit);
    }

    return { score01 };
  },
});
