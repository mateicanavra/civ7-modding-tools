import { defineArtifact, Type } from "@swooper/mapgen-core/authoring/contracts";

const ProjectionMetaArtifactSchema = Type.Object(
  {
    width: Type.Integer({ minimum: 1, description: "Map width in tiles." }),
    height: Type.Integer({ minimum: 1, description: "Map height in tiles." }),
    wrapX: Type.Literal(true, { description: "Civ7 topology lock: wrap X is always enabled." }),
    wrapY: Type.Literal(false, { description: "Civ7 topology lock: wrap Y is always disabled." }),
  },
  {
    additionalProperties: false,
    description:
      "Gameplay-owned projection metadata for interpreting tile-indexed rasters under Phase 2 topology locks.",
  }
);

export const Schema = ProjectionMetaArtifactSchema;

export const artifact = defineArtifact({
  name: "projectionMeta",
  id: "artifact:map.projectionMeta",
  schema: Schema,
});
