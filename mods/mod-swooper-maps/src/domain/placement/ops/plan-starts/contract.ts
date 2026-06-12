import { Type, TypedArraySchemas, defineOp } from "@swooper/mapgen-core/authoring";

const StartsConfigSchema = Type.Object(
  {
    playersLandmass1: Type.Number({
      description: "Player count allocated to the primary landmass band.",
    }),
    playersLandmass2: Type.Number({
      description: "Player count allocated to the secondary landmass band (if present).",
    }),
    startSectorRows: Type.Number({
      description: "Number of sector rows used when partitioning the map for starts.",
    }),
    startSectorCols: Type.Number({
      description: "Number of sector columns used when partitioning the map for starts.",
    }),
    startSectors: Type.Array(Type.Unknown(), {
      default: [],
      description: "Explicit start sector descriptors passed directly to placement logic.",
    }),
  },
  {
    description: "Start placement inputs supplied by runtime + authored overrides.",
  }
);

const StartsOverrideSchema = Type.Partial(StartsConfigSchema);

const StartCandidateTierSchema = Type.Union([
  Type.Literal("primary"),
  Type.Literal("islandCluster"),
  Type.Literal("marginal"),
]);

const StartRejectionReasonSchema = Type.Union([
  Type.Literal("water"),
  Type.Literal("lake"),
  Type.Literal("mountain"),
  Type.Literal("volcano"),
  Type.Literal("natural-wonder"),
  Type.Literal("single-tile-island"),
  Type.Literal("insufficient-landmass"),
  Type.Literal("insufficient-expansion"),
  Type.Literal("insufficient-island-cluster"),
]);

/**
 * Plans first-age viable start candidates from runtime player allocation,
 * authored viability policy, and physical placement fields.
 */
