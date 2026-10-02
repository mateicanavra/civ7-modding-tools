import { defineArtifact, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Registers post-island coastline and gradient-break shelf truth consumed by
 * coast projection. Membership is shore-connected gentle continental water plus the shoreline ring,
 * and every persistent mask or distance field is admitted at map cardinality.
 */
export const artifact = defineArtifact({
  name: "shelf",
  id: "artifact:morphology.shelf",
  schema: Type.Object(
    {
      shelfMask: TypedArraySchemas.u8({
        cardinality: "map-grid",
        description:
          "Mask (1/0): post-island shoreline-ring water plus shore-connected gentle continental water; eligible for TERRAIN_COAST projection. Ineligible ring tiles do not seed or carry shelf connectivity.",
      }),
      coastalLand: TypedArraySchemas.u8({
        cardinality: "map-grid",
        description: "Mask (1/0): POST-island land tiles adjacent to water.",
      }),
      coastalWater: TypedArraySchemas.u8({
        cardinality: "map-grid",
        description: "Mask (1/0): POST-island water tiles adjacent to land.",
      }),
      distanceToCoast: TypedArraySchemas.u16({
        cardinality: "map-grid",
        description: "POST-island minimum hex distance to the nearest coastline tile (0=coast).",
      }),
    },
    {
      additionalProperties: false,
      description:
        "Post-island continental-shelf and coastline product consumed by terrain projection and downstream map policy.",
    }
  ),
});
