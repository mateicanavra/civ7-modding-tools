import { createStrategy } from "@swooper/mapgen-core/authoring";

import Contract from "../../contract.js";
import { scoreRainforestSuitability } from "../../rules/index.js";
import StrategyDefinition from "./config.js";

/** Projects warm humid bioclimate and biomass into bounded rainforest suitability. */
const warmHumidStrategy = createStrategy(Contract, StrategyDefinition, {
  run: (input) => {
    const score01 = scoreRainforestSuitability({
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

export default warmHumidStrategy;
