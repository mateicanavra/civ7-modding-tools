import { defineArtifact, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Registers Foundation crust properties sampled from mesh cells into tile
 * space for Morphology and diagnostic consumers.
 */
export const artifact = defineArtifact({
  name: "crustTiles",
  id: "artifact:foundation.crustTiles",
  schema: Type.Object(
    {
      type: TypedArraySchemas.u8({ cardinality: "map-grid" }),
      maturity: TypedArraySchemas.f32({ cardinality: "map-grid" }),
      thickness: TypedArraySchemas.f32({ cardinality: "map-grid" }),
      damage: TypedArraySchemas.u8({ cardinality: "map-grid" }),
      age: TypedArraySchemas.u8({ cardinality: "map-grid" }),
      buoyancy: TypedArraySchemas.f32({ cardinality: "map-grid" }),
      baseElevation: TypedArraySchemas.f32({ cardinality: "map-grid" }),
      strength: TypedArraySchemas.f32({ cardinality: "map-grid" }),
    },
    {
      additionalProperties: false,
      description: "Evolved crust fields sampled from mesh cells into map-tile space.",
    }
  ),
});
