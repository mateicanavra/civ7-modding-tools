import type { ArtifactValidationIssue, Static } from "@swooper/mapgen-core/authoring/contracts";
import {
  appendArtifactTypedArrayIssues,
  defineArtifact,
  Type,
  TypedArraySchemas,
} from "@swooper/mapgen-core/authoring/contracts";

/** Structural contract for mantle potential and its source fields. */
const Schema = Type.Object(
  {
    version: Type.Integer({ minimum: 1 }),
    cellCount: Type.Integer({ minimum: 1 }),
    potential: TypedArraySchemas.f32({ cardinality: null }),
    sourceCount: Type.Integer({ minimum: 0 }),
    sourceType: TypedArraySchemas.i8({ cardinality: null }),
    sourceCell: TypedArraySchemas.u32({ cardinality: null }),
    sourceAmplitude: TypedArraySchemas.f32({ cardinality: null }),
    sourceRadius: TypedArraySchemas.f32({ cardinality: null }),
  },
  { additionalProperties: false }
);

/** Mantle potential state published by Foundation. */
export type Artifact = Static<typeof Schema>;

/** Registers Foundation's mantle-potential artifact. */
export const artifact = defineArtifact({
  name: "foundationMantlePotential",
  id: "artifact:foundation.mantlePotential",
  schema: Schema,
  refine: validateLocal,
});

/** Validates exact potential/source constructors and their declared cardinalities. */
function validateLocal(value: unknown): readonly ArtifactValidationIssue[] {
  const mantle = value as Artifact;
  const cellCount = mantle.cellCount;
  const sourceCount = mantle.sourceCount;
  const issues: ArtifactValidationIssue[] = [];

  appendArtifactTypedArrayIssues(issues, "potential", mantle.potential, Float32Array, cellCount);
  appendArtifactTypedArrayIssues(issues, "sourceType", mantle.sourceType, Int8Array, sourceCount);
  appendArtifactTypedArrayIssues(issues, "sourceCell", mantle.sourceCell, Uint32Array, sourceCount);
  appendArtifactTypedArrayIssues(
    issues,
    "sourceAmplitude",
    mantle.sourceAmplitude,
    Float32Array,
    sourceCount
  );
  appendArtifactTypedArrayIssues(
    issues,
    "sourceRadius",
    mantle.sourceRadius,
    Float32Array,
    sourceCount
  );
  return issues;
}
