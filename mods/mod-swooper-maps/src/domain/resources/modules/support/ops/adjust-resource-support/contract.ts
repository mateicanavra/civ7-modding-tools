import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import { ResourceSymbolSchema } from "../../../../model/atoms/resource-family.schema.js";
import {
  ResourcePlanPerTypeSchema,
  ResourcePlanRegionMinimumSchema,
  ResourcePlanSettingsSchema,
} from "../../../../model/atoms/resource-plan-evidence.schema.js";
import { ResourcePlanIntentSchema } from "../../../../model/atoms/resource-site-intent.schema.js";
import {
  AdjustedResourceIntentSchema,
  ResourceSupportAdjustmentSchema,
} from "../../model/atoms/resource-support-adjustment.schema.js";
import {
  ResourceSupportEquitySchema,
  ResourceSupportPerStartSchema,
  ResourceSupportSettingsSchema,
  ResourceSupportShortfallSchema,
} from "../../model/atoms/resource-support-evidence.schema.js";
import supportEquityDefinition from "./strategies/support-equity/config.js";

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

const StartSeatSchema = Type.Object(
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
      plan: Type.Object(
        {
          width: Type.Integer({ minimum: 1 }),
          height: Type.Integer({ minimum: 1 }),
          seed: Type.Integer(),
          plannedCount: Type.Integer({ minimum: 0 }),
          rotationCount: Type.Integer({ minimum: 0 }),
          rangeFloorCount: Type.Integer({ minimum: 0 }),
          regionMinimumCount: Type.Integer({ minimum: 0 }),
          siteSpacingTiles: Type.Integer({ minimum: 0 }),
          equitySkippedSiteCount: Type.Integer({ minimum: 0 }),
          intents: Type.Array(ResourcePlanIntentSchema),
          perType: Type.Array(ResourcePlanPerTypeSchema),
          regionMinimums: Type.Array(ResourcePlanRegionMinimumSchema),
          settings: ResourcePlanSettingsSchema,
        },
        {
          additionalProperties: false,
          description:
            "Site-selected resource plan that support adjustment may move or extend without changing its policy authority.",
        }
      ),
      eligibility: Type.Array(EligibilityRowSchema, {
        description:
          "Per-type habitat/legality/intensity fields from the planning step, so adjusted destinations obey the same policy tables.",
      }),
      starts: Type.Array(StartSeatSchema, {
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
      intents: Type.Array(AdjustedResourceIntentSchema, {
        description:
          "The FULL adjusted intent set (original intents with moves applied, plus support additions). place-resources stamps exactly this.",
      }),
      adjustments: Type.Array(ResourceSupportAdjustmentSchema, {
        description: "Every applied adjustment with typed provenance.",
      }),
      shortfalls: Type.Array(ResourceSupportShortfallSchema),
      perStart: Type.Array(ResourceSupportPerStartSchema, {
        description: "Per seated start: planned-site support within the radius, before/after.",
      }),
      equity: ResourceSupportEquitySchema,
      settings: ResourceSupportSettingsSchema,
    },
    { additionalProperties: false }
  ),
  strategies: [supportEquityDefinition],
});

export default AdjustResourceSupportContract;
