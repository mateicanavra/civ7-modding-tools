import type { ArtifactValidationContext } from "@swooper/mapgen-core/authoring/contracts";
import {
  appendArtifactTypedArrayIssues,
  artifactCellCount,
  defineArtifact,
  Type,
  TypedArraySchemas,
  validateArtifactSchema,
} from "@swooper/mapgen-core/authoring/contracts";

/**
 * Closed contract for the final rainfall and humidity surface after climate refinement.
 * Each typed array contains exactly one immutable sample per map tile.
 */
export const Schema = Type.Object(
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
);

/** Registers the final climate artifact consumed by map projection and Ecology. */
export const artifact = defineArtifact({
  name: "climateField",
  id: "artifact:climateField",
  schema: Schema,
});

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

/**
 * Validates the final climate vintage against its closed schema, map cardinality,
 * and the narrower Civ7 rainfall range that a Uint8Array alone cannot express.
 */
export function validate(
  value: unknown,
  context?: ArtifactValidationContext
): readonly { message: string }[] {
  const issues = [...validateArtifactSchema(artifact.schema, value)];
  if (!isRecord(value)) return Object.freeze(issues);

  const expectedSize = artifactCellCount(context);
  const rainfall = value.rainfall;
  const humidity = value.humidity;

  if (
    appendArtifactTypedArrayIssues(issues, "climate.rainfall", rainfall, Uint8Array, expectedSize)
  ) {
    const invalidIndex = rainfall.findIndex((sample) => sample > 200);
    if (invalidIndex >= 0) {
      issues.push({
        message: `Expected climate.rainfall[${invalidIndex}] to be within 0..200 (received ${rainfall[invalidIndex]}).`,
      });
    }
  }

  appendArtifactTypedArrayIssues(issues, "climate.humidity", humidity, Uint8Array, expectedSize);

  return Object.freeze(issues);
}
