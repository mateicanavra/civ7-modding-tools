import { createStrategy } from "@swooper/mapgen-core/authoring";
import contract from "../../contract.js";
import definition from "./config.js";

/** Attributes runoff to original-land rainfall after infiltration and humidity withholding; marine cells remain zero. */
export default createStrategy(contract, definition, {
  run: (input, config) => {
    const size = input.width * input.height;
    if (
      input.landMask.length !== size ||
      input.rainfall.length !== size ||
      input.humidity.length !== size
    )
      throw new RangeError("Local runoff requires map-grid inputs.");
    for (const value of [config.infiltrationFraction, config.humidityDampening]) {
      if (!Number.isFinite(value) || value < 0 || value > 1)
        throw new RangeError("Runoff fractions must be finite and in 0..1.");
    }
    const runoff: number[] = Array(size).fill(0);
    for (let cell = 0; cell < size; cell++) {
      if (input.landMask[cell] !== 0 && input.landMask[cell] !== 1)
        throw new RangeError("Local runoff requires a binary original marine mask.");
      if (!input.landMask[cell]) continue;
      const precipitation = input.rainfall[cell]!;
      runoff[cell] =
        precipitation *
        (1 - config.infiltrationFraction) *
        (1 - config.humidityDampening * Math.max(0, Math.min(1, input.humidity[cell]! / 255)));
    }
    return { runoff };
  },
});
