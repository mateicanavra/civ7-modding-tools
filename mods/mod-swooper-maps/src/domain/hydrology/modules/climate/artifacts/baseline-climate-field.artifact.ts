import {
  type ArtifactValidationContext,
  type ArtifactValidationIssue,
  appendArtifactTypedArrayIssues,
  artifactCellCount,
  defineArtifact,
  Type,
  TypedArraySchemas,
} from "@swooper/mapgen-core/authoring/contracts";

type BaselineClimateField = Readonly<{
  rainfall: Uint8Array;
  humidity: Uint8Array;
}>;

/** Registers the baseline climate artifact consumed by routing and climate refinement. */
export const artifact = defineArtifact({
  name: "baselineClimateField",
  id: "artifact:hydrology.baselineClimateField",
  schema: Type.Object(
    {
      rainfall: TypedArraySchemas.u8({
        description:
          "Annual-mean precipitation intensity before river-corridor and cryosphere refinement, encoded in Civ7's inclusive 0-200 rainfall domain.",
      }),
      humidity: TypedArraySchemas.u8({
        description:
          "Annual-mean atmospheric moisture available to river routing and climate refinement, encoded on an inclusive 0-255 scale.",
      }),
    },
    {
      additionalProperties: false,
      description:
        "Hydrology's immutable pre-hydrography climate surface with one baseline rainfall and humidity sample for every map tile.",
    }
  ),
  refine: (
    input: unknown,
    context?: ArtifactValidationContext
  ): readonly ArtifactValidationIssue[] => {
    const value = input as BaselineClimateField;
    const issues: ArtifactValidationIssue[] = [];
    const expectedSize = artifactCellCount(context);

    if (
      appendArtifactTypedArrayIssues(
        issues,
        "climate.rainfall",
        value.rainfall,
        Uint8Array,
        expectedSize
      )
    ) {
      const invalidIndex = value.rainfall.findIndex((sample) => sample > 200);
      if (invalidIndex >= 0) {
        issues.push({
          message: `Expected climate.rainfall[${invalidIndex}] to be within 0..200 (received ${value.rainfall[invalidIndex]}).`,
        });
      }
    }
    appendArtifactTypedArrayIssues(
      issues,
      "climate.humidity",
      value.humidity,
      Uint8Array,
      expectedSize
    );
    return Object.freeze(issues);
  },
});
