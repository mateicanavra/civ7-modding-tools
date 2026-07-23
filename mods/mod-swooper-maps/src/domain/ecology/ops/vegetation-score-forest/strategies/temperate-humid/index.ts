import { createStrategy } from "@swooper/mapgen-core/authoring";

import Contract from "../../contract.js";
import { scoreForestSuitability } from "../../rules/index.js";
import StrategyContract from "./contract.js";

/** Projects temperate humidity and fertility into bounded forest suitability. */
const temperateHumidStrategy = createStrategy(Contract, StrategyContract, {
  run: (input) => {
    const score01 = scoreForestSuitability({
      size: input.width * input.height,
      landMask: input.landMask as Uint8Array,
      energy01: input.energy01 as Float32Array,
      water01: input.water01 as Float32Array,
      waterStress01: input.waterStress01 as Float32Array,
      coldStress01: input.coldStress01 as Float32Array,
      biomass01: input.biomass01 as Float32Array,
      fertility01: input.fertility01 as Float32Array,
    });

    return { score01 };
  },
});

export default temperateHumidStrategy;
