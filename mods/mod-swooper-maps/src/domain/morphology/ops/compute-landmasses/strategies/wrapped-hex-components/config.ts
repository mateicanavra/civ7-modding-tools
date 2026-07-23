import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/** Declares authored configuration for the `wrapped-hex-components` implementation of `morphology/compute-landmasses`. */
export default defineStrategy({
  id: "wrapped-hex-components",
  config: Type.Object(
    {},
    {
      description: "No strategy-specific tuning for landmass decomposition.",
    }
  ),
});
