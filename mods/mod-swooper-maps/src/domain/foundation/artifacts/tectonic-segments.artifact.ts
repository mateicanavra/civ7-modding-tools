import type { Static } from "@swooper/mapgen-core/authoring/contracts";
import { defineArtifact, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import { Value } from "typebox/value";

export const Schema = Type.Object(
  {
    segmentCount: Type.Integer({ minimum: 0 }),
    aCell: TypedArraySchemas.i32({ shape: null, description: "Mesh cell A per boundary segment." }),
    bCell: TypedArraySchemas.i32({ shape: null, description: "Mesh cell B per boundary segment." }),
    plateA: TypedArraySchemas.i16({ shape: null, description: "Plate id for cell A per segment." }),
    plateB: TypedArraySchemas.i16({ shape: null, description: "Plate id for cell B per segment." }),
    regime: TypedArraySchemas.u8({
      shape: null,
      description: "Boundary regime per segment (0=none, 1=convergent, 2=divergent, 3=transform).",
    }),
    polarity: TypedArraySchemas.i8({
      shape: null,
      description:
        "Polarity for convergent segments (-1=plateA subducts, +1=plateB subducts, 0=unknown/non-convergent).",
    }),
    compression: TypedArraySchemas.u8({
      shape: null,
      description: "Compression intensity per segment (0..255).",
    }),
    extension: TypedArraySchemas.u8({
      shape: null,
      description: "Extension intensity per segment (0..255).",
    }),
    shear: TypedArraySchemas.u8({
      shape: null,
      description: "Shear intensity per segment (0..255).",
    }),
    volcanism: TypedArraySchemas.u8({
      shape: null,
      description: "Volcanism potential per segment (0..255).",
    }),
    fracture: TypedArraySchemas.u8({
      shape: null,
      description: "Fracture potential per segment (0..255).",
    }),
    driftU: TypedArraySchemas.i8({
      shape: null,
      description:
        "Normalized drift direction U per segment (-127..127), used for pseudo-evolution across eras.",
    }),
    driftV: TypedArraySchemas.i8({
      shape: null,
      description:
        "Normalized drift direction V per segment (-127..127), used for pseudo-evolution across eras.",
    }),
  },
  { additionalProperties: false }
);

export type Artifact = Static<typeof Schema>;

export const artifact = defineArtifact({
  name: "foundationTectonicSegments",
  id: "artifact:foundation.tectonicSegments",
  schema: Schema,
});

type TypedArrayCtor =
  | Int32ArrayConstructor
  | Int16ArrayConstructor
  | Int8ArrayConstructor
  | Uint8ArrayConstructor;

function issue(message: string): { message: string } {
  return { message };
}

function typedArrayIssue(
  value: unknown,
  ctor: TypedArrayCtor,
  key: string,
  length: number
): { message: string } | null {
  if (!(value instanceof ctor)) return issue(`${key} must be ${ctor.name}`);
  if (value.length !== length) return issue(`${key} length must match segmentCount`);
  return null;
}

export function validate(value: unknown): readonly { message: string }[] {
  const issues = Array.from(Value.Errors(Schema, value), (error) =>
    issue(
      `${(error as { path?: string; instancePath?: string }).path ?? (error as { instancePath?: string }).instancePath ?? "/"} ${error.message}`
    )
  );

  if (value && typeof value === "object") {
    const segments = value as Record<string, unknown>;
    const segmentCount = Number.isInteger(segments.segmentCount)
      ? (segments.segmentCount as number)
      : -1;
    if (segmentCount < 0) issues.push(issue("segmentCount must be a nonnegative integer"));

    for (const candidate of [
      typedArrayIssue(segments.aCell, Int32Array, "aCell", segmentCount),
      typedArrayIssue(segments.bCell, Int32Array, "bCell", segmentCount),
      typedArrayIssue(segments.plateA, Int16Array, "plateA", segmentCount),
      typedArrayIssue(segments.plateB, Int16Array, "plateB", segmentCount),
      typedArrayIssue(segments.regime, Uint8Array, "regime", segmentCount),
      typedArrayIssue(segments.polarity, Int8Array, "polarity", segmentCount),
      typedArrayIssue(segments.compression, Uint8Array, "compression", segmentCount),
      typedArrayIssue(segments.extension, Uint8Array, "extension", segmentCount),
      typedArrayIssue(segments.shear, Uint8Array, "shear", segmentCount),
      typedArrayIssue(segments.volcanism, Uint8Array, "volcanism", segmentCount),
      typedArrayIssue(segments.fracture, Uint8Array, "fracture", segmentCount),
      typedArrayIssue(segments.driftU, Int8Array, "driftU", segmentCount),
      typedArrayIssue(segments.driftV, Int8Array, "driftV", segmentCount),
    ]) {
      if (candidate) issues.push(candidate);
    }
  }

  return Object.freeze(issues);
}
