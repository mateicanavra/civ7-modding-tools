import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/** Parameter-free moisture reduction; phase demand is input evidence, not a recomputed annual value. */
export default defineStrategy({
  id: "phase-reduction",
  config: Type.Object({}, {
    additionalProperties: false,
    description: "Parameter-free weather and annual moisture aggregation that preserves phase-resolved potential demand.",
  }),
});
