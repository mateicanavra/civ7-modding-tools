import type { ArtifactValidationContext } from "@swooper/mapgen-core/authoring/contracts";
import {
  defineArtifact,
  Type,
  TypedArraySchemas,
  validateArtifactSchema,
} from "@swooper/mapgen-core/authoring/contracts";

const MorphologyTopographyArtifactSchema = Type.Object(
  {
    elevation: TypedArraySchemas.i16({
      description:
        "Signed elevation per tile (integer meters). Publish-once buffer handle; steps may mutate in-place via ctx.buffers.heightfield.",
    }),
    seaLevel: Type.Number({
      description:
        "Global sea level threshold in the same datum/units as elevation (meters; may be fractional).",
    }),
    landMask: TypedArraySchemas.u8({
      description:
        "Land/water mask per tile (1=land, 0=water). Must be consistent with elevation > seaLevel.",
    }),
    bathymetry: TypedArraySchemas.i16({
      description:
        "Derived bathymetry per tile (integer meters): 0 on land; <=0 in water; consistent with elevation/seaLevel.",
    }),
  },
  {
    additionalProperties: false,
    description: "Canonical Morphology topography truth (Phase 2 schema; publish-once handle).",
  }
);

export const Schema = MorphologyTopographyArtifactSchema;

export const artifact = defineArtifact({
  name: "topography",
  id: "artifact:morphology.topography",
  schema: Schema,
});

type ArtifactValidationIssue = Readonly<{ message: string }>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function expectedSize(dimensions: NonNullable<ArtifactValidationContext["dimensions"]>): number {
  return Math.max(0, (dimensions.width | 0) * (dimensions.height | 0));
}

function validateTypedArray(
  errors: ArtifactValidationIssue[],
  label: string,
  value: unknown,
  ctor: { new (...args: any[]): { length: number } },
  expectedLength?: number
): value is { length: number } {
  if (!(value instanceof ctor)) {
    errors.push({ message: `Expected ${label} to be ${ctor.name}.` });
    return false;
  }
  if (expectedLength != null && value.length !== expectedLength) {
    errors.push({
      message: `Expected ${label} length ${expectedLength} (received ${value.length}).`,
    });
  }
  return true;
}

function validatePayload(
  value: unknown,
  dimensions: NonNullable<ArtifactValidationContext["dimensions"]>
): ArtifactValidationIssue[] {
  const errors: ArtifactValidationIssue[] = [];
  if (!isRecord(value)) {
    errors.push({ message: "Missing heightfield buffer." });
    return errors;
  }
  const size = expectedSize(dimensions);
  const candidate = value as {
    elevation?: unknown;
    seaLevel?: unknown;
    landMask?: unknown;
    bathymetry?: unknown;
  };
  validateTypedArray(errors, "topography.elevation", candidate.elevation, Int16Array, size);
  if (typeof candidate.seaLevel !== "number" || !Number.isFinite(candidate.seaLevel)) {
    errors.push({ message: "Expected topography.seaLevel to be a finite number." });
  }
  validateTypedArray(errors, "topography.landMask", candidate.landMask, Uint8Array, size);
  validateTypedArray(errors, "topography.bathymetry", candidate.bathymetry, Int16Array, size);
  return errors;
}

export function validate(
  value: unknown,
  context?: ArtifactValidationContext
): readonly { message: string }[] {
  const schemaIssues = validateArtifactSchema(Schema, value);
  if (!context?.dimensions) return schemaIssues;
  return Object.freeze([...schemaIssues, ...validatePayload(value, context.dimensions)]);
}
