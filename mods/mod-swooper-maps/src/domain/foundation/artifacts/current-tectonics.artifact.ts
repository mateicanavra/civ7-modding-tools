import type { ArtifactValidationIssue, Static } from "@swooper/mapgen-core/authoring/contracts";
import {
  appendArtifactTypedArrayIssues,
  defineArtifact,
  defineArtifactValidator,
  Type,
  TypedArraySchemas,
} from "@swooper/mapgen-core/authoring/contracts";

/** Structural contract for current per-cell tectonic signals. */
export const Schema = Type.Object(
  {
    boundaryType: TypedArraySchemas.u8({ cardinality: null }),
    upliftPotential: TypedArraySchemas.u8({ cardinality: null }),
    riftPotential: TypedArraySchemas.u8({ cardinality: null }),
    shearStress: TypedArraySchemas.u8({ cardinality: null }),
    volcanism: TypedArraySchemas.u8({ cardinality: null }),
    fracture: TypedArraySchemas.u8({ cardinality: null }),
    cumulativeUplift: TypedArraySchemas.u8({ cardinality: null }),
  },
  { additionalProperties: false }
);

/** Current tectonic signal fields published by Foundation. */
export type Artifact = Static<typeof Schema>;

/** Registers Foundation's current-tectonics artifact. */
export const artifact = defineArtifact({
  name: "foundationTectonics",
  id: "artifact:foundation.tectonics",
  schema: Schema,
});

function validateLocal(value: unknown): readonly ArtifactValidationIssue[] {
  const tectonics = value as Artifact;
  const arrays = Object.values(tectonics).filter(
    (candidate): candidate is Uint8Array => candidate instanceof Uint8Array
  );
  const length = arrays[0]?.length ?? 0;
  const issues: ArtifactValidationIssue[] = [];

  if (length <= 0) issues.push({ message: "current tectonics arrays must be nonempty" });
  for (const key of [
    "boundaryType",
    "upliftPotential",
    "riftPotential",
    "shearStress",
    "volcanism",
    "fracture",
    "cumulativeUplift",
  ] as const) {
    appendArtifactTypedArrayIssues(issues, key, tectonics[key], Uint8Array, length);
  }
  return issues;
}

/** Validates exact signal constructors, nonempty cardinality, and parallel lengths. */
export const validate = defineArtifactValidator(artifact, validateLocal);
