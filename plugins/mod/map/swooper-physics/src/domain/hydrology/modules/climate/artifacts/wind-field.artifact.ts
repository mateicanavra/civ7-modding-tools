import { defineArtifact, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Registers the baseline atmosphere-wide wind vectors consumed across Hydrology climate steps.
 * Ocean currents remain invocation-local to the baseline step because no downstream causal
 * consumer requires them as durable pipeline state.
 */
export const artifact = defineArtifact({
  name: "windField",
  id: "artifact:hydrology._internal.windField",
  schema: Type.Object(
    {
      windU: TypedArraySchemas.i8({
        cardinality: "map-grid",
        description: "Atmospheric east-west forcing component per map tile (-127..127).",
      }),
      windV: TypedArraySchemas.i8({
        cardinality: "map-grid",
        description: "Atmospheric north-south forcing component per map tile (-127..127).",
      }),
    },
    {
      additionalProperties: false,
      description: "Atmospheric wind forcing used by Hydrology moisture transport.",
    }
  ),
});
