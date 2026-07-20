import type { ArtifactValidationContext, TSchema } from "@swooper/mapgen-core/authoring/contracts";
import {
  appendArtifactTypedArrayIssues,
  artifactCellCount,
  Type,
  TypedArraySchemas,
  validateArtifactSchema,
} from "@swooper/mapgen-core/authoring/contracts";

/** Creates the closed shape shared by Morphology's ordered topography vintages. */
export function createMorphologyTopographySchema(description: string) {
  return Type.Object(
    {
      elevation: TypedArraySchemas.i16({
        description: "Signed elevation in meters for every map tile.",
      }),
      seaLevel: Type.Number({
        description: "Global sea-level threshold in the same meter datum as elevation.",
      }),
      landMask: TypedArraySchemas.u8({
        description: "Per-tile land classification where 1 is land and 0 is water.",
      }),
      bathymetry: TypedArraySchemas.i16({
        description: "Per-tile water depth relative to sea level; land tiles contain 0.",
      }),
    },
    { additionalProperties: false, description }
  );
}

/** Validates one topography vintage against its schema and exact map cardinality. */
export function validateMorphologyTopography(
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
    "topography.elevation",
    candidate.elevation,
    Int16Array,
    size
  );
  appendArtifactTypedArrayIssues(
    issues,
    "topography.landMask",
    candidate.landMask,
    Uint8Array,
    size
  );
  appendArtifactTypedArrayIssues(
    issues,
    "topography.bathymetry",
    candidate.bathymetry,
    Int16Array,
    size
  );
  return Object.freeze(issues);
}
