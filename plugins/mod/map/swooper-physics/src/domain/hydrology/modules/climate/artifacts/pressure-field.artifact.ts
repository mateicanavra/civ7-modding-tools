import { defineArtifact, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Registers the annual mean of the same circulation-pressure anomaly samples consumed by the
 * seasonal wind computations. It is durable model evidence, not a claim of absolute surface
 * pressure or a complete reconstruction of the published wind field.
 */
export const artifact = defineArtifact({
  name: "pressureField",
  id: "artifact:hydrology._internal.pressureField",
  schema: Type.Object(
    {
      pressure: TypedArraySchemas.f32({
        cardinality: "map-grid",
        description:
          "Annual-mean circulation-pressure anomaly proxy in hPa relative to the model reference.",
      }),
    },
    {
      additionalProperties: false,
      description: "Annual-mean circulation-pressure anomaly field for every map tile.",
    }
  ),
});
