import { Type, TypedArraySchemas, defineArtifact } from "@swooper/mapgen-core/authoring";

const NavigableRiverSignalStatusSchema = Type.Union(
  [
    Type.Literal("normal-signal"),
    Type.Literal("arid-low-signal"),
    Type.Literal("closed-basin-low-signal"),
    Type.Literal("terrain-constrained-low-signal"),
  ],
  {
    description:
      "Typed interpretation of why a map may legitimately project few navigable rivers, instead of silently treating low projection as either pass or failure.",
  }
);

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
    engineRiverType: TypedArraySchemas.i32({
      description:
        "Civ7 river type metadata readback per tile using the runtime's no-river sentinel.",
    }),
    engineIsRiverMask: TypedArraySchemas.u8({
      description: "Civ7 river metadata readback (1=any river type).",
    }),
    engineNavigableRiverMask: TypedArraySchemas.u8({
      description:
        "Civ7 navigable-river readback from river metadata/API; raw terrain row readback is terrainNavigableRiverMask.",
    }),
    engineMinorRiverMask: TypedArraySchemas.u8({
      description:
        "Civ7 minor-river metadata readback. This is readback-only until a stable minor-river authoring API exists.",
    }),
    terrainNavigableRiverMask: TypedArraySchemas.u8({
      description: "Raw TERRAIN_NAVIGABLE_RIVER terrain readback per tile.",
    }),
    rejectedNavigableRiverMask: TypedArraySchemas.u8({
      description:
        "MapGen-selected navigable-river tiles absent from raw TERRAIN_NAVIGABLE_RIVER terrain readback.",
    }),
    sinkMismatchCount: Type.Integer({
      minimum: 0,
      description:
        "Count of hydrography sink tiles that remained non-water in the engine snapshot after river projection.",
    }),
    riverMismatchCount: Type.Integer({
      minimum: 0,
      description:
        "Count of tiles where projected navigable-river terrain and raw engine terrain readback diverged.",
    }),
    selectedRiverRejectedCount: Type.Integer({
      minimum: 0,
      description:
        "Count of MapGen-selected navigable-river terrain tiles absent from raw engine terrain readback after validation.",
    }),
    extraEngineRiverCount: Type.Integer({
      minimum: 0,
      description:
        "Count of raw engine navigable-river terrain tiles that were not selected by MapGen's river projection policy.",
    }),
    engineRiverTileCount: Type.Integer({
      minimum: 0,
      description: "Count of tiles with any Civ7 river metadata after projection.",
    }),
    engineNavigableRiverTileCount: Type.Integer({
      minimum: 0,
      description: "Count of tiles with Civ7 navigable-river readback after projection.",
    }),
    engineMinorRiverTileCount: Type.Integer({
      minimum: 0,
      description: "Count of tiles with Civ7 minor-river metadata after projection.",
    }),
    terrainNavigableRiverTileCount: Type.Integer({
      minimum: 0,
      description: "Count of tiles whose terrain row is TERRAIN_NAVIGABLE_RIVER.",
    }),
    minorRiverStampingSupported: Type.Boolean({
      description:
        "Whether this adapter/runtime can author Civ7 minor-river metadata directly from MapGen intent.",
    }),
    minorRiverUnsupportedReason: Type.String({
      minLength: 1,
      description:
        "Human-readable boundary note when minor river stamping is not available on the adapter/runtime.",
    }),
  },
  {
    additionalProperties: false,
    description:
      "Observed map-rivers engine projection state, used to diagnose MapGen navigable-river terrain vs engine readback.",
  }
);

