import { createStrategy } from "@swooper/mapgen-core/authoring";

import Contract from "../../contract.js";
import { scoreTaigaSuitability } from "../../rules/index.js";
import StrategyDefinition from "./config.js";

/** Projects cold moist bioclimate and biomass into bounded taiga suitability. */
const coldForestStrategy = createStrategy(Contract, StrategyDefinition, {
  run: (input) => {
    const score01 = scoreTaigaSuitability({
      size: input.width * input.height,
      landMask: input.landMask,
      energy01: input.energy01,
      water01: input.water01,
      waterStress01: input.waterStress01,
      coldStress01: input.coldStress01,
      biomass01: input.biomass01,
    });

    return { score01 };
  },
});

export default coldForestStrategy;
