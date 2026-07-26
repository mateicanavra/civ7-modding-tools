import { defineArtifact, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Registers refined snow, sea-ice, albedo, ground-ice, permafrost, and melt-potential fields.
 * Downstream biome and ice planning consume one dimension-aligned cryosphere vintage.
 */
export const artifact = defineArtifact({
  name: "cryosphere",
  id: "artifact:hydrology.cryosphere",
  schema: Type.Object(
    {
      snowCover: TypedArraySchemas.u8({
        cardinality: "map-grid",
        description: "Seasonal snow-cover fraction per tile (0..255).",
      }),
      seaIceCover: TypedArraySchemas.u8({
        cardinality: "map-grid",
        description: "Sea-ice cover fraction per tile (0..255).",
      }),
      albedo: TypedArraySchemas.u8({
        cardinality: "map-grid",
        description: "Surface reflectivity proxy used by bounded thermal feedback (0..255).",
      }),
      groundIce01: TypedArraySchemas.f32({
        cardinality: "map-grid",
        description: "Persistence of subsurface ground ice on land (0..1).",
      }),
      permafrost01: TypedArraySchemas.f32({
        cardinality: "map-grid",
        description: "Persistence of permafrost conditions on land (0..1).",
      }),
      meltPotential01: TypedArraySchemas.f32({
        cardinality: "map-grid",
        description: "Snow-weighted capacity for seasonal melt on land (0..1).",
      }),
    },
    {
      additionalProperties: false,
      description:
        "Hydrology snow, sea-ice, albedo, ground-ice, permafrost, and melt-potential state aligned to the map grid.",
    }
  ),
});
