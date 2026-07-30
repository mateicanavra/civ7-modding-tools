import { Type } from "@swooper/mapgen-core/authoring/schema";

import { ResourceAffinityRuleSchema } from "./resource-affinity-rule.schema.js";
import { ResourceFamilySchema, ResourceSymbolSchema } from "./resource-family.schema.js";
import { ResourceLaneKindSchema } from "./resource-site-intent.schema.js";

/** Terminal deficit after all admitted site-selection passes for one resource type. */
export const ResourcePlanShortfallSchema = Type.Object(
  {
    resourceType: ResourceSymbolSchema,
    reason: Type.Literal("no-admitted-site", {
      description:
        "No remaining site passed habitat, policy, occupancy, spacing, and exclusion admission.",
    }),
    count: Type.Integer({
      minimum: 1,
      description: "Final effective-target deficit after every placement pass.",
    }),
  },
  { additionalProperties: false }
);

/** Per-resource demand, capacity, placement, and terminal shortfall evidence. */
export const ResourcePlanPerTypeSchema = Type.Object(
  {
    resourceType: ResourceSymbolSchema,
    family: ResourceFamilySchema,
    laneId: Type.String(),
    laneKind: ResourceLaneKindSchema,
    weight: Type.Number(),
    effectiveWeight: Type.Number({
      description: "Weight after rarity-fidelity scaling and before deficit rotation.",
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
  {
    additionalProperties: false,
    description: "Terminal site-selection evidence for one symbolic resource type.",
  }
);

/** Per-region minimum obligation and the passes that contributed toward it. */
export const ResourcePlanRegionMinimumSchema = Type.Object(
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

/** Site-selection settings echoed so later adjustment preserves the same authored policy. */
export const ResourcePlanSettingsSchema = Type.Object(
  {
    density: Type.Number(),
    sparsity: Type.Number(),
    rarityFidelity: Type.Number(),
    perTypeSpacingFloorScale: Type.Number(),
    equityMaxDensityRatio: Type.Number(),
    affinityRuleCount: Type.Integer({ minimum: 0 }),
    affinityRules: Type.Array(ResourceAffinityRuleSchema, {
      description:
        "Pair rules used during selection and retained for deterministic downstream adjustment.",
    }),
  },
  {
    additionalProperties: false,
    description: "Authored site-selection settings retained with the selected plan.",
  }
);
