import { defineArtifact, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Registers per-tile soil class and normalized fertility derived from morphology and baseline
 * climate. Biome and resource-basin planning share this artifact rather than recomputing soil
 * proxies.
 */
export const artifact = defineArtifact({
  name: "pedology",
  id: "artifact:ecology.soils",
  schema: Type.Object(
    {
      width: Type.Integer({ minimum: 1, description: "Map-grid width represented by the fields." }),
      height: Type.Integer({
        minimum: 1,
        description: "Map-grid height represented by the fields.",
      }),
      soilType: TypedArraySchemas.u8({
        cardinality: "map-grid",
        description: "Soil type index per tile.",
      }),
      fertility: TypedArraySchemas.f32({
        cardinality: "map-grid",
        description: "Normalized fertility per tile (0..1).",
      }),
    },
    {
      additionalProperties: false,
      description: "Per-tile Ecology soil class and normalized fertility evidence.",
    }
  ),
  refine: (value, { dimensions, issues }) => {
    if (value.width !== dimensions.width || value.height !== dimensions.height) {
      issues.add("Pedology dimensions mismatch.");
    }
  },
});
