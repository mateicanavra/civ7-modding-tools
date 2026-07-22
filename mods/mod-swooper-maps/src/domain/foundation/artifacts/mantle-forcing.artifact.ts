import type { ArtifactValidationIssue, Static } from "@swooper/mapgen-core/authoring/contracts";
import {
  appendArtifactTypedArrayIssues,
  defineArtifact,
  defineArtifactValidator,
  Type,
  TypedArraySchemas,
} from "@swooper/mapgen-core/authoring/contracts";

/** Structural contract for per-cell mantle forcing fields. */
export const Schema = Type.Object(
  {
    version: Type.Integer({ minimum: 1 }),
    cellCount: Type.Integer({ minimum: 1 }),
    stress: TypedArraySchemas.f32({ cardinality: null }),
    forcingU: TypedArraySchemas.f32({ cardinality: null }),
    forcingV: TypedArraySchemas.f32({ cardinality: null }),
    forcingMag: TypedArraySchemas.f32({ cardinality: null }),
    upwellingClass: TypedArraySchemas.i8({ cardinality: null }),
    divergence: TypedArraySchemas.f32({ cardinality: null }),
  },
  { additionalProperties: false }
);

/** Mantle forcing state published by Foundation. */
export type Artifact = Static<typeof Schema>;

/** Registers Foundation's mantle-forcing artifact. */
export const artifact = defineArtifact({
  name: "foundationMantleForcing",
  id: "artifact:foundation.mantleForcing",
  schema: Schema,
});

function validateLocal(value: unknown): readonly ArtifactValidationIssue[] {
  const forcing = value as Artifact;
  const cellCount = forcing.cellCount;
  const issues: ArtifactValidationIssue[] = [];

  appendArtifactTypedArrayIssues(issues, "stress", forcing.stress, Float32Array, cellCount);
  appendArtifactTypedArrayIssues(issues, "forcingU", forcing.forcingU, Float32Array, cellCount);
  appendArtifactTypedArrayIssues(issues, "forcingV", forcing.forcingV, Float32Array, cellCount);
  appendArtifactTypedArrayIssues(issues, "forcingMag", forcing.forcingMag, Float32Array, cellCount);
  appendArtifactTypedArrayIssues(
    issues,
    "upwellingClass",
    forcing.upwellingClass,
    Int8Array,
    cellCount
  );
  appendArtifactTypedArrayIssues(issues, "divergence", forcing.divergence, Float32Array, cellCount);
  return issues;
}

/** Validates exact forcing-array constructors and cell-count cardinality. */
export const validate = defineArtifactValidator(artifact, validateLocal);
