import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

const StartsBaseSchema = Type.Object(
  {
    playersLandmass1: Type.Integer({
      minimum: 0,
      maximum: 16,
      description:
        "West regional slot contribution to Civ7 map-size capacity; not a fixed final allocation.",
    }),
    playersLandmass2: Type.Integer({
      minimum: 0,
      maximum: 16,
      description:
        "East regional slot contribution to Civ7 map-size capacity; not a fixed final allocation.",
    }),
  },
  {
    description:
      "Regional slot contributions supplied by Civ7 map-size metadata. Their sum bounds admitted player demand; planning may reapportion admitted players across generated regions.",
  }
);

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

const StartSeatRungSchema = Type.Union(
  [
    Type.Literal("regional"),
    Type.Literal("open-pool"),
    Type.Literal("quality-relaxed"),
    Type.Literal("spacing-relaxed"),
  ],
  {
    description:
      "Fallback ladder rung that seated the player. Every rung is scored; non-regional rungs are degradations recorded per seat.",
  }
);

const StartComponentsSchema = Type.Object(
  {
    freshwater: Type.Number({ minimum: 0, maximum: 1 }),
    fertility: Type.Number({ minimum: 0, maximum: 1 }),
    expansion: Type.Number({ minimum: 0, maximum: 1 }),
    climate: Type.Number({ minimum: 0, maximum: 1 }),
    resource: Type.Number({ minimum: 0, maximum: 1 }),
    roughness: Type.Number({
      minimum: 0,
      maximum: 1,
      description: "Roughness penalty magnitude (0 = flat, 1 = max rugged).",
    }),
  },
  {
    additionalProperties: false,
    description: "Retained per-start component vector (target card A1).",
  }
);

const StartRecordSchema = Type.Object(
  {
    seatIndex: Type.Integer({ minimum: 0 }),
    playerId: Type.Integer({
      minimum: 0,
      description: "Engine player id stamped via setStartPosition.",
    }),
    playerIdSource: Type.Union([Type.Literal("alive-majors"), Type.Literal("slot-index")], {
      description:
        "Identity authority for this seat: an exact adapter-reported alive-major ID, or a slot-index fallback used only when the alive-major observation is empty.",
    }),
    regionSlot: Type.Integer({
      minimum: 1,
      maximum: 2,
      description:
        "Immutable requested homeland region for the seat (1=west, 2=east); fallback never rewrites it.",
    }),
    realizedRegionSlot: Type.Integer({
      minimum: 0,
      maximum: 2,
      description:
        "Terminal homeland region of the selected plot after fallback and fairness (1=west, 2=east); 0 only when unseated.",
    }),
    plotIndex: Type.Integer({
      minimum: -1,
      description: "Chosen start plot; -1 records an unseated player (degrade-as-data).",
    }),
    rung: StartSeatRungSchema,
    status: Type.Union([Type.Literal("full"), Type.Literal("degraded")]),
    tier: Type.Union([StartCandidateTierSchema, Type.Literal("none")], {
      description: "Viability tier of the chosen plot; 'none' for quality-relaxed seats.",
    }),
    score: Type.Number({
      minimum: 0,
      maximum: 1,
      description: "Published 0..1 viability score under fixed weight normalization.",
    }),
    components: StartComponentsSchema,
    achievedSpacing: Type.Integer({
      minimum: -1,
      description:
        "Min odd-q distance to any other seated start; -1 when not measurable (single seat or unseated).",
    }),
    imputedFlags: Type.Array(Type.String(), {
      description:
        "Components whose inputs were missing and neutral-imputed, plus seat-level degradations (e.g. spacing-below-floor, unseated). Never silently empty when imputation happened.",
    }),
  },
  { additionalProperties: false }
);

const FairnessRelaxationSchema = Type.Object(
  {
    seatIndex: Type.Integer({ minimum: 0 }),
    kind: Type.Union([Type.Literal("spacing"), Type.Literal("region"), Type.Literal("quality")]),
    from: Type.Number(),
    to: Type.Number(),
  },
  { additionalProperties: false }
);

const FairnessSwapSchema = Type.Object(
  {
    seatIndex: Type.Integer({ minimum: 0 }),
    fromPlotIndex: Type.Integer({ minimum: 0 }),
    toPlotIndex: Type.Integer({ minimum: 0 }),
    fromScore: Type.Number(),
    toScore: Type.Number(),
  },
  { additionalProperties: false }
);

const FairnessReportSchema = Type.Object(
  {
    tolerance: Type.Number({ minimum: 0 }),
    parity: Type.Array(Type.Number(), {
      description: "Per-seat published scores (the cross-start parity frame).",
    }),
    worstPairGap: Type.Union([Type.Number(), Type.Null()], {
      description: "Largest score gap between any two seated starts (E1.6).",
    }),
    balanced: Type.Boolean({
      description: "worstPairGap <= tolerance after the balancing pass (or < 2 seats).",
    }),
    swaps: Type.Array(FairnessSwapSchema, {
      description: "Deterministic balancing swaps applied to shrink the worst-pair gap.",
    }),
    relaxations: Type.Array(FairnessRelaxationSchema, {
      description:
        "Every spacing/region/quality relaxation step taken during selection — never silently swallowed.",
    }),
  },
  { additionalProperties: false }
);

