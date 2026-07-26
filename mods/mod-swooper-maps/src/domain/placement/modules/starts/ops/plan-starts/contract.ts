import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import { StartFairnessReportSchema } from "../../model/atoms/start-fairness.schema.js";
import {
  StartInputCoverageRowSchema,
  StartRejectionCountSchema,
  StartTierCountsSchema,
} from "../../model/atoms/start-planning-evidence.schema.js";
import {
  StartCandidateTierSchema,
  StartComponentsSchema,
  StartSeatSchema,
} from "../../model/atoms/start-seat.schema.js";
import viabilityFairnessDefinition from "./strategies/viability-fairness/config.js";

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
    width: Type.Integer({
      minimum: 1,
      description:
        "Map width projected by the recipe step from admitted setup to index placement evidence.",
    }),
    height: Type.Integer({
      minimum: 1,
      description:
        "Map height projected by the recipe step from admitted setup to index placement evidence.",
    }),
    landMask: TypedArraySchemas.u8({
      description: "Required land mask per tile (1=land,0=water).",
    }),
    slotByTile: TypedArraySchemas.u8({
      description: "Required requested landmass slot per tile (0=none,1=west,2=east).",
    }),
    landmassIdByTile: TypedArraySchemas.i32({
      description: "Required connected landmass id per tile (-1 for water).",
    }),
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
    rejectionCounts: Type.Array(StartRejectionCountSchema),
    tierCounts: StartTierCountsSchema,
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
    seats: Type.Array(StartSeatSchema, {
      description:
        "One typed intent per admitted player in west-then-east seat order. The materializer stamps these exact identities without adding map-capacity surplus seats.",
    }),
    fairnessReport: StartFairnessReportSchema,
    status: Type.Union([Type.Literal("full"), Type.Literal("degraded")], {
      description: "full = every seat seated on the regional rung at or above the spacing floor.",
    }),
    inputCoverage: Type.Array(StartInputCoverageRowSchema, {
      description:
        "Per-input coverage assertion results; imputed rows are surfaced, never silently neutral-defaulted.",
    }),
  }),
  strategies: [viabilityFairnessDefinition],
});

export default PlanStartsContract;
