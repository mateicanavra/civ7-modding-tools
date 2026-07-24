import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/** Declares authored configuration for the `wrapped-hex-adjacency` implementation of `morphology/compute-coastal-adjacency`. */
export default defineStrategy({
  id: "wrapped-hex-adjacency",
  config: Type.Object(
    {},
    {
      additionalProperties: false,
      description: "Parameter-free shoreline adjacency over the odd-Q hex grid.",
    }
  ),
});
