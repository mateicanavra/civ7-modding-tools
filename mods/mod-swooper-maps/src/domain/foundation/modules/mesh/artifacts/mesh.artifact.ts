import type { ArtifactValidationIssue } from "@swooper/mapgen-core/authoring/contracts";
import {
  appendArtifactTypedArrayIssues,
  defineArtifact,
  Type,
  TypedArraySchemas,
} from "@swooper/mapgen-core/authoring/contracts";
import { MeshBoundingBoxSchema } from "../model/atoms/bounding-box.schema.js";

type Mesh = Readonly<{
  cellCount: number;
  wrapWidth: number;
  siteX: Float32Array;
  siteY: Float32Array;
  neighborsOffsets: Int32Array;
  neighbors: Int32Array;
  areas: Float32Array;
}>;

/** Registers Foundation's neighborhood-mesh artifact. */
export const artifact = defineArtifact({
  name: "foundationMesh",
  id: "artifact:foundation.mesh",
  schema: Type.Object(
    {
      cellCount: Type.Integer({ minimum: 1, description: "Number of cells in the mesh." }),
      wrapWidth: Type.Number({ description: "Periodic east-west span of the mesh." }),
      siteX: TypedArraySchemas.f32({ cardinality: null }),
      siteY: TypedArraySchemas.f32({ cardinality: null }),
      neighborsOffsets: TypedArraySchemas.i32({ cardinality: null }),
      neighbors: TypedArraySchemas.i32({ cardinality: null }),
      areas: TypedArraySchemas.f32({ cardinality: null }),
      bbox: MeshBoundingBoxSchema,
    },
    {
      additionalProperties: false,
      description: "Foundation's wrapped neighborhood mesh and cell topology.",
    }
  ),
  refine: (value): readonly ArtifactValidationIssue[] => {
    const mesh = value as Mesh;
    const cellCount = mesh.cellCount;
    const issues: ArtifactValidationIssue[] = [];
    if (mesh.wrapWidth <= 0) issues.push({ message: "wrapWidth must be finite and positive" });
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
  },
});
