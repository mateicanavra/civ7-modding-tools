import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Selects the strongest reef habitat and applies deterministic tile-index spacing after admission.
 * It changes only authored controls; the shared operation remains the sole input and output authority.
 */
export default defineStrategy({
  id: "habitat",
  config: Type.Object(
    {
      minConfidence01: Type.Number({
        minimum: 0,
        maximum: 1,
        default: 0.55,
        description:
          "Reef-family score below which ocean habitat remains evidence rather than placement intent.",
      }),
      stride: Type.Integer({
        minimum: 1,
        maximum: 12,
        default: 1,
        description:
          "Deterministic spacing stride for sparse reef-family intent; 1 keeps every admitted habitat tile.",
      }),
    },
    {
      description:
        "Reef confidence floor and deterministic tile-index spacing used to select eligible reef-family habitat.",
    }
  ),
});
