import type { ArtifactValidationIssue } from "@swooper/mapgen-core/authoring/contracts";
import {
  appendArtifactTypedArrayIssues,
  defineArtifact,
  Type,
  TypedArraySchemas,
} from "@swooper/mapgen-core/authoring/contracts";

type PlateMotion = Readonly<{
  cellCount: number;
  plateCount: number;
  plateCenterX: Float32Array;
  plateCenterY: Float32Array;
  plateVelocityX: Float32Array;
  plateVelocityY: Float32Array;
  plateOmega: Float32Array;
  plateFitRms: Float32Array;
  plateFitP90: Float32Array;
  plateQuality: Uint8Array;
  cellFitError: Uint8Array;
}>;

/** Registers Foundation's plate-motion artifact. */
export const artifact = defineArtifact({
  name: "foundationPlateMotion",
  id: "artifact:foundation.plateMotion",
  schema: Type.Object(
    {
      version: Type.Integer({ minimum: 1 }),
      cellCount: Type.Integer({ minimum: 1 }),
      plateCount: Type.Integer({ minimum: 1 }),
      plateCenterX: TypedArraySchemas.f32({ cardinality: "constructor-only" }),
      plateCenterY: TypedArraySchemas.f32({ cardinality: "constructor-only" }),
      plateVelocityX: TypedArraySchemas.f32({ cardinality: "constructor-only" }),
      plateVelocityY: TypedArraySchemas.f32({ cardinality: "constructor-only" }),
      plateOmega: TypedArraySchemas.f32({ cardinality: "constructor-only" }),
      plateFitRms: TypedArraySchemas.f32({ cardinality: "constructor-only" }),
      plateFitP90: TypedArraySchemas.f32({ cardinality: "constructor-only" }),
      plateQuality: TypedArraySchemas.u8({ cardinality: "constructor-only" }),
      cellFitError: TypedArraySchemas.u8({ cardinality: "constructor-only" }),
    },
    {
      additionalProperties: false,
      description: "Per-plate rigid motion and plate- and cell-level fit evidence.",
    }
  ),
  refine: (value): readonly ArtifactValidationIssue[] => {
    const motion = value as PlateMotion;
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
  },
});
