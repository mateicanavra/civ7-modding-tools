import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Selects admitted reef habitat by physical quality with minimum wrapped hex spacing.
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
      minSpacingTiles: Type.Integer({
        minimum: 1,
        maximum: 12,
        default: 1,
        description:
          "Minimum hex-edge distance between reef-family intents; 1 keeps every admitted habitat tile.",
      }),
    },
    {
      description:
        "Reef confidence floor and minimum wrapped hex spacing used to select eligible reef-family habitat.",
    }
  ),
});
