import { defineArtifact, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Registers the pre-island carved coastline snapshot used by downstream
 * terrain shaping. Admission requires map-sized mask and distance arrays;
 * post-island coastline truth belongs to the shelf artifact.
 */
export const artifact = defineArtifact({
  name: "carvedCoastline",
  id: "artifact:morphology.carvedCoastline",
  schema: Type.Object(
    {
      coastalLand: TypedArraySchemas.u8({
        cardinality: "map-grid",
        description: "Mask (1/0): land tiles adjacent to water.",
      }),
      coastalWater: TypedArraySchemas.u8({
        cardinality: "map-grid",
        description: "Mask (1/0): water tiles adjacent to land.",
      }),
      distanceToCoast: TypedArraySchemas.u16({
        cardinality: "map-grid",
        description:
          "Minimum tile-graph distance to any coastline tile (0=coast), using wrapX=true and wrapY=false.",
      }),
    },
    {
      additionalProperties: false,
      description:
        "Pre-island carved coastline product used by later Morphology shaping; final post-island coastline truth belongs to the shelf artifact.",
    }
  ),
});
