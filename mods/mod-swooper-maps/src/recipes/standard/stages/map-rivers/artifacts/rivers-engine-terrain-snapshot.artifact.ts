import { defineArtifact, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

export const Schema = Type.Object(
  {
    stage: Type.String({
      description: "Step identifier that produced this snapshot.",
    }),
    width: Type.Integer({ minimum: 1, description: "Map width in tiles." }),
    height: Type.Integer({ minimum: 1, description: "Map height in tiles." }),
    landMask: TypedArraySchemas.u8({
      description: "Engine-derived land mask after river projection (1=land, 0=water).",
    }),
    terrain: TypedArraySchemas.u8({
      description: "Engine-derived terrain type snapshot after river projection.",
    }),
    elevation: TypedArraySchemas.i16({
      description: "Engine-derived elevation snapshot after river projection.",
    }),
  },
  {
    additionalProperties: false,
    description: "Engine terrain snapshot captured at the map-rivers projection boundary.",
  }
);

/**
 * The post-river terrain snapshot is owned by map-rivers because river
 * modeling and validation are the last engine terrain mutation before ecology
 * and placement consume final topology.
 */
export const artifact = defineArtifact({
  name: "riversEngineTerrainSnapshot",
  id: "artifact:map.riversEngineTerrainSnapshot",
  schema: Schema,
});
