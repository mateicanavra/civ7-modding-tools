import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import {
  ResourceFamilySchema,
  ResourceSymbolSchema,
} from "../../model/schemas/resource-family.schema.js";
import {
  ResourceLaneKindSchema,
  ResourceSitePlanSchema,
} from "../../model/schemas/resource-site-plan.schema.js";

/**
 * Resource↔start support pass (placement-realignment S5, E3.1–E3.3).
 *
 * Takes the typed resource site plan (select-resource-sites output) plus the
 * seated StartRecord seats and attempts a per-start support floor and
 * cross-player support tolerance within a bounded move/add budget. Adjusted
 * destinations must pass habitat admission, policy legality, spacing, range, exclusion, region,
 * and landmass-density gates. Affinity is a best-effort scoring bias rather
 * than a feasibility constraint. Unresolved targets become typed shortfalls.
 *
 * Ordering (D3 contract change, refactor-plan S5): resource PLANNING stays
 * before starts; resource STAMPING moves after this pass. Post-stamp mutation
 * is rejected — the engine has no resource-removal adapter capability and a
 * stamped surface would need its own typed outcome surface.
 */

const AdjustedPhaseSchema = Type.Union(
  [
    Type.Literal("rotation"),
    Type.Literal("range-floor"),
    Type.Literal("region-minimum"),
    Type.Literal("support"),
  ],
  {
    description:
      "Planning provenance phase. Moved intents keep their original phase; support-pass additions carry the new 'support' phase.",
  }
);

const SupportReasonSchema = Type.Union(
  [Type.Literal("support-floor"), Type.Literal("support-equity")],
  {
    description:
      "Why the adjustment happened: filling a start below the support floor (E3.1) or shrinking the cross-player support gap (E3.2).",
  }
);

const SupportSeatIndexSchema = Type.Integer({
  minimum: 0,
  description:
    "Seat the adjustment serves (deficit seat for floor; trimmed/filled seat for equity).",
});

const SupportFromPlotIndexSchema = Type.Integer({
  minimum: 0,
  description: "Original plot of a moved resource intent.",
});

const SupportProvenanceSchema = Type.Union(
  [
    Type.Object(
      {
        action: Type.Literal("move"),
        reason: SupportReasonSchema,
        seatIndex: SupportSeatIndexSchema,
        fromPlotIndex: SupportFromPlotIndexSchema,
      },
      { additionalProperties: false }
    ),
    Type.Object(
      {
        action: Type.Literal("add"),
        reason: SupportReasonSchema,
        seatIndex: SupportSeatIndexSchema,
      },
      { additionalProperties: false }
    ),
  ],
  {
    description:
      "One terminal support adjustment: moves require their source plot, while additions cannot claim one.",
  }
);

const AdjustedIntentSchema = Type.Object(
  {
    plotIndex: Type.Integer({ minimum: 0 }),
    x: Type.Integer({ minimum: 0 }),
    y: Type.Integer({ minimum: 0 }),
    resourceType: ResourceSymbolSchema,
    family: ResourceFamilySchema,
    laneId: Type.String(),
    laneKind: ResourceLaneKindSchema,
    phase: AdjustedPhaseSchema,
    order: Type.Integer({ minimum: 0 }),
    regionSlot: Type.Integer({ minimum: 0, maximum: 2 }),
    landmassId: Type.Integer({ minimum: -1 }),
    inHabitat: Type.Boolean(),
    support: Type.Optional(SupportProvenanceSchema),
  },
  { additionalProperties: false }
);

const AdjustmentEvidenceProperties = {
  reason: SupportReasonSchema,
  resourceType: ResourceSymbolSchema,
  toPlotIndex: Type.Integer({
    minimum: 0,
    description: "Final plot occupied by the adjusted resource intent.",
  }),
  seatIndex: SupportSeatIndexSchema,
} as const;

const AdjustmentSchema = Type.Union(
  [
    Type.Object(
      {
        action: Type.Literal("move"),
        ...AdjustmentEvidenceProperties,
        fromPlotIndex: SupportFromPlotIndexSchema,
      },
      { additionalProperties: false }
    ),
    Type.Object(
      {
        action: Type.Literal("add"),
        ...AdjustmentEvidenceProperties,
      },
      { additionalProperties: false }
    ),
  ],
  {
    description:
      "Closed adjustment row paired bijectively with the terminal intent provenance at its destination.",
  }
);

const SupportShortfallSchema = Type.Object(
  {
    seatIndex: Type.Integer({ minimum: 0 }),
    reason: Type.Union(
      [
        Type.Literal("no-admitted-adjustment"),
        Type.Literal("equity-unresolvable"),
        Type.Literal("floor-budget-exhausted"),
        Type.Literal("equity-budget-exhausted"),
        Type.Literal("adjustment-disabled"),
      ],
      {
        description:
          "Truthful terminal disposition: no complete adjustment was admitted, the configured budget ended, adjustment was disabled, or equity remained unresolvable.",
      }
    ),
    missing: Type.Integer({
      minimum: 1,
      description:
        "Terminal support units missing from the seat floor, or terminal gap units above the configured equity tolerance.",
    }),
  },
  {
    additionalProperties: false,
    description:
      "Typed record of a support target unresolved within the bounded pass, its hard destination gates, or the configured adjustment budget.",
  }
);

