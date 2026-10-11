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
          "Resolved exposed-land atmospheric precipitation + 0.35*255*surfaceWetness, preserving the empirical moisture scale without clipping float precipitation; water remains 0.",
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
      localSurfaceWaterOpportunity: TypedArraySchemas.f32({
        cardinality: "map-grid",
        description: "Local annual surface-water opportunity per represented exposed-land tile area in rainfall-index units; zero on water, not delivered water, groundwater, permanence, or salinity proof.",
      }),
      plantEffectiveMoisture: TypedArraySchemas.f32({
        cardinality: "map-grid",
        description: "Atmospheric moisture plus local annual surface-water opportunity on exposed land; not permanence, salinity, groundwater, or root uptake.",
      }),
      plantWaterStress: TypedArraySchemas.f32({
        cardinality: "map-grid",
        description: "Post-albedo unrounded demand / (demand + precipitation + local annual surface-water opportunity + 1); zero on water.",
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
