import { defineArtifact, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Registers shoreline adjacency and distance evidence derived from base topography.
 *
 * This pre-island vintage supports downstream terrain shaping. Final post-island
 * coastline evidence belongs to the shelf artifact.
 */
export const artifact = defineArtifact({
  name: "baseCoastline",
  id: "artifact:morphology.baseCoastline",
  schema: Type.Object(
    {
      coastalLand: TypedArraySchemas.u8({
        cardinality: "map-grid",
        description: "Mask (1/0): base land tiles adjacent to water.",
      }),
      coastalWater: TypedArraySchemas.u8({
        cardinality: "map-grid",
        description: "Mask (1/0): base water tiles adjacent to land.",
      }),
      distanceToCoast: TypedArraySchemas.u16({
        cardinality: "map-grid",
        description:
          "Minimum wrapped-hex distance from each base tile to the nearest shoreline tile.",
      }),
    },
    {
      additionalProperties: false,
      description:
        "Pre-island shoreline adjacency and distance evidence derived from base Morphology topography.",
    }
  ),
});