const InputCoverageRowSchema = Type.Object(
  {
    input: Type.String(),
    status: Type.Union([Type.Literal("provided"), Type.Literal("imputed")]),
    affectsComponent: Type.String(),
  },
  { additionalProperties: false }
);

const SeatBiasSchema = Type.Object(
  {
    seatIndex: Type.Integer({ minimum: 0 }),
    river: Type.Number({
      minimum: 0,
      description: "Official StartBiasRivers score for the seat's civ/leader (0 = none).",
    }),
    lake: Type.Number({
      minimum: 0,
      description: "Official StartBiasLakes score (0 = none).",
    }),
    adjacentToCoast: Type.Number({
      minimum: 0,
      description: "Official StartBiasAdjacentToCoasts score (0 = none).",
    }),
  },
  {
    additionalProperties: false,
    description:
      "Per-seat start-bias rows resolved from CIV7_POLICY_TABLES_V1.startBias. River/lake/coast map onto pipeline artifacts offline; biome/terrain/feature/resource/wonder biases need live player→civ data and engine id projection (Milestone A).",
  }
);

/**
 * Plans first-age start seats end to end: candidate scoring/tiering AND seat
 * selection (placement-realignment S4). Selection authority lives here — the
 * recipe materializer only stamps the emitted seat intents and publishes the
 * artifact. The four-rung fallback ladder
 * (regional → open-pool → quality-relaxed → spacing-relaxed) never throws:
 * every rung is scored and every degradation is recorded per seat.
 */
