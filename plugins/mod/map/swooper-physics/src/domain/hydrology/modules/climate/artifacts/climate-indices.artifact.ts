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
          "Ground-surface temperature in degrees Celsius after bounded albedo feedback on the annual baseline, consumed by Ecology, placement, projection, and analysis.",
      }),
      effectiveMoisture: TypedArraySchemas.f32({
        cardinality: "map-grid",
        description:
          "Land-only model precipitation + 0.35*255*surfaceWetness + radius-1 wrapped-hex river bonus (minor=4, major=8); no atmospheric rain is added, and water remains 0.",
      }),
      pet: TypedArraySchemas.f32({
        cardinality: "map-grid",
        description:
          "Land-only empirical potential demand in H=1 rainfall-index-equivalent units, recomputed at the refined annual-temperature vintage, not actual evapotranspiration or the baseline weighted phase demand.",
      }),
      aridityIndex: TypedArraySchemas.f32({
        cardinality: "map-grid",
        description: "Dryness ratio derived from float model precipitation and refined empirical potential demand (0..1).",
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
  refine: (value, { issues }) => {
    const invalidIndex = value.surfaceTemperatureC.findIndex((sample) => !Number.isFinite(sample));
    if (invalidIndex >= 0) {
      issues.add(
        `Expected climateIndices.surfaceTemperatureC[${invalidIndex}] to be finite (received ${value.surfaceTemperatureC[invalidIndex]}).`
      );
    }
  },
});
