import {
  defineArtifact,
  defineArtifactValidator,
  Type,
} from "@swooper/mapgen-core/authoring/contracts";

/** Runtime contract locking map dimensions to Civ7's wrapping-X, bounded-Y topology. */
export const Schema = Type.Object(
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

/** Registers map dimensions and Civ7's cylindrical topology for tile-raster consumers. */
export const artifact = defineArtifact({
  name: "projectionMeta",
  id: "artifact:map.projectionMeta",
  schema: Schema,
});

/** Validate hook for the projection metadata artifact (topology locks). */

/** Requires positive dimensions with the topology lock `wrapX=true`, `wrapY=false`. */
export const validate = defineArtifactValidator(artifact);
