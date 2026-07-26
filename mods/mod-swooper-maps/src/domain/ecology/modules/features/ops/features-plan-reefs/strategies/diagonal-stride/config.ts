import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Selects the strongest reef habitat along an authored diagonal lane; lotus remains lake-gated.
 * It changes only authored controls; the shared operation remains the sole input and output authority.
 */
export default defineStrategy({
  id: "diagonal-stride",
  config: Type.Object({
    minConfidence01: Type.Number({
      minimum: 0,
      maximum: 1,
      default: 0.55,
      description:
        "Family-local admission threshold before the diagonal spacing policy is applied.",
    }),
    stride: Type.Integer({
      minimum: 1,
      maximum: 12,
      default: 5,
      description: "Deterministic diagonal spacing stride for reef-family intent.",
    }),
  }),
});
