import { defineArtifact, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Registers refined per-tile temperature, evapotranspiration, aridity, freeze, and related
 * climate indices. Ecology consumes these normalized physical signals instead of deriving
 * parallel climate policy.
 */
export const artifact = defineArtifact({
  name: "climateIndices",
  id: "artifact:hydrology.climateIndices",
  schema: Type.Object(
    {
      surfaceTemperatureC: TypedArraySchemas.f32({
        cardinality: "map-grid",
        description:
          "Surface temperature proxy in degrees Celsius used for biome gating and freeze behavior.",
      }),
      effectiveMoisture: TypedArraySchemas.f32({
        cardinality: "map-grid",
        description:
          "Moisture available to Ecology after rainfall, humidity, and nearby river influence are combined.",
      }),
      pet: TypedArraySchemas.f32({
        cardinality: "map-grid",
        description:
          "Potential evapotranspiration proxy in rainfall units used to distinguish water demand from supply.",
      }),
      aridityIndex: TypedArraySchemas.f32({
        cardinality: "map-grid",
        description: "Dryness ratio derived from precipitation and evapotranspiration (0..1).",
      }),
      freezeIndex: TypedArraySchemas.f32({
        cardinality: "map-grid",
        description: "Persistence of freezing conditions per tile (0..1).",
      }),
    },
    {
      additionalProperties: false,
      description:
        "Derived Hydrology climate signals consumed by Ecology and product analysis without re-deriving climate policy.",
    }
  ),
});
