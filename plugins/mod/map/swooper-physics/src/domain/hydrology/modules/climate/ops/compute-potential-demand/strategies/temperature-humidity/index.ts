import { createStrategy } from "@swooper/mapgen-core/authoring";
import { clamp01 } from "@swooper/mapgen-core/lib/math";
import ComputePotentialDemandContract from "../../contract.js";
import { lerp01 } from "../../rules/index.js";
import TemperatureHumidityDefinition from "./config.js";

/** Preserves the original PET arithmetic and its double-precision intermediate for aridity. */
export default createStrategy(ComputePotentialDemandContract, TemperatureHumidityDefinition, {
  run: (input) => {
    const size = input.width * input.height;
    const pet = new Array<number>(size).fill(0);
    const { tMinC, tMaxC, petBase, petTemperatureWeight, humidityDampening } = input.parameters;
    const tMax = Math.max(tMinC + 1e-6, tMaxC);
    for (let i = 0; i < size; i++) {
      if (input.landMask[i] !== 1) continue;
      if (!Number.isFinite(input.surfaceTemperatureC[i])) {
        throw new RangeError(`Expected finite potential-demand temperature at land tile ${i}.`);
      }
      const tempFactor = lerp01(input.surfaceTemperatureC[i]!, tMinC, tMax);
      const damp = 1 - humidityDampening * clamp01(input.humidity[i]! / 255);
      pet[i] = (petBase + petTemperatureWeight * tempFactor) * clamp01(damp);
    }
    return { pet };
  },
});
