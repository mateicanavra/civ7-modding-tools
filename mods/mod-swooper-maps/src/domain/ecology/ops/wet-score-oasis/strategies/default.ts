import { clamp01 } from "@swooper/mapgen-core";
import { createStrategy } from "@swooper/mapgen-core/authoring";

import { rampUp01 } from "../../../model/policy/feature-score-selection.js";
import ScoreWetOasisContract from "../contract.js";

export const defaultStrategy = createStrategy(ScoreWetOasisContract, "default", {
  run: (input, config) => {
    const size = input.width * input.height;

    const score01 = new Float32Array(size);

    for (let i = 0; i < size; i++) {
      if (input.landMask[i] === 0) continue;
      if (input.isolatedWaterPointMask[i] === 0) continue;

      // Oases are arid local water-source features. This policy excludes broad
      // floodplain wetlands and leaves lushness to climate/fertility scoring.
      const drySuit = rampUp01(input.aridityIndex[i], config.dryMin01, config.dryMax01);
      const waterSuit = rampUp01(input.water01[i], config.waterMin01, 1);
      const warmSuit = rampUp01(
        input.surfaceTemperature[i],
        config.tempWarmStartC,
        config.tempWarmEndC
      );

      score01[i] = clamp01(drySuit * waterSuit * warmSuit);
    }

    return { score01 };
  },
});
