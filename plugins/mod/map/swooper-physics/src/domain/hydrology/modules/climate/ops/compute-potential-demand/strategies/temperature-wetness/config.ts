import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/** Calibration arrives as admitted physical input, not a second configurable demand authority. */
export default defineStrategy({
  id: "temperature-wetness",
  config: Type.Object({}, {
    additionalProperties: false,
    description: "Computes potential demand from supplied temperature, empirical surface wetness, and baseline calibration.",
  }),
});