const EligibilityRowSchema = Type.Object(
  {
    resourceType: ResourceSymbolSchema,
    habitatMask: TypedArraySchemas.u8({
      cardinality: ["plan.width", "plan.height"],
      description: "Habitat lane eligibility (1=in-lane); required for adjusted destinations.",
    }),
    legalMask: TypedArraySchemas.u8({
      cardinality: ["plan.width", "plan.height"],
      description:
        "Per-resource policy legality from Resource_ValidPlacements rows (1=legal); combined with habitat as a hard gate for adjusted destinations.",
    }),
    intensity: TypedArraySchemas.f32({
      cardinality: ["plan.width", "plan.height"],
      description: "Habitat intensity (0..1) scoring destination preference.",
    }),
  },
  { additionalProperties: false }
);

const StartSeatInputSchema = Type.Object(
  {
    seatIndex: Type.Integer({ minimum: 0 }),
    playerId: Type.Integer({ minimum: 0 }),
    plotIndex: Type.Integer({
      minimum: -1,
      description: "Seat plot from the StartRecord; -1 (unseated) seats are skipped.",
    }),
  },
  { additionalProperties: false }
);

/**
 * Admits the bounded pre-stamp support adjustment over a typed site plan and seated starts.
 * Adjusted destinations must pass habitat, legality, spacing, range, exclusion, region, and landmass
 * gates; affinity only biases candidate scoring, and unresolved targets become shortfalls.
 */
const AdjustResourceSupportContract = defineOp({
  kind: "plan",
  id: "resources/adjust-resource-support",
  input: Type.Object(
    {
      seed: Type.Integer({ description: "Deterministic seed (from setup.mapSeed)." }),
      plan: ResourceSitePlanSchema,
      eligibility: Type.Array(EligibilityRowSchema, {
        description:
          "Per-type habitat/legality/intensity fields from the planning step, so adjusted destinations obey the same policy tables.",
      }),
      starts: Type.Array(StartSeatInputSchema, {
        description: "Seated StartRecord seats from the start assignment (seat order).",
      }),
      landmassIdByTile: TypedArraySchemas.i32({
        cardinality: ["plan.width", "plan.height"],
        description: "Landmass id per tile (-1 for water).",
      }),
      landmassTileCounts: Type.Array(Type.Integer({ minimum: 0 }), {
        description: "Tile count per landmass id (index-aligned).",
      }),
      regionSlotByTile: TypedArraySchemas.u8({
        cardinality: ["plan.width", "plan.height"],
        description: "Landmass region slot per tile (0=none, 1=west, 2=east).",
      }),
    },
    { additionalProperties: false }
  ),
  output: Type.Object(
    {
      width: Type.Integer({ minimum: 1 }),
      height: Type.Integer({ minimum: 1 }),
      seed: Type.Integer(),
      plannedCount: Type.Integer({ minimum: 0 }),
      moveCount: Type.Integer({ minimum: 0 }),
      addCount: Type.Integer({ minimum: 0 }),
      intents: Type.Array(AdjustedIntentSchema, {
        description:
          "The FULL adjusted intent set (original intents with moves applied, plus support additions). place-resources stamps exactly this.",
      }),
      adjustments: Type.Array(AdjustmentSchema, {
        description: "Every applied adjustment with typed provenance.",
      }),
      shortfalls: Type.Array(SupportShortfallSchema),
      perStart: Type.Array(
        Type.Object(
          {
            seatIndex: Type.Integer({ minimum: 0 }),
            playerId: Type.Integer({ minimum: 0 }),
            plotIndex: Type.Integer({ minimum: 0 }),
            supportBefore: Type.Integer({ minimum: 0 }),
            supportAfter: Type.Integer({ minimum: 0 }),
          },
          { additionalProperties: false }
        ),
        { description: "Per seated start: planned-site support within the radius, before/after." }
      ),
      equity: Type.Object(
        {
          gapBefore: Type.Union([Type.Integer({ minimum: 0 }), Type.Null()]),
          gapAfter: Type.Union([Type.Integer({ minimum: 0 }), Type.Null()]),
        },
        {
          additionalProperties: false,
          description:
            "Cross-player max−min support gap before/after the pass (null with <2 seats).",
        }
      ),
      settings: Type.Object(
        {
          enabled: Type.Boolean(),
          supportFloor: Type.Integer({ minimum: 0, maximum: 6 }),
          supportRadiusTiles: Type.Integer({ minimum: 1, maximum: 8 }),
          equityTolerance: Type.Integer({ minimum: 0, maximum: 8 }),
          strength: Type.Number({ minimum: 0, maximum: 1 }),
        },
        { additionalProperties: false }
      ),
    },
    { additionalProperties: false }
  ),
  defaultStrategy: "default",
  strategies: {
    default: Type.Object(
      {
        enabled: Type.Boolean({
          default: true,
          description:
            "Runs the support pass. When false the plan passes through unchanged and unmet floors are recorded as typed shortfalls (reason adjustment-disabled).",
        }),
        supportFloor: Type.Integer({
          minimum: 0,
          maximum: 6,
          default: 2,
          description:
            "Target planned resource sites within supportRadiusTiles of each seated start; unattainable deficits are recorded as typed shortfalls.",
        }),
        supportRadiusTiles: Type.Integer({
          minimum: 1,
          maximum: 8,
          default: 4,
          description:
            "Hex radius around each start within which support sites are counted (E3.1 measures 4).",
        }),
        equityTolerance: Type.Integer({
          minimum: 0,
          maximum: 8,
          default: 2,
          description:
            "Target max−min per-player support-count gap; an unresolved gap is retained in typed evidence.",
        }),
        strength: Type.Number({
          minimum: 0,
          maximum: 1,
          default: 1,
          description:
            "Scales the adjustment budget: per-start floor fills apply ceil(strength × deficit) units and the equity pass budget scales with strength. 1 uses the full budget; 0 is record-only while still measuring.",
        }),
      },
      { additionalProperties: false }
    ),
  },
});

export default AdjustResourceSupportContract;
