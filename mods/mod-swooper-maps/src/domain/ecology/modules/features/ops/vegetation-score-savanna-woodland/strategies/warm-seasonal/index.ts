import { createStrategy } from "@swooper/mapgen-core/authoring";

import Contract from "../../contract.js";
import { scoreSavannaWoodlandSuitability } from "../../rules/index.js";
import StrategyDefinition from "./config.js";

/** Projects warm seasonal moisture and open biomass into bounded savanna-woodland suitability. */
const warmSeasonalStrategy = createStrategy(Contract, StrategyDefinition, {
  run: (input) => {
    const score01 = scoreSavannaWoodlandSuitability({
      size: input.width * input.height,
      landMask: input.landMask,
      energy01: input.energy01,
      water01: input.water01,
      waterStress01: input.waterStress01,
      biomass01: input.biomass01,
    });

    return { score01 };
  },
});

export default warmSeasonalStrategy;