const MapRiversProjectedNavigableRiversArtifactSchema = Type.Object(
  {
    width: Type.Integer({ minimum: 1 }),
    height: Type.Integer({ minimum: 1 }),
    riverMask: TypedArraySchemas.u8({
      description:
        "MapGen-authored navigable-river terrain mask selected by the projection policy (1=navigable river terrain).",
    }),
    plannedMinorRiverMask: TypedArraySchemas.u8({
      description:
        "Hydrology-authored minor-river intent mask (riverClass=1). This is not promoted to navigable terrain.",
    }),
    plannedMajorRiverMask: TypedArraySchemas.u8({
      description:
        "Hydrology-authored major-river intent mask (RIVER_CLASS_MAJOR and higher), the only class eligible for navigable terrain projection.",
    }),
    selectedTileCount: Type.Integer({
      minimum: 0,
      description: "Count of MapGen-selected navigable-river terrain tiles.",
    }),
    eligibleTileCount: Type.Integer({
      minimum: 0,
      description: "Count of projectable Hydrology river tiles considered by the policy.",
    }),
    plannedMinorRiverTileCount: Type.Integer({
      minimum: 0,
      description: "Count of Hydrology minor-river intent tiles.",
    }),
    plannedMajorRiverTileCount: Type.Integer({
      minimum: 0,
      description: "Count of Hydrology major-river intent tiles.",
    }),
    candidateEndpointCount: Type.Integer({
      minimum: 0,
      description: "Count of river endpoints available for trunk selection.",
    }),
    selectedChainCount: Type.Integer({
      minimum: 0,
      description: "Count of selected navigable-river chains.",
    }),
    selectedChainLengths: TypedArraySchemas.u16({
      description:
        "Length in tiles of each selected navigable-river chain, ordered by endpoint selection priority.",
    }),
    longestSelectedChainLength: Type.Integer({
      minimum: 0,
      description: "Length in tiles of the longest selected navigable-river chain.",
    }),
    meanSelectedChainLength: Type.Number({
      minimum: 0,
      description: "Mean selected navigable-river chain length in tiles.",
    }),
    targetTileCount: Type.Integer({
      minimum: 0,
      description: "Policy target count for navigable-river terrain tiles.",
    }),
    targetMajorTileFraction: Type.Number({
      minimum: 0,
      maximum: 1,
      description: "Requested share of eligible major-river tiles to preserve as navigable terrain.",
    }),
    selectedEndpointDischargeFloor: Type.Number({
      minimum: 0,
      description: "Discharge floor imposed on candidate major-river endpoints for this selection run.",
    }),
    nonProjectableMajorTileCount: Type.Integer({
      minimum: 0,
      description:
        "Count of Hydrology major-river intent tiles blocked from navigable projection by engine terrain/materialization constraints.",
    }),
    unselectedEligibleMajorTileCount: Type.Integer({
      minimum: 0,
      description:
        "Count of eligible major-river truth tiles not selected into the navigable subset.",
    }),
    selectedEligibleMajorTileFraction: Type.Number({
      minimum: 0,
      maximum: 1,
      description: "Share of eligible major-river truth tiles selected as navigable terrain.",
    }),
    majorDurableTileCount: Type.Integer({
      minimum: 0,
      description:
        "Count of planned major-river truth tiles with at least intermittent flow permanence in Hydrology metrics.",
    }),
    majorPerennialTileCount: Type.Integer({
      minimum: 0,
      description:
        "Count of planned major-river truth tiles with perennial flow permanence in Hydrology metrics.",
    }),
    majorClosedBasinTileCount: Type.Integer({
      minimum: 0,
      description:
        "Count of planned major-river truth tiles whose Hydrology mouth classification is closed-basin.",
    }),
    majorOceanMouthTileCount: Type.Integer({
      minimum: 0,
      description:
        "Count of planned major-river truth tiles whose Hydrology mouth classification reaches ocean or spill-path ocean/lake exits.",
    }),
    projectionSignalStatus: NavigableRiverSignalStatusSchema,
    projectionSignalReason: Type.String({
      minLength: 1,
      description:
        "Human-readable explanation for the current navigable-river signal classification.",
    }),
  },
  {
    additionalProperties: false,
    description:
      "MapGen-authored navigable river projection. Downstream ecology consumes this policy artifact; engine readback remains diagnostic.",
  }
);

export const mapRiversArtifacts = {
  projectedNavigableRivers: defineArtifact({
    name: "projectedNavigableRivers",
    id: "artifact:map.rivers.projectedNavigableRivers",
    schema: MapRiversProjectedNavigableRiversArtifactSchema,
  }),
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
