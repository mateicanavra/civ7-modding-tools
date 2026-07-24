import {
  type ArtifactValidationContext,
  type ArtifactValidationIssue,
  appendArtifactTypedArrayIssues,
  artifactCellCount,
  defineArtifact,
  Type,
  TypedArraySchemas,
} from "@swooper/mapgen-core/authoring/contracts";

type ClimateField = Readonly<{
  rainfall: Uint8Array;
  humidity: Uint8Array;
}>;

/** Registers the final climate artifact consumed by map projection and Ecology. */
export const artifact = defineArtifact({
  name: "climateField",
  id: "artifact:hydrology.climateField",
  schema: Type.Object(
    {
      rainfall: TypedArraySchemas.u8({
        description:
          "Final per-tile precipitation intensity consumed by projection and Ecology, encoded in Civ7's inclusive 0-200 rainfall domain.",
      }),
      humidity: TypedArraySchemas.u8({
        description:
          "Final per-tile atmospheric moisture after river-corridor and cryosphere refinement, encoded on an inclusive 0-255 scale.",
      }),
    },
    {
      additionalProperties: false,
      description:
        "Hydrology's immutable final climate surface with one refined rainfall and humidity sample for every map tile.",
    }
  ),
  refine: (
    input: unknown,
    context?: ArtifactValidationContext
  ): readonly ArtifactValidationIssue[] => {
    const value = input as ClimateField;
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
