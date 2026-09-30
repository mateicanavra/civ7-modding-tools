import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/** Parameter-free atmospheric reduction; the input owns reduction kind and sampling weights. */
export default defineStrategy({
  id: "phase-reduction",
  config: Type.Object({}, {
    additionalProperties: false,
    description: "Parameter-free atmospheric aggregation using the reduction kind and sampling weights supplied by the operation input.",
  }),
});
