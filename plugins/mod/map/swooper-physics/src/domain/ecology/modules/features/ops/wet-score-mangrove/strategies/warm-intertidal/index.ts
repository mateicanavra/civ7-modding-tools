import { clamp01 } from "@swooper/mapgen-core";
import { createStrategy } from "@swooper/mapgen-core/authoring";

import { rampDown01, rampUp01 } from "../../../../model/policy/feature-score-selection.js";
import Contract from "../../contract.js";
import StrategyDefinition from "./config.js";

/** Scores coarse mangrove occurrence from marine low-shore substrate, warmth, and low aridity. */
const warmIntertidalStrategy = createStrategy(Contract, StrategyDefinition, {
  run: (input, config) => {
    const size = input.width * input.height;

    const score01 = new Float32Array(size);

    for (let i = 0; i < size; i++) {
      if (input.landMask[i] === 0) continue;
      if (input.intertidalCoastMask[i] === 0) continue;

      // Marine low shore is a coarse occurrence proxy, not generic humid coast.
      // Nutrients, persistent tidal inundation, salinity, freshwater connection,
      // and root uptake are not measured by these admitted fields.
      const warmSuit = rampUp01(
        input.surfaceTemperature[i],
        config.tempWarmStartC,
        config.tempWarmEndC
      );
      const ariditySuit = rampDown01(input.aridityIndex[i], config.aridityMax01, 1);

      score01[i] = clamp01(warmSuit * ariditySuit);
    }

    return { score01 };
  },
});

export default warmIntertidalStrategy;
