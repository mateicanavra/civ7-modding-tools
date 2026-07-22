import type { ArtifactValidationIssue, Static } from "@swooper/mapgen-core/authoring/contracts";
import {
  appendArtifactTypedArrayIssues,
  defineArtifact,
  defineArtifactValidator,
  Type,
  TypedArraySchemas,
} from "@swooper/mapgen-core/authoring/contracts";

/** Structural contract for plate-indexed motion and cell-fit fields. */
export const Schema = Type.Object(
  {
    version: Type.Integer({ minimum: 1 }),
    cellCount: Type.Integer({ minimum: 1 }),
    plateCount: Type.Integer({ minimum: 1 }),
    plateCenterX: TypedArraySchemas.f32({ cardinality: null }),
    plateCenterY: TypedArraySchemas.f32({ cardinality: null }),
    plateVelocityX: TypedArraySchemas.f32({ cardinality: null }),
    plateVelocityY: TypedArraySchemas.f32({ cardinality: null }),
    plateOmega: TypedArraySchemas.f32({ cardinality: null }),
    plateFitRms: TypedArraySchemas.f32({ cardinality: null }),
    plateFitP90: TypedArraySchemas.f32({ cardinality: null }),
    plateQuality: TypedArraySchemas.u8({ cardinality: null }),
    cellFitError: TypedArraySchemas.u8({ cardinality: null }),
  },
  { additionalProperties: false }
);

/** Plate motion state published by Foundation. */
export type Artifact = Static<typeof Schema>;

/** Registers Foundation's plate-motion artifact. */
export const artifact = defineArtifact({
  name: "foundationPlateMotion",
  id: "artifact:foundation.plateMotion",
  schema: Schema,
});

function validateLocal(value: unknown): readonly ArtifactValidationIssue[] {
  const motion = value as Artifact;
  const issues: ArtifactValidationIssue[] = [];

  for (const key of [
    "plateCenterX",
    "plateCenterY",
    "plateVelocityX",
    "plateVelocityY",
    "plateOmega",
    "plateFitRms",
    "plateFitP90",
  ] as const) {
    appendArtifactTypedArrayIssues(issues, key, motion[key], Float32Array, motion.plateCount);
  }
  appendArtifactTypedArrayIssues(
    issues,
    "plateQuality",
    motion.plateQuality,
    Uint8Array,
    motion.plateCount
  );
  appendArtifactTypedArrayIssues(
    issues,
    "cellFitError",
    motion.cellFitError,
    Uint8Array,
    motion.cellCount
  );
  return issues;
}

/** Validates exact motion-array constructors and plate/cell cardinalities. */
export const validate = defineArtifactValidator(artifact, validateLocal);
