import { createStrategy } from "@swooper/mapgen-core/authoring";
import contract from "../../contract.js";
import definition from "./config.js";

/** Supplies every finite cell if dry; the basin budget replaces this with wet P-D on its final wet footprint. */
export default createStrategy(contract, definition, {
  run: (input, config) => {
    const size = input.width * input.height;
    if (
      input.externalWaterMask.length !== size ||
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
      if (input.externalWaterMask[cell] !== 0 && input.externalWaterMask[cell] !== 1)
        throw new RangeError("Local runoff requires a binary external water mask.");
      if (input.externalWaterMask[cell]) continue;
      const precipitation = input.rainfall[cell]!;
      runoff[cell] =
        precipitation *
        (1 - config.infiltrationFraction) *
        (1 - config.humidityDampening * Math.max(0, Math.min(1, input.humidity[cell]! / 255)));
    }
    return { runoff };
  },
});
