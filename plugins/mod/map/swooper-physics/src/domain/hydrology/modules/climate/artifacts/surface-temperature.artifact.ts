import { defineArtifact, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

/** Final ground-surface thermal vintage after declared albedo feedback on the annual baseline. */
export const artifact = defineArtifact({
  name: "surfaceTemperature",
  id: "artifact:hydrology.surfaceTemperature",
  schema: TypedArraySchemas.f32({
    cardinality: "map-grid",
    description:
      "Ground-surface temperature in degrees Celsius after bounded albedo feedback on the annual baseline, consumed by Ecology, placement, projection, and analysis.",
  }),
  refine: (value, { issues }) => {
    const invalidIndex = value.findIndex((sample) => !Number.isFinite(sample));
    if (invalidIndex >= 0) {
      issues.add(
        `Expected surfaceTemperature[${invalidIndex}] to be finite (received ${value[invalidIndex]}).`
      );
    }
  },
});
