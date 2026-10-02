import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/** Calibration arrives as admitted physical input, not a second configurable demand authority. */
export default defineStrategy({
  id: "temperature-humidity",
  config: Type.Object({}, {
    additionalProperties: false,
    description: "Computes potential demand from supplied temperature, humidity, and baseline calibration.",
  }),
});
