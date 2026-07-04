import type { Static } from "@swooper/mapgen-core/authoring/contracts";
import { defineArtifact, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import { Value } from "typebox/value";

export const Schema = Type.Object(
  {
    version: Type.Integer({ minimum: 1 }),
    cellCount: Type.Integer({ minimum: 1 }),
    plateCount: Type.Integer({ minimum: 1 }),
    plateCenterX: TypedArraySchemas.f32({ shape: null }),
    plateCenterY: TypedArraySchemas.f32({ shape: null }),
    plateVelocityX: TypedArraySchemas.f32({ shape: null }),
    plateVelocityY: TypedArraySchemas.f32({ shape: null }),
    plateOmega: TypedArraySchemas.f32({ shape: null }),
    plateFitRms: TypedArraySchemas.f32({ shape: null }),
    plateFitP90: TypedArraySchemas.f32({ shape: null }),
    plateQuality: TypedArraySchemas.u8({ shape: null }),
    cellFitError: TypedArraySchemas.u8({ shape: null }),
  },
  { additionalProperties: false }
);

export type Artifact = Static<typeof Schema>;

export const artifact = defineArtifact({
  name: "foundationPlateMotion",
  id: "artifact:foundation.plateMotion",
  schema: Schema,
});

type Ctor = Float32ArrayConstructor | Uint8ArrayConstructor;

function issue(message: string): { message: string } {
  return { message };
}

function typedArrayIssue(
  value: unknown,
  ctor: Ctor,
  key: string,
  length: number
): { message: string } | null {
  if (!(value instanceof ctor)) return issue(`${key} must be ${ctor.name}`);
  if (value.length !== length) return issue(`${key} length must be ${length}`);
  return null;
}

export function validate(value: unknown): readonly { message: string }[] {
  const issues = Array.from(Value.Errors(Schema, value), (error) =>
    issue(
      `${(error as { path?: string; instancePath?: string }).path ?? (error as { instancePath?: string }).instancePath ?? "/"} ${error.message}`
    )
  );
  if (value && typeof value === "object") {
    const motion = value as Record<string, unknown>;
    const cellCount = Number.isInteger(motion.cellCount) ? (motion.cellCount as number) : 0;
    const plateCount = Number.isInteger(motion.plateCount) ? (motion.plateCount as number) : 0;
    for (const candidate of [
      typedArrayIssue(motion.plateCenterX, Float32Array, "plateCenterX", plateCount),
      typedArrayIssue(motion.plateCenterY, Float32Array, "plateCenterY", plateCount),
      typedArrayIssue(motion.plateVelocityX, Float32Array, "plateVelocityX", plateCount),
      typedArrayIssue(motion.plateVelocityY, Float32Array, "plateVelocityY", plateCount),
      typedArrayIssue(motion.plateOmega, Float32Array, "plateOmega", plateCount),
      typedArrayIssue(motion.plateFitRms, Float32Array, "plateFitRms", plateCount),
      typedArrayIssue(motion.plateFitP90, Float32Array, "plateFitP90", plateCount),
      typedArrayIssue(motion.plateQuality, Uint8Array, "plateQuality", plateCount),
      typedArrayIssue(motion.cellFitError, Uint8Array, "cellFitError", cellCount),
    ]) {
      if (candidate) issues.push(candidate);
    }
  }
  return Object.freeze(issues);
}