const PlanStartsContract = defineOp({
  kind: "plan",
  id: "placement/plan-starts",
  input: Type.Object({
    baseStarts: StartsBaseSchema,
    alivePlayerIds: Type.Optional(
      Type.Array(Type.Integer({ minimum: 0 }), {
        uniqueItems: true,
        description:
          "Ordered alive major player IDs from the adapter read surface. A nonempty list is authoritative player demand, capped by combined map-size seat capacity and never padded with synthesized IDs.",
      })
    ),
    seatBiases: Type.Optional(
      Type.Array(SeatBiasSchema, {
        description:
          "Optional per-seat official start biases. Absent = neutral default (no per-civ data offline).",
      })
    ),
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
        description: "Hydrology river class per tile (0=none,1=minor,>=2=major/projectable).",
      })
    ),
    lakeMask: Type.Optional(TypedArraySchemas.u8({ description: "Hydrology lake mask per tile." })),
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
        description: "Per-tile nearby planned-resource support score (0..255).",
      })
    ),
    plannedResourcePlotIndices: Type.Optional(
      Type.Array(Type.Integer({ minimum: 0 }), {
        description:
          "PLANNED resource site plot indices (select-resource-sites intents) used to derive nearby start support. Planned, not placed: since S5 (D3 contract change) resource stamping runs after starts + the support pass, so plan intents are the only resource signal that exists at start time.",
      })
    ),
  }),
  output: Type.Object({
    playersLandmass1: Type.Integer({
      minimum: 0,
      description: "Admitted player seats allocated to the west landmass region.",
    }),
    playersLandmass2: Type.Integer({
      minimum: 0,
      description: "Admitted player seats allocated to the east landmass region.",
    }),
    spacingFloorTiles: Type.Integer({
      minimum: 0,
      description: "Hard spacing floor enforced for rungs above spacing-relaxed.",
    }),
    desiredSpacingTiles: Type.Integer({
      minimum: 0,
      description: "Spacing target; the spacing score tapers up to this distance.",
    }),
    width: Type.Integer({ minimum: 0 }),
    height: Type.Integer({ minimum: 0 }),
    candidateCount: Type.Integer({ minimum: 0 }),
    settleableTileCount: Type.Integer({
      minimum: 0,
      description:
        "Land tiles that pass the hard screens (non-lake/mountain/volcano/wonder). Zero with players requested is the only hard-fail arm.",
    }),
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
          components: StartComponentsSchema,
          landmassTiles: Type.Integer({ minimum: 0 }),
          expansionLandTiles: Type.Integer({ minimum: 0 }),
          nearbyClusterLandTiles: Type.Integer({ minimum: 0 }),
          coastDistance: Type.Integer({ minimum: 0 }),
        },
        { additionalProperties: false }
      )
    ),
    seats: Type.Array(StartRecordSchema, {
      description:
        "One typed intent per admitted player in west-then-east seat order. The materializer stamps these exact identities without adding map-capacity surplus seats.",
    }),
    fairnessReport: FairnessReportSchema,
    status: Type.Union([Type.Literal("full"), Type.Literal("degraded")], {
      description: "full = every seat seated on the regional rung at or above the spacing floor.",
    }),
    inputCoverage: Type.Array(InputCoverageRowSchema, {
      description:
        "Per-input coverage assertion results; imputed rows are surfaced, never silently neutral-defaulted.",
    }),
  }),
  strategies: {
    default: Type.Object({
      minContiguousLandTiles: Type.Integer({
        minimum: 1,
        maximum: 400,
        default: 24,
        description: "Minimum connected landmass size for a normal first-age start candidate.",
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
        description: "Radius used to evaluate nearby expansion land for intentional island starts.",
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
      marginalLandRatio: Type.Number({
        minimum: 0.1,
        maximum: 1,
        default: 0.5,
        description:
          "Fraction of minContiguousLandTiles a marginal-tier candidate must still reach.",
      }),
      marginalExpansionRatio: Type.Number({
        minimum: 0.1,
        maximum: 1,
        default: 0.65,
        description:
          "Fraction of minExpansionLandTiles a marginal-tier candidate must still reach.",
      }),
      spacingFloorTiles: Type.Integer({
        minimum: 0,
        maximum: 12,
        default: 6,
        description:
          "Hard minimum odd-q spacing between starts (official required buffer). Only the spacing-relaxed last-resort rung may go below it, and that is recorded loudly per seat.",
      }),
      desiredSpacingTiles: Type.Integer({
        minimum: 0,
        maximum: 24,
        default: 12,
        description:
          "Desired odd-q spacing between starts (official desired buffer). A score taper, not a floor: selection relaxes from here down to the hard floor, recording every relaxation.",
      }),
      fertilityWeight: Type.Number({
        minimum: 0,
        maximum: 4,
        default: 2.2,
        description: "Weight for local fertility (candidate-rank normalized) in start score.",
      }),
      resourceSupportWeight: Type.Number({
        minimum: 0,
        maximum: 4,
        default: 0.5,
        description: "Weight for nearby planned-resource support in start score.",
      }),
      resourceSupportRadiusTiles: Type.Integer({
        minimum: 0,
        maximum: 8,
        default: 4,
        description: "Radius used to count nearby planned-resource support for starts.",
      }),
      freshwaterWeight: Type.Number({
        minimum: 0,
        maximum: 4,
        default: 1.1,
        description: "Weight for river/lake adjacency support in start score.",
      }),
      largeLandmassWeight: Type.Number({
        minimum: 0,
        maximum: 4,
        default: 1,
        description: "Weight for contiguous-land and nearby expansion-area support.",
      }),
      climateWeight: Type.Number({
        minimum: 0,
        maximum: 4,
        default: 1.6,
        description:
          "Weight for climate comfort (distance from land-decile aridity/temperature extremes) in start score.",
      }),
      climateExtremePenaltyWeight: Type.Number({
        minimum: 0,
        maximum: 4,
        default: 1.5,
        description:
          "Extra subtractive penalty for candidates inside the top land aridity decile or the outer land temperature deciles (E1.8 screen).",
      }),
      roughnessPenaltyWeight: Type.Number({
        minimum: 0,
        maximum: 4,
        default: 0.6,
        description: "Penalty weight for locally rugged starts.",
      }),
      roughnessDivisor: Type.Number({
        minimum: 100,
        maximum: 3000,
        default: 900,
        description: "Elevation range (m) that maps local relief to a full roughness penalty.",
      }),
      tierBias: Type.Object(
        {
          primary: Type.Number({
            minimum: -0.2,
            maximum: 0.2,
            default: 0.08,
            description: "Additive score bias for primary-tier (full land-area) candidates.",
          }),
          islandCluster: Type.Number({
            minimum: -0.2,
            maximum: 0.2,
            default: 0.02,
            description: "Additive score bias for intentional island-cluster candidates.",
          }),
          marginal: Type.Number({
            minimum: -0.2,
            maximum: 0.2,
            default: -0.08,
            description: "Additive score bias for marginal-tier (reduced land-area) candidates.",
          }),
        },
        {
          additionalProperties: false,
          description: "Additive score bias per viability tier.",
        }
      ),
      rankingBlend: Type.Number({
        minimum: 0,
        maximum: 1,
        default: 0.86,
        description:
          "Share of the selection ranking taken by the viability score; the remainder rewards spacing up to desiredSpacingTiles.",
      }),
      fairnessTolerance: Type.Number({
        minimum: 0,
        maximum: 1,
        default: 0.3,
        description:
          "Maximum allowed worst-pair score gap before the deterministic balancing pass swaps weak seats (E1.6).",
      }),
      coastalPreferenceWeight: Type.Number({
        minimum: 0,
        maximum: 4,
        default: 0,
        description: "Weight preferring coastal-land start tiles (0 = neutral).",
      }),
      riverPreferenceWeight: Type.Number({
        minimum: 0,
        maximum: 4,
        default: 0,
        description:
          "Weight preferring river-adjacent start tiles beyond the freshwater component (0 = neutral).",
      }),
      startBiasWeight: Type.Number({
        minimum: 0,
        maximum: 4,
        default: 1,
        description:
          "Scales per-seat official StartBias contributions (river/lake/coast) in seat ranking when seatBiases are supplied.",
      }),
    }),
  },
});

export default PlanStartsContract;
