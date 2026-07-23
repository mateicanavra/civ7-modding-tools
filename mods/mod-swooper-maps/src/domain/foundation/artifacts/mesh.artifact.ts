import type { ArtifactValidationIssue, Static } from "@swooper/mapgen-core/authoring/contracts";
import {
  appendArtifactTypedArrayIssues,
  defineArtifact,
  Type,
  TypedArraySchemas,
} from "@swooper/mapgen-core/authoring/contracts";

const BoundingBoxSchema = Type.Object(
  {
    xl: Type.Number(),
    xr: Type.Number(),
    yt: Type.Number(),
    yb: Type.Number(),
  },
  { additionalProperties: false }
);

/** Structural contract for the wrapped neighborhood mesh. */
const Schema = Type.Object(
  {
    cellCount: Type.Integer({ minimum: 1 }),
    wrapWidth: Type.Number(),
    siteX: TypedArraySchemas.f32({ cardinality: null }),
    siteY: TypedArraySchemas.f32({ cardinality: null }),
    neighborsOffsets: TypedArraySchemas.i32({ cardinality: null }),
    neighbors: TypedArraySchemas.i32({ cardinality: null }),
    areas: TypedArraySchemas.f32({ cardinality: null }),
    bbox: BoundingBoxSchema,
  },
  { additionalProperties: false }
);

/** Neighborhood mesh state published by Foundation. */
export type Artifact = Static<typeof Schema>;

/** Registers Foundation's neighborhood-mesh artifact. */
export const artifact = defineArtifact({
  name: "foundationMesh",
  id: "artifact:foundation.mesh",
  schema: Schema,
  refine: validateLocal,
});

/** Validates mesh-array constructors, cardinalities, and a finite positive wrap width. */
function validateLocal(value: unknown): readonly ArtifactValidationIssue[] {
  const mesh = value as Artifact;
  const cellCount = mesh.cellCount;
  const issues: ArtifactValidationIssue[] = [];

  if (mesh.wrapWidth <= 0) {
    issues.push({ message: "wrapWidth must be finite and positive" });
  }
  appendArtifactTypedArrayIssues(issues, "siteX", mesh.siteX, Float32Array, cellCount);
  appendArtifactTypedArrayIssues(issues, "siteY", mesh.siteY, Float32Array, cellCount);
  appendArtifactTypedArrayIssues(
    issues,
    "neighborsOffsets",
    mesh.neighborsOffsets,
    Int32Array,
    cellCount + 1
  );
  appendArtifactTypedArrayIssues(issues, "neighbors", mesh.neighbors, Int32Array);
  appendArtifactTypedArrayIssues(issues, "areas", mesh.areas, Float32Array, cellCount);
  return issues;
}
