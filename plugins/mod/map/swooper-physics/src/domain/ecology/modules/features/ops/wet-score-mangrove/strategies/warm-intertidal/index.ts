import { clamp01 } from "@swooper/mapgen-core";
import { createStrategy } from "@swooper/mapgen-core/authoring";

import { rampDown01, rampUp01 } from "../../../../model/policy/feature-score-selection.js";
import Contract from "../../contract.js";
import StrategyDefinition from "./config.js";

/** Requires marine intertidal substrate, then combines warmth, fertility, and low aridity. */
const warmIntertidalStrategy = createStrategy(Contract, StrategyDefinition, {
  run: (input, config) => {
    const size = input.width * input.height;

    const score01 = new Float32Array(size);

    for (let i = 0; i < size; i++) {
      if (input.landMask[i] === 0) continue;
      if (input.intertidalCoastMask[i] === 0) continue;

      // Mangroves are warm intertidal coast features, not generic humid coastal
      // vegetation. The marine low-shore gate is the wet-habitat proxy, not a
      // measurement of freshwater connection, salinity, or root uptake.
      const warmSuit = rampUp01(
        input.surfaceTemperature[i],
        config.tempWarmStartC,
        config.tempWarmEndC
      );
      const fertilitySuit = rampUp01(input.fertility01[i], config.fertilityMin01, 1);
      const ariditySuit = rampDown01(input.aridityIndex[i], config.aridityMax01, 1);

      score01[i] = clamp01(warmSuit * fertilitySuit * ariditySuit);
    }

    return { score01 };
  },
});

export default warmIntertidalStrategy;
