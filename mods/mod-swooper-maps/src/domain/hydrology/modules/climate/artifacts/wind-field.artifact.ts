import {
  type ArtifactValidationContext,
  type ArtifactValidationIssue,
  appendArtifactTypedArrayIssues,
  artifactCellCount,
  defineArtifact,
  Type,
  TypedArraySchemas,
} from "@swooper/mapgen-core/authoring/contracts";

type WindField = Readonly<{
  windU: Int8Array;
  windV: Int8Array;
}>;

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
        description: "Atmospheric east-west forcing component per map tile (-127..127).",
      }),
      windV: TypedArraySchemas.i8({
        description: "Atmospheric north-south forcing component per map tile (-127..127).",
      }),
    },
    {
      additionalProperties: false,
      description: "Atmospheric wind forcing used by Hydrology moisture transport.",
    }
  ),
  refine: (
    input: unknown,
    context?: ArtifactValidationContext
  ): readonly ArtifactValidationIssue[] => {
    const value = input as WindField;
    const expectedLength = artifactCellCount(context);
    const errors: ArtifactValidationIssue[] = [];
    appendArtifactTypedArrayIssues(errors, "wind.windU", value.windU, Int8Array, expectedLength);
    appendArtifactTypedArrayIssues(errors, "wind.windV", value.windV, Int8Array, expectedLength);
    return errors;
  },
});
