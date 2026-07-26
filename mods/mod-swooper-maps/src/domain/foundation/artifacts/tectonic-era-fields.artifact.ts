import type { ArtifactValidationIssue, Static } from "@swooper/mapgen-core/authoring/contracts";
import {
  appendArtifactTypedArrayIssues,
  defineArtifact,
  defineArtifactValidator,
  Type,
  TypedArraySchemas,
} from "@swooper/mapgen-core/authoring/contracts";

const EraFieldsSchema = Type.Object(
  {
    boundaryType: TypedArraySchemas.u8({ cardinality: null }),
    boundaryPolarity: TypedArraySchemas.i8({ cardinality: null }),
    boundaryIntensity: TypedArraySchemas.u8({ cardinality: null }),
    upliftPotential: TypedArraySchemas.u8({ cardinality: null }),
    collisionPotential: TypedArraySchemas.u8({ cardinality: null }),
    subductionPotential: TypedArraySchemas.u8({ cardinality: null }),
    riftPotential: TypedArraySchemas.u8({ cardinality: null }),
    shearStress: TypedArraySchemas.u8({ cardinality: null }),
    volcanism: TypedArraySchemas.u8({ cardinality: null }),
    fracture: TypedArraySchemas.u8({ cardinality: null }),
    riftOriginPlate: TypedArraySchemas.i16({ cardinality: null }),
    volcanismOriginPlate: TypedArraySchemas.i16({ cardinality: null }),
    volcanismEventType: TypedArraySchemas.u8({ cardinality: null }),
    boundaryDriftU: TypedArraySchemas.i8({ cardinality: null }),
    boundaryDriftV: TypedArraySchemas.i8({ cardinality: null }),
  },
  { additionalProperties: false }
);

/** Structural contract for per-era tectonic signal fields. */
export const Schema = Type.Array(EraFieldsSchema);

/** Tectonic signal fields ordered by era. */
export type Artifact = Static<typeof Schema>;

/** Registers Foundation's per-era tectonic-fields artifact. */
export const artifact = defineArtifact({
  name: "foundationTectonicEraFields",
  id: "artifact:foundation.tectonicEraFields",
  schema: Schema,
});

function validateLocal(value: unknown): readonly ArtifactValidationIssue[] {
  const eras = value as Artifact;
  const issues: ArtifactValidationIssue[] = [];

  eras.forEach((era, eraIndex) => {
    const arrays = Object.values(era).filter(
      (candidate): candidate is Uint8Array | Int8Array | Int16Array =>
        candidate instanceof Uint8Array ||
        candidate instanceof Int8Array ||
        candidate instanceof Int16Array
    );
    const length = arrays[0]?.length ?? 0;
    if (length <= 0) {
      issues.push({ message: `eraFields[${eraIndex}] arrays must be nonempty` });
    }

    for (const key of [
      "boundaryType",
      "boundaryIntensity",
      "upliftPotential",
      "collisionPotential",
      "subductionPotential",
      "riftPotential",
      "shearStress",
      "volcanism",
      "fracture",
      "volcanismEventType",
    ] as const) {
      appendArtifactTypedArrayIssues(issues, key, era[key], Uint8Array, length);
    }
    for (const key of ["boundaryPolarity", "boundaryDriftU", "boundaryDriftV"] as const) {
      appendArtifactTypedArrayIssues(issues, key, era[key], Int8Array, length);
    }
    for (const key of ["riftOriginPlate", "volcanismOriginPlate"] as const) {
      appendArtifactTypedArrayIssues(issues, key, era[key], Int16Array, length);
    }
  });
  return issues;
}

/** Validates exact per-era constructors, nonempty fields, and parallel cell cardinality. */
export const validate = defineArtifactValidator(artifact, validateLocal);
