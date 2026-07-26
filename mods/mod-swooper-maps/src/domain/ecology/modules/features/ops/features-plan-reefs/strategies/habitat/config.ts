import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Selects the strongest reef habitat and applies deterministic tile-index spacing after admission.
 * It changes only authored controls; the shared operation remains the sole input and output authority.
 */
export default defineStrategy({
  id: "habitat",
  config: Type.Object({
    minConfidence01: Type.Number({
      minimum: 0,
      maximum: 1,
      default: 0.55,
      description:
        "Family-local admission threshold: reef-family scores below this remain ocean habitat signal, not placement intent.",
    }),
    stride: Type.Integer({
      minimum: 1,
      maximum: 12,
      default: 1,
      description:
        "Deterministic spacing stride for sparse reef-family intent; 1 keeps every admitted habitat tile.",
    }),
  }),
});
