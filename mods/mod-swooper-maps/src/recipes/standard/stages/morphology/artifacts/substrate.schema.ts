import type { ArtifactValidationContext, TSchema } from "@swooper/mapgen-core/authoring/contracts";
import {
  appendArtifactTypedArrayIssues,
  artifactCellCount,
  Type,
  TypedArraySchemas,
  validateArtifactSchema,
} from "@swooper/mapgen-core/authoring/contracts";

/** Creates the closed shape shared by Morphology's ordered substrate vintages. */
export function createMorphologySubstrateSchema(description: string) {
  return Type.Object(
    {
      erodibilityK: TypedArraySchemas.f32({
        description: "Per-tile resistance proxy where larger values admit faster incision.",
      }),
      sedimentDepth: TypedArraySchemas.f32({
        description: "Per-tile loose-sediment depth available for erosion and deposition.",
      }),
    },
    { additionalProperties: false, description }
  );
}

/** Validates one substrate vintage against its schema and exact map cardinality. */
export function validateMorphologySubstrate(
  schema: TSchema,
  value: unknown,
  context?: ArtifactValidationContext
): readonly { message: string }[] {
  const issues = [...validateArtifactSchema(schema, value)];
  const size = artifactCellCount(context);
  if (value === null || typeof value !== "object") {
    return Object.freeze(issues);
  }
  const candidate = value as Record<string, unknown>;
  appendArtifactTypedArrayIssues(
    issues,
    "substrate.erodibilityK",
    candidate.erodibilityK,
    Float32Array,
    size
  );
  appendArtifactTypedArrayIssues(
    issues,
    "substrate.sedimentDepth",
    candidate.sedimentDepth,
    Float32Array,
    size
  );
  return Object.freeze(issues);
}
