import type { Static } from "@swooper/mapgen-core/authoring/contracts";
import { defineArtifact, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import { Value } from "typebox/value";

const EraFieldsSchema = Type.Object(
  {
    boundaryType: TypedArraySchemas.u8({ shape: null }),
    boundaryPolarity: TypedArraySchemas.i8({ shape: null }),
    boundaryIntensity: TypedArraySchemas.u8({ shape: null }),
    upliftPotential: TypedArraySchemas.u8({ shape: null }),
    collisionPotential: TypedArraySchemas.u8({ shape: null }),
    subductionPotential: TypedArraySchemas.u8({ shape: null }),
    riftPotential: TypedArraySchemas.u8({ shape: null }),
    shearStress: TypedArraySchemas.u8({ shape: null }),
    volcanism: TypedArraySchemas.u8({ shape: null }),
    fracture: TypedArraySchemas.u8({ shape: null }),
    riftOriginPlate: TypedArraySchemas.i16({ shape: null }),
    volcanismOriginPlate: TypedArraySchemas.i16({ shape: null }),
    volcanismEventType: TypedArraySchemas.u8({ shape: null }),
    boundaryDriftU: TypedArraySchemas.i8({ shape: null }),
    boundaryDriftV: TypedArraySchemas.i8({ shape: null }),
  },
  { additionalProperties: false }
);

export const Schema = Type.Array(EraFieldsSchema);

export type Artifact = Static<typeof Schema>;

export const artifact = defineArtifact({
  name: "foundationTectonicEraFields",
  id: "artifact:foundation.tectonicEraFields",
  schema: Schema,
});

type Ctor = Uint8ArrayConstructor | Int8ArrayConstructor | Int16ArrayConstructor;

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
  if (Array.isArray(value)) {
    value.forEach((rawEra, eraIndex) => {
      const era = rawEra as Record<string, unknown>;
      const arrays = Object.values(era ?? {}).filter(
        (candidate): candidate is { length: number } =>
          candidate instanceof Uint8Array ||
          candidate instanceof Int8Array ||
          candidate instanceof Int16Array
      );
      const length = arrays[0]?.length ?? 0;
      if (length <= 0) issues.push(issue(`eraFields[${eraIndex}] arrays must be nonempty`));
      for (const [field, ctor] of [
        ["boundaryType", Uint8Array],
        ["boundaryPolarity", Int8Array],
        ["boundaryIntensity", Uint8Array],
        ["upliftPotential", Uint8Array],
        ["collisionPotential", Uint8Array],
        ["subductionPotential", Uint8Array],
        ["riftPotential", Uint8Array],
        ["shearStress", Uint8Array],
        ["volcanism", Uint8Array],
        ["fracture", Uint8Array],
        ["riftOriginPlate", Int16Array],
        ["volcanismOriginPlate", Int16Array],
        ["volcanismEventType", Uint8Array],
        ["boundaryDriftU", Int8Array],
        ["boundaryDriftV", Int8Array],
      ] as const) {
        const candidate = typedArrayIssue(era?.[field], ctor, `${field}`, length);
        if (candidate) issues.push(candidate);
      }
    });
  }
  return Object.freeze(issues);
}
