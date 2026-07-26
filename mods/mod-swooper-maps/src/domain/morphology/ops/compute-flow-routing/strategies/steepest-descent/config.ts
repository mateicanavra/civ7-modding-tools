import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/** Declares authored configuration for the `steepest-descent` implementation of `morphology/compute-flow-routing`. */
export default defineStrategy({
  id: "steepest-descent",
  config: Type.Object(
    {},
    {
      description: "Routing configuration (currently no tunable knobs).",
    }
  ),
});
