import { createStrategy } from "@swooper/mapgen-core/authoring";

import Contract from "../../contract.js";
import { scoreForestSuitability } from "../../rules/index.js";
import StrategyDefinition from "./config.js";

/** Projects temperate humidity and fertility into bounded forest suitability. */
const temperateHumidStrategy = createStrategy(Contract, StrategyDefinition, {
  run: (input) => {
    const score01 = scoreForestSuitability({
      size: input.width * input.height,
      landMask: input.landMask,
      energy01: input.energy01,
      water01: input.water01,
      waterStress01: input.waterStress01,
      coldStress01: input.coldStress01,
      biomass01: input.biomass01,
      fertility01: input.fertility01,
    });

    return { score01 };
  },
});

export default temperateHumidStrategy;
