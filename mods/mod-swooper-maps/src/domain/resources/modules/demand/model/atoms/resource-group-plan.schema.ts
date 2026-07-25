import { Type } from "@swooper/mapgen-core/authoring/schema";

/** Stable identity for one resource-family planning branch. */
export const ResourceGroupIdSchema = Type.Union([
  Type.Literal("aquatic-coastal-navigable-river"),
  Type.Literal("cultivated-plantation-medicinal"),
  Type.Literal("terrestrial-animal-forest-wild"),
  Type.Literal("geological-mineral-gemstone-industrial"),
]);

/** Terminal planning disposition for one symbolic resource row. */
export const ResourceRowStatusSchema = Type.Union([
  Type.Literal("planned"),
  Type.Literal("blocked"),
  Type.Literal("missing-expectation"),
  Type.Literal("missing-signal"),
]);

/** Symbolic resource row emitted by one family-specific demand planner. */
export const ResourcePlanRowSchema = Type.Object(
  {
    resourceType: Type.String({ pattern: "^RESOURCE_[A-Z0-9_]+$" }),
    status: ResourceRowStatusSchema,
    proofStatus: Type.Literal("warning-only"),
    targetIntentCount: Type.Integer({ minimum: 0 }),
    eligibleTileCount: Type.Integer({ minimum: 0 }),
  },
  {
    additionalProperties: true,
    description:
      "Shared resource-row evidence; family-specific lane and signal fields remain additive.",
  }
);

/** One family planner's symbolic rows and missing-resource evidence. */
export const ResourceGroupPlanSchema = Type.Object(
  {
    groupId: ResourceGroupIdSchema,
    proofStatus: Type.Literal("warning-only"),
    plans: Type.Array(ResourcePlanRowSchema),
    missingResourceTypes: Type.Array(Type.String({ pattern: "^RESOURCE_[A-Z0-9_]+$" })),
  },
  { additionalProperties: false }
);

/** Reconciled counts and rows for one resource-family planning branch. */
export const ResourceGroupSummarySchema = Type.Object(
  {
    groupId: ResourceGroupIdSchema,
    inputGroupId: ResourceGroupIdSchema,
    resourceCount: Type.Integer({ minimum: 0 }),
    plannedCount: Type.Integer({ minimum: 0 }),
    blockedCount: Type.Integer({ minimum: 0 }),
    missingSignalCount: Type.Integer({ minimum: 0 }),
    missingExpectationCount: Type.Integer({ minimum: 0 }),
    targetIntentCount: Type.Integer({ minimum: 0 }),
    eligibleTileCount: Type.Integer({ minimum: 0 }),
    missingResourceTypes: Type.Array(Type.String({ pattern: "^RESOURCE_[A-Z0-9_]+$" })),
    blockers: Type.Array(Type.String()),
    plans: Type.Array(ResourcePlanRowSchema),
  },
  {
    additionalProperties: false,
    description: "Warning-only reconciliation for one resource-family planning branch.",
  }
);
