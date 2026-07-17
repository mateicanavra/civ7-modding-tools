import { Type } from "@swooper/mapgen-core/authoring/contracts";

import { ResourceFamilySchema, ResourceSymbolSchema } from "./resource-family.schema.js";

/**
 * Closed lane medium for resource intent: `land` or `water`. Site selection and support
 * adjustment use it to preserve the habitat surface on which an intent may legally move.
 */
export const ResourceLaneKindSchema = Type.Union([Type.Literal("land"), Type.Literal("water")]);

const ResourcePlanPhaseSchema = Type.Union([
  Type.Literal("rotation"),
  Type.Literal("range-floor"),
  Type.Literal("region-minimum"),
]);

/**
 * Closed pairwise resource relation used during site selection and support adjustment. A
 * positive hex radius either biases an affinity or enforces an exclusion, and the symmetric
 * rule is echoed in plan settings for downstream consistency.
 */
export const ResourceAffinityRuleSchema = Type.Object(
  {
    resourceA: ResourceSymbolSchema,
    resourceB: ResourceSymbolSchema,
    relation: Type.Union([Type.Literal("affinity"), Type.Literal("exclusion")], {
      description:
        "Pair relation: affinity biases selection toward placing the pair within the radius; exclusion forbids it.",
    }),
    radiusTiles: Type.Integer({
      minimum: 1,
      maximum: 8,
      default: 3,
      description: "Hex radius within which the pair relation applies.",
    }),
  },
  {
    additionalProperties: false,
    description: "One resource-resource affinity/exclusion rule (E3.4).",
  }
);

const ResourcePlanIntentSchema = Type.Object(
  {
    plotIndex: Type.Integer({ minimum: 0 }),
    x: Type.Integer({ minimum: 0 }),
    y: Type.Integer({ minimum: 0 }),
    resourceType: ResourceSymbolSchema,
    family: ResourceFamilySchema,
    laneId: Type.String(),
    laneKind: ResourceLaneKindSchema,
    phase: ResourcePlanPhaseSchema,
    order: Type.Integer({ minimum: 0 }),
    regionSlot: Type.Integer({ minimum: 0, maximum: 2 }),
    landmassId: Type.Integer({ minimum: -1 }),
    inHabitat: Type.Boolean(),
  },
  { additionalProperties: false }
);

const ResourcePlanShortfallSchema = Type.Object(
  {
    resourceType: ResourceSymbolSchema,
    reason: Type.Literal("no-admitted-site", {
      description:
        "No remaining site passed the complete habitat, policy, occupancy, spacing, and exclusion admission path.",
    }),
    count: Type.Integer({
      minimum: 1,
      description:
        "Final effective-target deficit after every placement pass (effectiveTargetCount - plannedCount).",
    }),
  },
  { additionalProperties: false }
);

const ResourcePlanPerTypeSchema = Type.Object(
  {
    resourceType: ResourceSymbolSchema,
    family: ResourceFamilySchema,
    laneId: Type.String(),
    laneKind: ResourceLaneKindSchema,
    weight: Type.Number(),
    effectiveWeight: Type.Number({
      description: "Weight after rarityFidelity exponent; rotation subtracts this.",
    }),
    authoredTargetCount: Type.Integer({ minimum: 0 }),
    effectiveTargetCount: Type.Integer({ minimum: 0 }),
    minCount: Type.Integer({ minimum: 0 }),
    maxCount: Type.Integer({ minimum: 0 }),
    spacingFloorTiles: Type.Integer({ minimum: 0 }),
    habitatTileCount: Type.Integer({ minimum: 0 }),
    legalTileCount: Type.Integer({ minimum: 0 }),
    eligibleTileCount: Type.Integer({ minimum: 0 }),
    plannedCount: Type.Integer({ minimum: 0 }),
    rotationCount: Type.Integer({ minimum: 0 }),
    rangeFloorCount: Type.Integer({ minimum: 0 }),
    regionMinimumCount: Type.Integer({ minimum: 0 }),
    shortfalls: Type.Array(ResourcePlanShortfallSchema, {
      maxItems: 1,
      description:
        "Zero or one terminal range deficit; region-minimum obligations are reported separately.",
    }),
  },
  { additionalProperties: false }
);

const ResourcePlanRegionMinimumSchema = Type.Object(
  {
    resourceType: ResourceSymbolSchema,
    regionSlot: Type.Integer({ minimum: 1, maximum: 2 }),
    required: Type.Integer({ minimum: 0 }),
    fromRotation: Type.Integer({ minimum: 0 }),
    forced: Type.Integer({ minimum: 0 }),
    shortfall: Type.Integer({ minimum: 0 }),
  },
  { additionalProperties: false }
);

/**
 * Complete deterministic resource-site plan: dimensioned typed intents, per-type counts and
 * shortfalls, region-minimum evidence, and the settings that produced them. Downstream
 * adjustment may move or add intents only while preserving these recorded authority constraints.
 */
export const ResourceSitePlanSchema = Type.Object(
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
    settings: Type.Object(
      {
        density: Type.Number(),
        sparsity: Type.Number(),
        rarityFidelity: Type.Number(),
        perTypeSpacingFloorScale: Type.Number(),
        equityMaxDensityRatio: Type.Number(),
        affinityRuleCount: Type.Integer({ minimum: 0 }),
        affinityRules: Type.Array(ResourceAffinityRuleSchema, {
          description:
            "Echo of the affinity/exclusion rules the plan was selected under, so downstream plan adjusters respect the same rules without duplicating config.",
        }),
      },
      { additionalProperties: false }
    ),
  },
  { additionalProperties: false }
);
