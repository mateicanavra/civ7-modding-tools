import type { ArtifactValidationIssue } from "@swooper/mapgen-core/authoring/contracts";
import {
  appendArtifactTypedArrayIssues,
  defineArtifact,
  Type,
  TypedArraySchemas,
} from "@swooper/mapgen-core/authoring/contracts";

type MantleForcing = Readonly<{
  cellCount: number;
  stress: Float32Array;
  forcingU: Float32Array;
  forcingV: Float32Array;
  forcingMag: Float32Array;
  upwellingClass: Int8Array;
  divergence: Float32Array;
}>;

/** Registers Foundation's mantle-forcing artifact. */
export const artifact = defineArtifact({
  name: "foundationMantleForcing",
  id: "artifact:foundation.mantleForcing",
  schema: Type.Object(
    {
      version: Type.Integer({ minimum: 1 }),
      cellCount: Type.Integer({ minimum: 1 }),
      stress: TypedArraySchemas.f32({ cardinality: "constructor-only" }),
      forcingU: TypedArraySchemas.f32({ cardinality: "constructor-only" }),
      forcingV: TypedArraySchemas.f32({ cardinality: "constructor-only" }),
      forcingMag: TypedArraySchemas.f32({ cardinality: "constructor-only" }),
      upwellingClass: TypedArraySchemas.i8({ cardinality: "constructor-only" }),
      divergence: TypedArraySchemas.f32({ cardinality: "constructor-only" }),
    },
    {
      additionalProperties: false,
      description: "Mantle velocity, stress, divergence, and vertical-motion signals by mesh cell.",
    }
  ),
  refine: (value): readonly ArtifactValidationIssue[] => {
    const forcing = value as MantleForcing;
    const cellCount = forcing.cellCount;
    const issues: ArtifactValidationIssue[] = [];
    appendArtifactTypedArrayIssues(issues, "stress", forcing.stress, Float32Array, cellCount);
    appendArtifactTypedArrayIssues(issues, "forcingU", forcing.forcingU, Float32Array, cellCount);
    appendArtifactTypedArrayIssues(issues, "forcingV", forcing.forcingV, Float32Array, cellCount);
    appendArtifactTypedArrayIssues(
      issues,
      "forcingMag",
      forcing.forcingMag,
      Float32Array,
      cellCount
    );
    appendArtifactTypedArrayIssues(
      issues,
      "upwellingClass",
      forcing.upwellingClass,
      Int8Array,
      cellCount
    );
    appendArtifactTypedArrayIssues(
      issues,
      "divergence",
      forcing.divergence,
      Float32Array,
      cellCount
    );
    return issues;
  },
});
