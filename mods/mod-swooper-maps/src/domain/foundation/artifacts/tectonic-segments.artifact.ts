import type { ArtifactValidationIssue, Static } from "@swooper/mapgen-core/authoring/contracts";
import {
  appendArtifactTypedArrayIssues,
  defineArtifact,
  defineArtifactValidator,
  Type,
  TypedArraySchemas,
} from "@swooper/mapgen-core/authoring/contracts";

/** Structural contract for plate-boundary segments and their parallel signal fields. */
export const Schema = Type.Object(
  {
    segmentCount: Type.Integer({ minimum: 0 }),
    aCell: TypedArraySchemas.i32({
      cardinality: null,
      description: "Mesh cell A per boundary segment.",
    }),
    bCell: TypedArraySchemas.i32({
      cardinality: null,
      description: "Mesh cell B per boundary segment.",
    }),
    plateA: TypedArraySchemas.i16({
      cardinality: null,
      description: "Plate id for cell A per segment.",
    }),
    plateB: TypedArraySchemas.i16({
      cardinality: null,
      description: "Plate id for cell B per segment.",
    }),
    regime: TypedArraySchemas.u8({
      cardinality: null,
      description: "Boundary regime per segment (0=none, 1=convergent, 2=divergent, 3=transform).",
    }),
    polarity: TypedArraySchemas.i8({
      cardinality: null,
      description:
        "Polarity for convergent segments (-1=plateA subducts, +1=plateB subducts, 0=unknown/non-convergent).",
    }),
    compression: TypedArraySchemas.u8({
      cardinality: null,
      description: "Compression intensity per segment (0..255).",
    }),
    extension: TypedArraySchemas.u8({
      cardinality: null,
      description: "Extension intensity per segment (0..255).",
    }),
    shear: TypedArraySchemas.u8({
      cardinality: null,
      description: "Shear intensity per segment (0..255).",
    }),
    volcanism: TypedArraySchemas.u8({
      cardinality: null,
      description: "Volcanism potential per segment (0..255).",
    }),
    fracture: TypedArraySchemas.u8({
      cardinality: null,
      description: "Fracture potential per segment (0..255).",
    }),
    driftU: TypedArraySchemas.i8({
      cardinality: null,
      description:
        "Normalized drift direction U per segment (-127..127), used for pseudo-evolution across eras.",
    }),
    driftV: TypedArraySchemas.i8({
      cardinality: null,
      description:
        "Normalized drift direction V per segment (-127..127), used for pseudo-evolution across eras.",
    }),
  },
  { additionalProperties: false }
);

/** Plate-boundary segment state published by Foundation. */
export type Artifact = Static<typeof Schema>;

/** Registers Foundation's tectonic-segments artifact. */
export const artifact = defineArtifact({
  name: "foundationTectonicSegments",
  id: "artifact:foundation.tectonicSegments",
  schema: Schema,
});

function validateLocal(value: unknown): readonly ArtifactValidationIssue[] {
  const segments = value as Artifact;
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
}

/** Validates exact segment-array constructors and segment-count cardinality. */
export const validate = defineArtifactValidator(artifact, validateLocal);
