import type { Static } from "@swooper/mapgen-core/authoring/contracts";
import { defineArtifact, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import { Value } from "typebox/value";

export const Schema = Type.Object(
  {
    version: Type.Integer({ minimum: 1 }),
    cellCount: Type.Integer({ minimum: 1 }),
    potential: TypedArraySchemas.f32({ shape: null }),
    sourceCount: Type.Integer({ minimum: 0 }),
    sourceType: TypedArraySchemas.i8({ shape: null }),
    sourceCell: TypedArraySchemas.u32({ shape: null }),
    sourceAmplitude: TypedArraySchemas.f32({ shape: null }),
    sourceRadius: TypedArraySchemas.f32({ shape: null }),
  },
  { additionalProperties: false }
);

export type Artifact = Static<typeof Schema>;

export const artifact = defineArtifact({
  name: "foundationMantlePotential",
  id: "artifact:foundation.mantlePotential",
  schema: Schema,
});

type Ctor = Float32ArrayConstructor | Int8ArrayConstructor | Uint32ArrayConstructor;

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
    const mantle = value as Record<string, unknown>;
    const cellCount = Number.isInteger(mantle.cellCount) ? (mantle.cellCount as number) : 0;
    const sourceCount = Number.isInteger(mantle.sourceCount) ? (mantle.sourceCount as number) : -1;
    for (const candidate of [
      typedArrayIssue(mantle.potential, Float32Array, "potential", cellCount),
      typedArrayIssue(mantle.sourceType, Int8Array, "sourceType", sourceCount),
      typedArrayIssue(mantle.sourceCell, Uint32Array, "sourceCell", sourceCount),
      typedArrayIssue(mantle.sourceAmplitude, Float32Array, "sourceAmplitude", sourceCount),
      typedArrayIssue(mantle.sourceRadius, Float32Array, "sourceRadius", sourceCount),
    ]) {
      if (candidate) issues.push(candidate);
    }
  }
  return Object.freeze(issues);
}
