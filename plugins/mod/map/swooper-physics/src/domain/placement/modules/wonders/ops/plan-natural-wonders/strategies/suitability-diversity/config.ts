import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Semantic identity and authored spacing control for deterministic natural-wonder selection.
 * Candidate evidence and planned placement output remain owned by the shared operation contract.
 */
export default defineStrategy({
  id: "suitability-diversity",
  config: Type.Object(
    {
      minSpacingTiles: Type.Integer({
        minimum: 0,
        maximum: 16,
        default: 6,
        description: "Minimum hex-tile spacing between planned natural-wonder anchors.",
      }),
    },
    {
      description:
        "Spacing control applied while selecting suitability-ranked natural-wonder anchors before Civ7 materialization.",
    }
  ),
});
