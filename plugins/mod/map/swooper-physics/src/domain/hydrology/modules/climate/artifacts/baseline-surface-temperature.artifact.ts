import { defineArtifact, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

/** Annual ground-surface thermal vintage before albedo feedback, not sea-level pressure forcing. */
export const artifact = defineArtifact({
  name: "baselineSurfaceTemperature",
  id: "artifact:hydrology.baselineSurfaceTemperature",
  schema: TypedArraySchemas.f32({
    cardinality: "map-grid",
    description:
      "Annual mean of seasonal ground-surface temperature in degrees Celsius before albedo feedback. Land lapse uses height above sea level in model relief units; admitted SST is authoritative over original marine water.",
  }),
  refine: (value, { issues }) => {
    const invalidIndex = value.findIndex((sample) => !Number.isFinite(sample));
    if (invalidIndex >= 0) {
      issues.add(
        `Expected baselineSurfaceTemperature[${invalidIndex}] to be finite (received ${value[invalidIndex]}).`
      );
    }
  },
});
