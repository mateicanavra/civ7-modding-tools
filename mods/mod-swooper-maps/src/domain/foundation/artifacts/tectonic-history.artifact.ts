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
    upliftPotential: TypedArraySchemas.u8({ cardinality: null }),
    collisionPotential: TypedArraySchemas.u8({ cardinality: null }),
    subductionPotential: TypedArraySchemas.u8({ cardinality: null }),
    riftPotential: TypedArraySchemas.u8({ cardinality: null }),
    shearStress: TypedArraySchemas.u8({ cardinality: null }),
    volcanism: TypedArraySchemas.u8({ cardinality: null }),
    fracture: TypedArraySchemas.u8({ cardinality: null }),
  },
  { additionalProperties: false }
);

/** Structural contract for tectonic fields, membership, and rollups across eras. */
export const Schema = Type.Object(
  {
    eraCount: Type.Integer({ minimum: 5, maximum: 8 }),
    eras: Type.Immutable(Type.Array(EraFieldsSchema)),
    plateIdByEra: Type.Immutable(Type.Array(TypedArraySchemas.i16({ cardinality: null }))),
    upliftTotal: TypedArraySchemas.u8({ cardinality: null }),
    collisionTotal: TypedArraySchemas.u8({ cardinality: null }),
    subductionTotal: TypedArraySchemas.u8({ cardinality: null }),
    fractureTotal: TypedArraySchemas.u8({ cardinality: null }),
    volcanismTotal: TypedArraySchemas.u8({ cardinality: null }),
    upliftRecentFraction: TypedArraySchemas.u8({ cardinality: null }),
    collisionRecentFraction: TypedArraySchemas.u8({ cardinality: null }),
    subductionRecentFraction: TypedArraySchemas.u8({ cardinality: null }),
    lastActiveEra: TypedArraySchemas.u8({ cardinality: null }),
    lastCollisionEra: TypedArraySchemas.u8({ cardinality: null }),
    lastSubductionEra: TypedArraySchemas.u8({ cardinality: null }),
  },
  { additionalProperties: false }
);

/** Multi-era tectonic history published by Foundation. */
export type Artifact = Static<typeof Schema>;

/** Registers Foundation's tectonic-history artifact. */
export const artifact = defineArtifact({
  name: "foundationTectonicHistory",
  id: "artifact:foundation.tectonicHistory",
  schema: Schema,
});

function validateLocal(value: unknown): readonly ArtifactValidationIssue[] {
  const history = value as Artifact;
  const issues: ArtifactValidationIssue[] = [];

  if (history.eras.length !== history.eraCount) {
    issues.push({ message: "eras length must match eraCount" });
  }
  if (history.plateIdByEra.length !== history.eraCount) {
    issues.push({ message: "plateIdByEra length must match eraCount" });
  }

  const totals = [
    history.upliftTotal,
    history.collisionTotal,
    history.subductionTotal,
    history.fractureTotal,
    history.volcanismTotal,
    history.upliftRecentFraction,
    history.collisionRecentFraction,
    history.subductionRecentFraction,
    history.lastActiveEra,
    history.lastCollisionEra,
    history.lastSubductionEra,
  ].filter((candidate): candidate is Uint8Array => candidate instanceof Uint8Array);
  const cellCount = totals[0]?.length ?? 0;
  if (cellCount <= 0) {
    issues.push({ message: "tectonicHistory arrays must be nonempty" });
  }

  for (const key of [
    "upliftTotal",
    "collisionTotal",
    "subductionTotal",
    "fractureTotal",
    "volcanismTotal",
    "upliftRecentFraction",
    "collisionRecentFraction",
    "subductionRecentFraction",
    "lastActiveEra",
    "lastCollisionEra",
    "lastSubductionEra",
  ] as const) {
    appendArtifactTypedArrayIssues(issues, key, history[key], Uint8Array, cellCount);
  }
  history.eras.forEach((era, eraIndex) => {
    for (const key of [
      "boundaryType",
      "upliftPotential",
      "collisionPotential",
      "subductionPotential",
      "riftPotential",
      "shearStress",
      "volcanism",
      "fracture",
    ] as const) {
      appendArtifactTypedArrayIssues(
        issues,
        `eras[${eraIndex}].${key}`,
        era[key],
        Uint8Array,
        cellCount
      );
    }
  });
  history.plateIdByEra.forEach((era, eraIndex) => {
    appendArtifactTypedArrayIssues(issues, `plateIdByEra[${eraIndex}]`, era, Int16Array, cellCount);
  });
  return issues;
}

/** Validates era and cell cardinalities plus every history field's exact constructor. */
export const validate = defineArtifactValidator(artifact, validateLocal);
