import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Arbitrates marsh, mangrove, oasis, tundra bog, and watering-hole intent under one confidence floor.
 * It changes only authored controls; the shared operation remains the sole input and output authority.
 */
export default defineStrategy({
  id: "habitat-confidence",
  config: Type.Object({
    minConfidence01: Type.Number({
      minimum: 0,
      maximum: 1,
      default: 0.24,
      description:
        "Family-local admission threshold: wetland scores below this remain substrate signal, not placement intent.",
    }),
  }),
});
