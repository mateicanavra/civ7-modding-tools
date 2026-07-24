import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Admits ice only when physical freeze confidence reaches the authored family threshold.
 * It changes only authored controls; the shared operation remains the sole input and output authority.
 */
export default defineStrategy({
  id: "score-threshold",
  config: Type.Object({
    minConfidence01: Type.Number({
      minimum: 0,
      maximum: 1,
      default: 0.5,
      description:
        "Family-local admission threshold: freeze scores below this remain coldness signal, not ice intent.",
    }),
  }),
});
