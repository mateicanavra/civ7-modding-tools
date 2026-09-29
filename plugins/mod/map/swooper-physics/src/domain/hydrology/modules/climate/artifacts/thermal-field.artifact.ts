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
          "Annual mean of seasonal ground-surface temperature in degrees Celsius before albedo feedback. Land lapse uses height above sea level in model relief units; admitted SST is authoritative over original marine water.",
      }),
    },
    {
      additionalProperties: false,
      description: "Annual baseline ground-surface thermal evidence consumed by climate refinement.",
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
