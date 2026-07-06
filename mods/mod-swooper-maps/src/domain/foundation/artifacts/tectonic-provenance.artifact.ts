import type { Static } from "@swooper/mapgen-core/authoring/contracts";
import { defineArtifact, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import { Value } from "typebox/value";

const ScalarsSchema = Type.Object(
  {
    originEra: TypedArraySchemas.u8({ shape: null }),
    originPlateId: TypedArraySchemas.i16({ shape: null }),
    lastBoundaryEra: TypedArraySchemas.u8({ shape: null }),
    lastBoundaryType: TypedArraySchemas.u8({ shape: null }),
    lastBoundaryPolarity: TypedArraySchemas.i8({ shape: null }),
    lastBoundaryIntensity: TypedArraySchemas.u8({ shape: null }),
    crustAge: TypedArraySchemas.u8({ shape: null }),
  },
  { additionalProperties: false }
);

export const Schema = Type.Object(
  {
    version: Type.Integer({ minimum: 1 }),
    eraCount: Type.Integer({ minimum: 5, maximum: 8 }),
    cellCount: Type.Integer({ minimum: 1 }),
    tracerIndex: Type.Immutable(Type.Array(TypedArraySchemas.u32({ shape: null }))),
    provenance: ScalarsSchema,
  },
  { additionalProperties: false }
);

export type Artifact = Static<typeof Schema>;

export const artifact = defineArtifact({
  name: "foundationTectonicProvenance",
  id: "artifact:foundation.tectonicProvenance",
  schema: Schema,
});

type Ctor =
  | Uint8ArrayConstructor
  | Int8ArrayConstructor
  | Int16ArrayConstructor
  | Uint32ArrayConstructor;

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
    const provenance = value as Record<string, unknown>;
    const eraCount = Number.isInteger(provenance.eraCount) ? (provenance.eraCount as number) : 0;
    const cellCount = Number.isInteger(provenance.cellCount) ? (provenance.cellCount as number) : 0;
    if (!Array.isArray(provenance.tracerIndex) || provenance.tracerIndex.length !== eraCount) {
      issues.push(issue("tracerIndex length must match eraCount"));
    } else {
      provenance.tracerIndex.forEach((arr, eraIndex) => {
        const candidate = typedArrayIssue(arr, Uint32Array, `tracerIndex[${eraIndex}]`, cellCount);
        if (candidate) issues.push(candidate);
      });
    }
    const scalars = provenance.provenance as Record<string, unknown> | undefined;
    if (!scalars || typeof scalars !== "object") {
      issues.push(issue("provenance scalars must be an object"));
    } else {
      for (const candidate of [
        typedArrayIssue(scalars.originEra, Uint8Array, "originEra", cellCount),
        typedArrayIssue(scalars.originPlateId, Int16Array, "originPlateId", cellCount),
        typedArrayIssue(scalars.lastBoundaryEra, Uint8Array, "lastBoundaryEra", cellCount),
        typedArrayIssue(scalars.lastBoundaryType, Uint8Array, "lastBoundaryType", cellCount),
        typedArrayIssue(scalars.lastBoundaryPolarity, Int8Array, "lastBoundaryPolarity", cellCount),
        typedArrayIssue(
          scalars.lastBoundaryIntensity,
          Uint8Array,
          "lastBoundaryIntensity",
          cellCount
        ),
        typedArrayIssue(scalars.crustAge, Uint8Array, "crustAge", cellCount),
      ]) {
        if (candidate) issues.push(candidate);
      }
    }
  }
  return Object.freeze(issues);
}
