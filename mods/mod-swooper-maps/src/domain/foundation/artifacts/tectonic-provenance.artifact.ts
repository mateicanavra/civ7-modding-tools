import type { ArtifactValidationIssue, Static } from "@swooper/mapgen-core/authoring/contracts";
import {
  appendArtifactTypedArrayIssues,
  defineArtifact,
  defineArtifactValidator,
  Type,
  TypedArraySchemas,
} from "@swooper/mapgen-core/authoring/contracts";

const ScalarsSchema = Type.Object(
  {
    originEra: TypedArraySchemas.u8({ cardinality: null }),
    originPlateId: TypedArraySchemas.i16({ cardinality: null }),
    lastBoundaryEra: TypedArraySchemas.u8({ cardinality: null }),
    lastBoundaryType: TypedArraySchemas.u8({ cardinality: null }),
    lastBoundaryPolarity: TypedArraySchemas.i8({ cardinality: null }),
    lastBoundaryIntensity: TypedArraySchemas.u8({ cardinality: null }),
    crustAge: TypedArraySchemas.u8({ cardinality: null }),
  },
  { additionalProperties: false }
);

/** Structural contract for tracer history and per-cell tectonic provenance. */
export const Schema = Type.Object(
  {
    version: Type.Integer({ minimum: 1 }),
    eraCount: Type.Integer({ minimum: 5, maximum: 8 }),
    cellCount: Type.Integer({ minimum: 1 }),
    tracerIndex: Type.Immutable(Type.Array(TypedArraySchemas.u32({ cardinality: null }))),
    provenance: ScalarsSchema,
  },
  { additionalProperties: false }
);

/** Tectonic provenance state published by Foundation. */
export type Artifact = Static<typeof Schema>;

/** Registers Foundation's tectonic-provenance artifact. */
export const artifact = defineArtifact({
  name: "foundationTectonicProvenance",
  id: "artifact:foundation.tectonicProvenance",
  schema: Schema,
});

function validateLocal(value: unknown): readonly ArtifactValidationIssue[] {
  const artifactValue = value as Artifact;
  const issues: ArtifactValidationIssue[] = [];

  if (artifactValue.tracerIndex.length !== artifactValue.eraCount) {
    issues.push({ message: "tracerIndex length must match eraCount" });
  }
  artifactValue.tracerIndex.forEach((tracer, eraIndex) => {
    appendArtifactTypedArrayIssues(
      issues,
      `tracerIndex[${eraIndex}]`,
      tracer,
      Uint32Array,
      artifactValue.cellCount
    );
  });

  const provenance = artifactValue.provenance;
  appendArtifactTypedArrayIssues(
    issues,
    "originEra",
    provenance.originEra,
    Uint8Array,
    artifactValue.cellCount
  );
  appendArtifactTypedArrayIssues(
    issues,
    "originPlateId",
    provenance.originPlateId,
    Int16Array,
    artifactValue.cellCount
  );
  appendArtifactTypedArrayIssues(
    issues,
    "lastBoundaryEra",
    provenance.lastBoundaryEra,
    Uint8Array,
    artifactValue.cellCount
  );
  appendArtifactTypedArrayIssues(
    issues,
    "lastBoundaryType",
    provenance.lastBoundaryType,
    Uint8Array,
    artifactValue.cellCount
  );
  appendArtifactTypedArrayIssues(
    issues,
    "lastBoundaryPolarity",
    provenance.lastBoundaryPolarity,
    Int8Array,
    artifactValue.cellCount
  );
  appendArtifactTypedArrayIssues(
    issues,
    "lastBoundaryIntensity",
    provenance.lastBoundaryIntensity,
    Uint8Array,
    artifactValue.cellCount
  );
  appendArtifactTypedArrayIssues(
    issues,
    "crustAge",
    provenance.crustAge,
    Uint8Array,
    artifactValue.cellCount
  );
  return issues;
}

/** Validates tracer/scalar constructors and their era and cell cardinalities. */
export const validate = defineArtifactValidator(artifact, validateLocal);
