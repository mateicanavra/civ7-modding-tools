import { defineArtifact, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

/** Annual ground-surface thermal vintage before albedo feedback, not sea-level pressure forcing. */
export const artifact = defineArtifact({
  name: "thermalField",
  id: "artifact:hydrology._internal.thermalField",
  schema: Type.Object(
    {
      surfaceTemperatureC: TypedArraySchemas.f32({
        cardinality: "map-grid",
        description:
          "Annual ground-surface thermal proxy in degrees Celsius before albedo feedback: the dense clipped incumbent mean, or with enabled regional response its bounded sum with the weighted producer-phase clipped-ground departure, reduced before Float32 publication. Cells with zero anomaly at every producer phase retain the exact incumbent annual publication. Not a reconstructed corrected-cycle integral. Land lapse uses height above sea level in model relief units; prescribed SST is authoritative over original marine water.",
      }),
    },
    {
      additionalProperties: false,
      description: "Annual baseline ground-surface thermal proxy consumed by climate refinement.",
    }
  ),
  refine: (value, { issues }) => {
    const invalidIndex = value.surfaceTemperatureC.findIndex((sample) => !Number.isFinite(sample));
    if (invalidIndex >= 0) {
      issues.add(
        `Expected thermalField.surfaceTemperatureC[${invalidIndex}] to be finite (received ${value.surfaceTemperatureC[invalidIndex]}).`
      );
    }
  },
});
