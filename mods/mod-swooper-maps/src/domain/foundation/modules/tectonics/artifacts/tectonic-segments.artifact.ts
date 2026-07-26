import type { ArtifactValidationIssue } from "@swooper/mapgen-core/authoring/contracts";
import {
  appendArtifactTypedArrayIssues,
  defineArtifact,
  Type,
  TypedArraySchemas,
} from "@swooper/mapgen-core/authoring/contracts";

type TectonicSegments = Readonly<{
  segmentCount: number;
  aCell: Int32Array;
  bCell: Int32Array;
  plateA: Int16Array;
  plateB: Int16Array;
  regime: Uint8Array;
  polarity: Int8Array;
  compression: Uint8Array;
  extension: Uint8Array;
  shear: Uint8Array;
  volcanism: Uint8Array;
  fracture: Uint8Array;
  driftU: Int8Array;
  driftV: Int8Array;
}>;

/** Registers Foundation's tectonic-segments artifact. */
export const artifact = defineArtifact({
  name: "foundationTectonicSegments",
  id: "artifact:foundation.tectonicSegments",
  schema: Type.Object(
    {
      segmentCount: Type.Integer({ minimum: 0 }),
      aCell: TypedArraySchemas.i32({ cardinality: "constructor-only" }),
      bCell: TypedArraySchemas.i32({ cardinality: "constructor-only" }),
      plateA: TypedArraySchemas.i16({ cardinality: "constructor-only" }),
      plateB: TypedArraySchemas.i16({ cardinality: "constructor-only" }),
      regime: TypedArraySchemas.u8({ cardinality: "constructor-only" }),
      polarity: TypedArraySchemas.i8({ cardinality: "constructor-only" }),
      compression: TypedArraySchemas.u8({ cardinality: "constructor-only" }),
      extension: TypedArraySchemas.u8({ cardinality: "constructor-only" }),
      shear: TypedArraySchemas.u8({ cardinality: "constructor-only" }),
      volcanism: TypedArraySchemas.u8({ cardinality: "constructor-only" }),
      fracture: TypedArraySchemas.u8({ cardinality: "constructor-only" }),
      driftU: TypedArraySchemas.i8({ cardinality: "constructor-only" }),
      driftV: TypedArraySchemas.i8({ cardinality: "constructor-only" }),
    },
    {
      additionalProperties: false,
      description: "Index-aligned classified plate-boundary segments and their signals.",
    }
  ),
  refine: (value): readonly ArtifactValidationIssue[] => {
    const segments = value as TectonicSegments;
    const issues: ArtifactValidationIssue[] = [];
    for (const key of ["aCell", "bCell"] as const) {
      appendArtifactTypedArrayIssues(issues, key, segments[key], Int32Array, segments.segmentCount);
    }
    for (const key of ["plateA", "plateB"] as const) {
      appendArtifactTypedArrayIssues(issues, key, segments[key], Int16Array, segments.segmentCount);
    }
    for (const key of ["polarity", "driftU", "driftV"] as const) {
      appendArtifactTypedArrayIssues(issues, key, segments[key], Int8Array, segments.segmentCount);
    }
    for (const key of [
      "regime",
      "compression",
      "extension",
      "shear",
      "volcanism",
      "fracture",
    ] as const) {
      appendArtifactTypedArrayIssues(issues, key, segments[key], Uint8Array, segments.segmentCount);
    }
    return issues;
  },
});