const PlanStartsContract = defineOp({
  kind: "plan",
  id: "placement/plan-starts",
  input: Type.Object({
    baseStarts: StartsConfigSchema,
    width: Type.Optional(Type.Integer({ minimum: 1 })),
    height: Type.Optional(Type.Integer({ minimum: 1 })),
    landMask: Type.Optional(
      TypedArraySchemas.u8({ description: "Land mask per tile (1=land,0=water)." })
    ),
    slotByTile: Type.Optional(
      TypedArraySchemas.u8({
        description: "Requested landmass slot by tile (0=none,1=west,2=east).",
      })
    ),
    landmassIdByTile: Type.Optional(
      TypedArraySchemas.i32({
        description: "Per-tile connected landmass id (-1 for water).",
      })
    ),
    landmassTileCounts: Type.Optional(
      Type.Array(Type.Integer({ minimum: 0 }), {
        description: "Tile counts indexed by landmass id.",
      })
    ),
    coastalLand: Type.Optional(
      TypedArraySchemas.u8({ description: "Coastal land mask per tile (1=coastal land)." })
    ),
    distanceToCoast: Type.Optional(
      TypedArraySchemas.u16({
        description: "Minimum tile distance from each tile to the coastline.",
      })
    ),
    shelfMask: Type.Optional(
      TypedArraySchemas.u8({ description: "Shallow shelf water mask per tile." })
    ),
    elevation: Type.Optional(
      TypedArraySchemas.i16({ description: "Elevation per tile for roughness screening." })
    ),
    fertility: Type.Optional(
      TypedArraySchemas.f32({ description: "Pedology fertility field (0..1)." })
    ),
    effectiveMoisture: Type.Optional(
      TypedArraySchemas.f32({ description: "Ecology effective moisture field." })
    ),
    surfaceTemperature: Type.Optional(
      TypedArraySchemas.f32({ description: "Surface temperature per tile (C)." })
    ),
    aridityIndex: Type.Optional(
      TypedArraySchemas.f32({ description: "Aridity index per tile (0..1)." })
    ),
    riverClass: Type.Optional(
      TypedArraySchemas.u8({
        description: "Hydrology river class per tile (0=none,1=minor,2=major).",
      })
    ),
    lakeMask: Type.Optional(
      TypedArraySchemas.u8({ description: "Hydrology lake mask per tile." })
    ),
    mountainMask: Type.Optional(
      TypedArraySchemas.u8({
        description: "Morphology mountain terrain mask per tile (1=mountain); excludes candidates.",
      })
    ),
    volcanoMask: Type.Optional(
      TypedArraySchemas.u8({
        description: "Morphology volcano vent mask per tile (1=volcano); excludes candidates.",
      })
    ),
    naturalWonderPlotIndices: Type.Optional(
      Type.Array(Type.Integer({ minimum: 0 }), {
        description:
          "Plot indices occupied by placed natural wonders (anchor, observed, and footprint tiles); excluded from start candidacy.",
      })
    ),
    resourceSupport: Type.Optional(
      TypedArraySchemas.u8({
        description: "Per-tile nearby placed-resource support score (0..255).",
      })
    ),
    placedResourcePlotIndices: Type.Optional(
      Type.Array(Type.Integer({ minimum: 0 }), {
        description: "Placed resource plot indices used to derive nearby start support.",
      })
    ),
  }),
  output: Type.Object({
    playersLandmass1: Type.Number({
      description: "Player count allocated to the primary landmass band.",
    }),
    playersLandmass2: Type.Number({
      description: "Player count allocated to the secondary landmass band (if present).",
    }),
    startSectorRows: Type.Number({
      description: "Number of sector rows used when partitioning the map for starts.",
    }),
    startSectorCols: Type.Number({
      description: "Number of sector columns used when partitioning the map for starts.",
    }),
    startSectors: Type.Array(Type.Unknown(), {
      default: [],
      description: "Explicit start sector descriptors passed directly to placement logic.",
    }),
    minStartSpacingTiles: Type.Integer({
      minimum: 0,
      description: "Minimum odd-q spacing to enforce while enough viable candidates exist.",
    }),
    width: Type.Integer({ minimum: 0 }),
    height: Type.Integer({ minimum: 0 }),
    candidateCount: Type.Integer({ minimum: 0 }),
    rejectionCounts: Type.Array(
      Type.Object(
        {
          reason: StartRejectionReasonSchema,
          count: Type.Integer({ minimum: 0 }),
        },
        { additionalProperties: false }
      )
    ),
    tierCounts: Type.Object(
      {
        primary: Type.Integer({ minimum: 0 }),
        islandCluster: Type.Integer({ minimum: 0 }),
        marginal: Type.Integer({ minimum: 0 }),
      },
      { additionalProperties: false }
    ),
    scoreByTile: TypedArraySchemas.f32({
      description:
        "Per-tile start viability score (0..1). Non-candidates are zero; shown in Studio.",
    }),
    tierByTile: TypedArraySchemas.u8({
      description: "Per-tile start tier (0=none,1=rejected,2=marginal,3=island,4=primary).",
    }),
    candidates: Type.Array(
      Type.Object(
        {
          plotIndex: Type.Integer({ minimum: 0 }),
          regionSlot: Type.Integer({ minimum: 1, maximum: 2 }),
          tier: StartCandidateTierSchema,
          score: Type.Number({ minimum: 0, maximum: 1 }),
          landmassTiles: Type.Integer({ minimum: 0 }),
          expansionLandTiles: Type.Integer({ minimum: 0 }),
          nearbyClusterLandTiles: Type.Integer({ minimum: 0 }),
          coastDistance: Type.Integer({ minimum: 0 }),
          freshwaterScore: Type.Number({ minimum: 0, maximum: 1 }),
          resourceSupportScore: Type.Number({ minimum: 0, maximum: 1 }),
          roughnessPenalty: Type.Number({ minimum: 0, maximum: 1 }),
        },
        { additionalProperties: false }
      )
    ),
  }),
  strategies: {
    default: Type.Object({
      overrides: Type.Optional(StartsOverrideSchema),
      minContiguousLandTiles: Type.Integer({
        minimum: 1,
        maximum: 400,
        default: 24,
        description:
          "Minimum connected landmass size for a normal first-age start candidate.",
      }),
      expansionRadiusTiles: Type.Integer({
        minimum: 1,
        maximum: 8,
        default: 4,
        description: "Radius used to measure immediate land expansion around a candidate.",
      }),
      minExpansionLandTiles: Type.Integer({
        minimum: 1,
        maximum: 120,
        default: 14,
        description: "Minimum same-landmass land tiles inside the expansion radius.",
      }),
      islandClusterRadiusTiles: Type.Integer({
        minimum: 1,
        maximum: 10,
        default: 5,
        description:
          "Radius used to evaluate nearby expansion land for intentional island starts.",
      }),
      minIslandClusterLandTiles: Type.Integer({
        minimum: 1,
        maximum: 160,
        default: 18,
        description:
          "Minimum nearby land across small islands for an intentional archipelago start.",
      }),
      maxIslandStartCoastDistance: Type.Integer({
        minimum: 0,
        maximum: 8,
        default: 1,
        description:
          "Maximum coast distance for small-island starts; keeps island starts connected to water gameplay.",
      }),
      minStartSpacingTiles: Type.Integer({
        minimum: 0,
        maximum: 24,
        default: 9,
        description: "Minimum odd-q spacing between starts before relaxation is allowed.",
      }),
      fertilityWeight: Type.Number({
        minimum: 0,
        maximum: 4,
        default: 1.2,
        description: "Weight for local fertility in start score.",
      }),
      resourceSupportWeight: Type.Number({
        minimum: 0,
        maximum: 4,
        default: 1,
        description: "Weight for nearby placed-resource support in start score.",
      }),
      resourceSupportRadiusTiles: Type.Integer({
        minimum: 0,
        maximum: 8,
        default: 4,
        description: "Radius used to count nearby placed-resource support for starts.",
      }),
      freshwaterWeight: Type.Number({
        minimum: 0,
        maximum: 4,
        default: 0.9,
        description: "Weight for river/lake adjacency support in start score.",
      }),
      largeLandmassWeight: Type.Number({
        minimum: 0,
        maximum: 4,
        default: 1,
        description: "Weight for contiguous-land and expansion envelope support.",
      }),
      roughnessPenaltyWeight: Type.Number({
        minimum: 0,
        maximum: 4,
        default: 0.6,
        description: "Penalty weight for locally rugged starts.",
      }),
    }),
  },
});

export default PlanStartsContract;
