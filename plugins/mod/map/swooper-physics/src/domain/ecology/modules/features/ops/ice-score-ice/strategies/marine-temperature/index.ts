import { clamp01 } from "@swooper/mapgen-core";
import { createStrategy } from "@swooper/mapgen-core/authoring";

import { rampDown01 } from "../../../../model/policy/feature-score-selection.js";
import Contract from "../../contract.js";
import StrategyDefinition from "./config.js";

/** Scores current climate temperature only on physical external-water recipients. */
const marineTemperatureStrategy = createStrategy(Contract, StrategyDefinition, {
  run: (input, config) => {
    const size = input.width * input.height;

    const score01 = new Float32Array(size);

    for (let i = 0; i < size; i++) {
      if (input.externalWaterMask[i] !== 1) continue;
      score01[i] = clamp01(
        rampDown01(input.surfaceTemperature[i], config.seaTempColdC, config.seaTempWarmC)
      );
    }

    return { score01 };
  },
});

export default marineTemperatureStrategy;
