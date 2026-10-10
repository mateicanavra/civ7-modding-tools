import { createStrategy } from "@swooper/mapgen-core/authoring";

import Contract from "../../contract.js";
import { scoreTaigaSuitability } from "../../rules/index.js";
import StrategyDefinition from "./config.js";

/** Projects annual energy, atmospheric water, biomass, and plant stress into taiga opportunity. */
const coldForestStrategy = createStrategy(Contract, StrategyDefinition, {
  run: (input) => {
    const score01 = scoreTaigaSuitability({
      size: input.width * input.height,
      landMask: input.landMask,
      energy01: input.energy01,
      atmosphericWater01: input.atmosphericWater01,
      plantWaterStress01: input.plantWaterStress01,
      biomass01: input.biomass01,
    });

    return { score01 };
  },
});

export default coldForestStrategy;
