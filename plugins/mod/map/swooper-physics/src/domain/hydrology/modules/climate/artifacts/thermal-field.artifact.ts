import { defineArtifact, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

/** Baseline annual and cold-season thermal evidence before albedo feedback. */
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
      coldestMonthMeanSurfaceTemperatureC: TypedArraySchemas.f32({
        cardinality: "map-grid",
        description:
          "Minimum circular one-twelfth-cycle mean of clipped baseline ground-surface temperature in degrees Celsius, independently integrated from the periodic curve before albedo feedback; not a point minimum or a moisture-phase sample.",
      }),
    },
    {
      additionalProperties: false,
      description: "Baseline ground-surface thermal evidence consumed by climate refinement.",
    }
  ),
  refine: (value, { issues }) => {
    const invalidIndex = value.surfaceTemperatureC.findIndex((sample) => !Number.isFinite(sample));
    if (invalidIndex >= 0) {
      issues.add(
        `Expected thermalField.surfaceTemperatureC[${invalidIndex}] to be finite (received ${value.surfaceTemperatureC[invalidIndex]}).`
      );
    }
    const invalidColdMonth = value.coldestMonthMeanSurfaceTemperatureC.findIndex((sample) => !Number.isFinite(sample));
    if (invalidColdMonth >= 0) {
      issues.add(`Expected thermalField.coldestMonthMeanSurfaceTemperatureC[${invalidColdMonth}] to be finite (received ${value.coldestMonthMeanSurfaceTemperatureC[invalidColdMonth]}).`);
    }
  },
});
