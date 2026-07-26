import { defineArtifact, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import { MeshBoundingBoxSchema } from "../model/atoms/bounding-box.schema.js";

/** Registers Foundation's neighborhood-mesh artifact. */
export const artifact = defineArtifact({
  name: "foundationMesh",
  id: "artifact:foundation.mesh",
  schema: Type.Object(
    {
      cellCount: Type.Integer({ minimum: 1, description: "Number of cells in the mesh." }),
      wrapWidth: Type.Number({ description: "Periodic east-west span of the mesh." }),
      siteX: TypedArraySchemas.f32({ cardinality: ["cellCount"] }),
      siteY: TypedArraySchemas.f32({ cardinality: ["cellCount"] }),
      neighborsOffsets: TypedArraySchemas.i32({
        cardinality: { factors: ["cellCount"], addend: 1 },
      }),
      neighbors: TypedArraySchemas.i32({ cardinality: "constructor-only" }),
      areas: TypedArraySchemas.f32({ cardinality: ["cellCount"] }),
      bbox: MeshBoundingBoxSchema,
    },
    {
      additionalProperties: false,
      description: "Foundation's wrapped neighborhood mesh and cell topology.",
    }
  ),
  refine: (value, { issues }) => {
    if (value.wrapWidth <= 0) issues.add("wrapWidth must be finite and positive");
  },
});
