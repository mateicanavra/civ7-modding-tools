import type { Static } from "@swooper/mapgen-core/authoring/contracts";
import { defineArtifact, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import { Value } from "typebox/value";

export const Schema = Type.Object(
  {
    maturity: TypedArraySchemas.f32({ shape: null }),
    thickness: TypedArraySchemas.f32({ shape: null }),
    thermalAge: TypedArraySchemas.u8({ shape: null }),
    damage: TypedArraySchemas.u8({ shape: null }),
    type: TypedArraySchemas.u8({ shape: null }),
    age: TypedArraySchemas.u8({ shape: null }),
    buoyancy: TypedArraySchemas.f32({ shape: null }),
    baseElevation: TypedArraySchemas.f32({ shape: null }),
    strength: TypedArraySchemas.f32({ shape: null }),
  },
  { additionalProperties: false }
);

export type Artifact = Static<typeof Schema>;

export const artifact = defineArtifact({
  name: "foundationCrust",
  id: "artifact:foundation.crust",
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
  if (value.length !== length) return issue(`${key} length must match crust arrays`);
  return null;
}

export function validate(value: unknown): readonly { message: string }[] {
  const issues = Array.from(Value.Errors(Schema, value), (error) =>
    issue(
      `${(error as { path?: string; instancePath?: string }).path ?? (error as { instancePath?: string }).instancePath ?? "/"} ${error.message}`
    )
  );

  if (value && typeof value === "object") {
    const crust = value as Record<string, unknown>;
    const lengths = [
      crust.maturity,
      crust.thickness,
      crust.thermalAge,
      crust.damage,
      crust.type,
      crust.age,
      crust.buoyancy,
      crust.baseElevation,
      crust.strength,
    ].filter(
      (candidate): candidate is { length: number } =>
        candidate instanceof Float32Array || candidate instanceof Uint8Array
    );
    const length = lengths[0]?.length ?? 0;
    if (length <= 0) issues.push(issue("crust arrays must be nonempty"));
    for (const candidate of [
      typedArrayIssue(crust.maturity, Float32Array, "maturity", length),
      typedArrayIssue(crust.thickness, Float32Array, "thickness", length),
      typedArrayIssue(crust.thermalAge, Uint8Array, "thermalAge", length),
      typedArrayIssue(crust.damage, Uint8Array, "damage", length),
      typedArrayIssue(crust.type, Uint8Array, "type", length),
      typedArrayIssue(crust.age, Uint8Array, "age", length),
      typedArrayIssue(crust.buoyancy, Float32Array, "buoyancy", length),
      typedArrayIssue(crust.baseElevation, Float32Array, "baseElevation", length),
      typedArrayIssue(crust.strength, Float32Array, "strength", length),
    ]) {
      if (candidate) issues.push(candidate);
    }
  }

  return Object.freeze(issues);
}
