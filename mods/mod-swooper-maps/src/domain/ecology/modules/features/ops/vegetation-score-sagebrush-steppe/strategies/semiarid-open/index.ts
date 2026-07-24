import { createStrategy } from "@swooper/mapgen-core/authoring";

import Contract from "../../contract.js";
import { scoreSagebrushSteppeSuitability } from "../../rules/index.js";
import StrategyDefinition from "./config.js";

/** Projects warm semiarid conditions and sparse biomass into bounded sagebrush-steppe suitability. */
const semiaridOpenStrategy = createStrategy(Contract, StrategyDefinition, {
  run: (input) => {
    const score01 = scoreSagebrushSteppeSuitability({
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

export default semiaridOpenStrategy;
