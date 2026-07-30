import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Chooses the highest-confidence floodplain candidate above the authored confidence floor.
 * It changes only authored controls; the shared operation remains the sole input and output authority.
 */
export default defineStrategy({
  id: "highest-confidence",
  config: Type.Object(
    {
      minConfidence01: Type.Number({
        minimum: 0,
        maximum: 1,
        default: 0.5,
        description:
          "Minimum floodplain suitability required to author a floodplain feature intent.",
      }),
    },
    {
      description:
        "Confidence floor used to select the strongest admitted floodplain candidate per tile.",
    }
  ),
});
