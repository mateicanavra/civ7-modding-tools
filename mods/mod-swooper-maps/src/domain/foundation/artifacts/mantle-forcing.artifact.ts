import type { Static } from "@swooper/mapgen-core/authoring/contracts";
import { defineArtifact, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import { Value } from "typebox/value";

export const Schema = Type.Object(
  {
    version: Type.Integer({ minimum: 1 }),
    cellCount: Type.Integer({ minimum: 1 }),
    stress: TypedArraySchemas.f32({ shape: null }),
    forcingU: TypedArraySchemas.f32({ shape: null }),
    forcingV: TypedArraySchemas.f32({ shape: null }),
    forcingMag: TypedArraySchemas.f32({ shape: null }),
    upwellingClass: TypedArraySchemas.i8({ shape: null }),
    divergence: TypedArraySchemas.f32({ shape: null }),
  },
  { additionalProperties: false }
);

export type Artifact = Static<typeof Schema>;

export const artifact = defineArtifact({
  name: "foundationMantleForcing",
  id: "artifact:foundation.mantleForcing",
  schema: Schema,
});

type Ctor = Float32ArrayConstructor | Int8ArrayConstructor;

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
    const forcing = value as Record<string, unknown>;
    const cellCount = Number.isInteger(forcing.cellCount) ? (forcing.cellCount as number) : 0;
    for (const candidate of [
      typedArrayIssue(forcing.stress, Float32Array, "stress", cellCount),
      typedArrayIssue(forcing.forcingU, Float32Array, "forcingU", cellCount),
      typedArrayIssue(forcing.forcingV, Float32Array, "forcingV", cellCount),
      typedArrayIssue(forcing.forcingMag, Float32Array, "forcingMag", cellCount),
      typedArrayIssue(forcing.upwellingClass, Int8Array, "upwellingClass", cellCount),
      typedArrayIssue(forcing.divergence, Float32Array, "divergence", cellCount),
    ]) {
      if (candidate) issues.push(candidate);
    }
  }
  return Object.freeze(issues);
}
