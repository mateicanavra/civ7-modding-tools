import { defineOp, Type } from "@swooper/mapgen-core/authoring";

const ResourceGroupIdSchema = Type.Union([
  Type.Literal("aquatic-coastal-navigable-river"),
  Type.Literal("cultivated-plantation-medicinal"),
  Type.Literal("terrestrial-animal-forest-wild"),
  Type.Literal("geological-mineral-gemstone-industrial"),
]);

const ResourceRowStatusSchema = Type.Union([
  Type.Literal("planned"),
  Type.Literal("blocked"),
  Type.Literal("missing-expectation"),
  Type.Literal("proxy-gap"),
]);

const ResourcePlanRowSchema = Type.Object(
  {
    resourceType: Type.String({ pattern: "^RESOURCE_[A-Z0-9_]+$" }),
    status: ResourceRowStatusSchema,
    runtimeIdStatus: Type.Literal("unverified"),
    proofStatus: Type.Literal("warning-only"),
    targetIntentCount: Type.Integer({ minimum: 0 }),
    eligibleTileCount: Type.Integer({ minimum: 0 }),
  },
  {
    additionalProperties: true,
    description:
      "Symbolic row emitted by a resource group planner. Extra lane/proxy fields remain group-owned.",
  }
);

const ResourceGroupPlanInputSchema = Type.Object(
  {
    groupId: ResourceGroupIdSchema,
    runtimeIdStatus: Type.Literal("unverified"),
    proofStatus: Type.Literal("warning-only"),
    plans: Type.Array(ResourcePlanRowSchema),
    missingResourceTypes: Type.Array(Type.String({ pattern: "^RESOURCE_[A-Z0-9_]+$" })),
  },
  { additionalProperties: false }
);

const ResourceGroupSummarySchema = Type.Object(
  {
    groupId: ResourceGroupIdSchema,
    inputGroupId: ResourceGroupIdSchema,
    resourceCount: Type.Integer({ minimum: 0 }),
    plannedCount: Type.Integer({ minimum: 0 }),
    blockedCount: Type.Integer({ minimum: 0 }),
    proxyGapCount: Type.Integer({ minimum: 0 }),
    missingExpectationCount: Type.Integer({ minimum: 0 }),
    targetIntentCount: Type.Integer({ minimum: 0 }),
    eligibleTileCount: Type.Integer({ minimum: 0 }),
    missingResourceTypes: Type.Array(Type.String({ pattern: "^RESOURCE_[A-Z0-9_]+$" })),
    blockers: Type.Array(Type.String()),
    plans: Type.Array(ResourcePlanRowSchema),
  },
  { additionalProperties: false }
);

const PlanResourceGroupsContract = defineOp({
  kind: "plan",
  id: "resources/plan-resource-groups",
  input: Type.Object(
    {
      aquaticPlan: ResourceGroupPlanInputSchema,
      cultivatedPlan: ResourceGroupPlanInputSchema,
      terrestrialPlan: ResourceGroupPlanInputSchema,
      geologicalPlan: ResourceGroupPlanInputSchema,
    },
    { additionalProperties: false }
  ),
  output: Type.Object(
    {
      artifactId: Type.Literal("artifact:resources.groupPlans"),
      runtimeIdStatus: Type.Literal("unverified"),
      proofStatus: Type.Literal("warning-only"),
      groupCount: Type.Integer({ minimum: 0 }),
      resourceCount: Type.Integer({ minimum: 0 }),
      plannedCount: Type.Integer({ minimum: 0 }),
      blockedCount: Type.Integer({ minimum: 0 }),
      proxyGapCount: Type.Integer({ minimum: 0 }),
      missingExpectationCount: Type.Integer({ minimum: 0 }),
      targetIntentCount: Type.Integer({ minimum: 0 }),
      eligibleTileCount: Type.Integer({ minimum: 0 }),
      duplicateResourceTypes: Type.Array(Type.String({ pattern: "^RESOURCE_[A-Z0-9_]+$" })),
      missingResourceTypes: Type.Array(Type.String({ pattern: "^RESOURCE_[A-Z0-9_]+$" })),
      blockers: Type.Array(Type.String()),
      groups: Type.Array(ResourceGroupSummarySchema),
    },
    { additionalProperties: false }
  ),
  strategies: {
    default: Type.Object({}, { additionalProperties: false }),
  },
});

export default PlanResourceGroupsContract;
