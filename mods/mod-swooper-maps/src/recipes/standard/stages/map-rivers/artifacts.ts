import { Type, TypedArraySchemas, defineArtifact } from "@swooper/mapgen-core/authoring";

const MapRiversEngineProjectionArtifactSchema = Type.Object(
  {
    width: Type.Integer({ minimum: 1 }),
    height: Type.Integer({ minimum: 1 }),
    lakeMask: TypedArraySchemas.u8({
      description:
        "Engine water mask observed during river projection (1=water after river modeling).",
    }),
    riverMask: TypedArraySchemas.u8({
      description:
        "Engine navigable-river terrain mask after map-rivers projection (1=navigable river terrain).",
    }),
    sinkMismatchCount: Type.Integer({
      minimum: 0,
      description:
        "Count of hydrography sink tiles that remained non-water in the engine snapshot after river projection.",
    }),
    riverMismatchCount: Type.Integer({
      minimum: 0,
      description:
        "Count of tiles where projected navigable-river terrain and engine readback diverged.",
    }),
    selectedRiverRejectedCount: Type.Integer({
      minimum: 0,
      description:
        "Count of MapGen-selected navigable-river terrain tiles that were not navigable rivers after engine validation.",
    }),
    extraEngineRiverCount: Type.Integer({
      minimum: 0,
      description:
        "Count of navigable-river terrain tiles present in engine readback that were not selected by MapGen's river projection policy.",
    }),
  },
  {
    additionalProperties: false,
    description:
      "Observed map-rivers engine projection state, used to diagnose MapGen navigable-river terrain vs engine readback.",
  }
);

export const mapRiversArtifacts = {
  /**
   * River readback is separate from lake readback because Civ7 models rivers
   * after elevation, while lakes are static water terrain before elevation.
   */
  engineProjectionRivers: defineArtifact({
    name: "engineProjectionRivers",
    id: "artifact:map.rivers.engineProjectionRivers",
    schema: MapRiversEngineProjectionArtifactSchema,
  }),
  /**
   * The post-river terrain snapshot is owned by map-rivers because river
   * modeling and validation are the last engine terrain mutation before ecology
   * and placement consume final topology.
   */
  riversEngineTerrainSnapshot: defineArtifact({
    name: "riversEngineTerrainSnapshot",
    id: "artifact:map.riversEngineTerrainSnapshot",
    schema: Type.Object(
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
    ),
  }),
} as const;
