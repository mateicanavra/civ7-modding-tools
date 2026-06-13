import { Type, TypedArraySchemas, defineOp } from "@swooper/mapgen-core/authoring";

import SelectResourceSitesContract from "../select-resource-sites/contract.js";

/**
 * Resource↔start support pass (placement-realignment S5, E3.1–E3.3).
 *
 * Takes the typed resource site plan (select-resource-sites output) plus the
 * seated StartRecord seats and produces an ADJUSTED intent set that satisfies
 * a per-start support floor within a radius and a cross-player support equity
 * tolerance, as a bounded adjustment: move or add the minimum number of
 * sites, with typed provenance per adjusted site (which start it serves and
 * why). Every S3 plan invariant is respected — policy-table legality, per-type
 * spacing floors, per-type [min,max] ranges (moves preserve counts; adds stay
 * under max), affinity/exclusion rules, and the per-landmass equity ceiling.
 * Adjustments that cannot be made without violating an invariant are recorded
 * as typed shortfalls, never forced.
 *
 * Ordering (D3 contract change, refactor-plan S5): resource PLANNING stays
 * before starts; resource STAMPING moves after this pass. Post-stamp mutation
 * is rejected — the engine has no resource-removal adapter capability and a
 * stamped surface would need its own typed outcome surface.
 */

const FamilySchema = Type.Union([
  Type.Literal("aquatic"),
  Type.Literal("cultivated"),
  Type.Literal("terrestrial"),
  Type.Literal("geological"),
]);

const LaneKindSchema = Type.Union([Type.Literal("land"), Type.Literal("water")]);

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

const SupportProvenanceSchema = Type.Object(
  {
    action: Type.Union([Type.Literal("move"), Type.Literal("add")], {
      description: "Whether the site was relocated from elsewhere in the plan or newly added.",
    }),
    reason: Type.Union([Type.Literal("support-floor"), Type.Literal("support-equity")], {
      description:
        "Why the adjustment happened: filling a start below the support floor (E3.1) or shrinking the cross-player support gap (E3.2).",
    }),
    seatIndex: Type.Integer({
      minimum: 0,
      description:
        "Seat the adjustment serves (deficit seat for floor; trimmed/filled seat for equity).",
    }),
    fromPlotIndex: Type.Optional(
      Type.Integer({
        minimum: 0,
        description: "Original plot of a moved site (absent for additions).",
      })
    ),
  },
  { additionalProperties: false }
);

const AdjustedIntentSchema = Type.Object(
  {
    plotIndex: Type.Integer({ minimum: 0 }),
    x: Type.Integer({ minimum: 0 }),
    y: Type.Integer({ minimum: 0 }),
    resourceType: Type.String({ pattern: "^RESOURCE_[A-Z0-9_]+$" }),
    resourceTypeId: Type.Integer({ minimum: 0 }),
    family: FamilySchema,
    laneId: Type.String(),
    laneKind: LaneKindSchema,
    phase: AdjustedPhaseSchema,
    order: Type.Integer({ minimum: 0 }),
    regionSlot: Type.Integer({ minimum: 0, maximum: 2 }),
    landmassId: Type.Integer({ minimum: -1 }),
    inHabitat: Type.Boolean(),
    support: Type.Optional(SupportProvenanceSchema),
  },
  { additionalProperties: false }
);

const AdjustmentSchema = Type.Object(
  {
    action: Type.Union([Type.Literal("move"), Type.Literal("add")]),
    reason: Type.Union([Type.Literal("support-floor"), Type.Literal("support-equity")]),
    resourceType: Type.String(),
    resourceTypeId: Type.Integer({ minimum: 0 }),
    fromPlotIndex: Type.Optional(Type.Integer({ minimum: 0 })),
    toPlotIndex: Type.Integer({ minimum: 0 }),
    seatIndex: Type.Integer({ minimum: 0 }),
  },
  { additionalProperties: false }
);

const SupportShortfallSchema = Type.Object(
  {
    seatIndex: Type.Integer({ minimum: 0 }),
    reason: Type.Union([
      Type.Literal("no-legal-tile-in-radius"),
      Type.Literal("spacing-floor-preserved"),
      Type.Literal("no-movable-site"),
      Type.Literal("equity-unresolvable"),
      Type.Literal("adjustment-budget-exhausted"),
      Type.Literal("adjustment-disabled"),
    ]),
    missing: Type.Integer({ minimum: 1 }),
  },
  {
    additionalProperties: false,
    description:
      "Typed record of a support adjustment that could not be made without violating an S3 plan invariant (or with adjustments disabled). Never silently forced.",
  }
);

const EligibilityRowSchema = Type.Object(
  {
    resourceType: Type.String({ pattern: "^RESOURCE_[A-Z0-9_]+$" }),
    resourceTypeId: Type.Integer({ minimum: 0 }),
    habitatMask: TypedArraySchemas.u8({
      shape: null,
      description: "Habitat lane eligibility (1=in-lane); preferred for adjusted destinations.",
    }),
    legalMask: TypedArraySchemas.u8({
      shape: null,
      description:
        "Per-resource policy legality from Resource_ValidPlacements rows (1=legal); hard gate for adjusted destinations.",
    }),
    intensity: TypedArraySchemas.f32({
      shape: null,
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

const AdjustResourceSupportContract = defineOp({
  kind: "plan",
  id: "resources/adjust-resource-support",
  input: Type.Object(
    {
      seed: Type.Integer({ description: "Deterministic seed (from env.seed)." }),
      plan: SelectResourceSitesContract.output,
      eligibility: Type.Array(EligibilityRowSchema, {
        description:
          "Per-type habitat/legality/intensity fields from the planning step, so adjusted destinations obey the same policy tables.",
      }),
      starts: Type.Array(StartSeatInputSchema, {
        description: "Seated StartRecord seats from the start assignment (seat order).",
      }),
      landmassIdByTile: TypedArraySchemas.i32({
        description: "Landmass id per tile (-1 for water).",
      }),
      landmassTileCounts: Type.Array(Type.Integer({ minimum: 0 }), {
        description: "Tile count per landmass id (index-aligned).",
      }),
      regionSlotByTile: TypedArraySchemas.u8({
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
          tolerance: Type.Integer({ minimum: 0 }),
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
          supportFloor: Type.Integer({ minimum: 0 }),
          supportRadiusTiles: Type.Integer({ minimum: 0 }),
          equityTolerance: Type.Integer({ minimum: 0 }),
          strength: Type.Number(),
        },
        { additionalProperties: false }
      ),
    },
    { additionalProperties: false }
  ),
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
            "Minimum planned resource sites within supportRadiusTiles of every seated start (E3.1 guarantee at the default 2).",
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
            "Maximum allowed max−min per-player support-count gap after the pass (E3.2 measures 2).",
        }),
        strength: Type.Number({
          minimum: 0,
          maximum: 1,
          default: 1,
          description:
            "Scales the adjustment budget: per-start floor fills apply ceil(strength × deficit) units and the equity pass budget scales with strength. 1 = fully enforce the gates; 0 = record-only (like disabled, but the pass still measures).",
        }),
      },
      { additionalProperties: false }
    ),
  },
});

export default AdjustResourceSupportContract;
