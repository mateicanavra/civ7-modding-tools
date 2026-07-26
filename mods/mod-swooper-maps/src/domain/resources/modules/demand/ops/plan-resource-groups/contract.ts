import { defineOp, Type } from "@swooper/mapgen-core/authoring/contracts";
import {
  ResourceGroupPlanSchema,
  ResourceGroupSummarySchema,
} from "../../model/atoms/resource-group-plan.schema.js";
import canonicalRollupDefinition from "./strategies/canonical-rollup/config.js";

/**
 * Admits reconciliation of the four family demand plans into one warning-only coverage report.
 * It preserves family rows while surfacing duplicate ownership, missing resources, blockers,
 * and aggregate target/eligibility counts.
 */
const PlanResourceGroupsContract = defineOp({
  kind: "plan",
  id: "resources/plan-resource-groups",
  input: Type.Object(
    {
      aquaticPlan: ResourceGroupPlanSchema,
      cultivatedPlan: ResourceGroupPlanSchema,
      terrestrialPlan: ResourceGroupPlanSchema,
      geologicalPlan: ResourceGroupPlanSchema,
    },
    { additionalProperties: false }
  ),
  output: Type.Object(
    {
      artifactId: Type.Literal("artifact:resources.groupPlans"),
      proofStatus: Type.Literal("warning-only"),
      groupCount: Type.Integer({ minimum: 0 }),
      resourceCount: Type.Integer({ minimum: 0 }),
      plannedCount: Type.Integer({ minimum: 0 }),
      blockedCount: Type.Integer({ minimum: 0 }),
      missingSignalCount: Type.Integer({ minimum: 0 }),
      missingExpectationCount: Type.Integer({ minimum: 0 }),
      targetIntentCount: Type.Integer({ minimum: 0 }),
      eligibleTileCount: Type.Integer({ minimum: 0 }),
      duplicateResourceTypes: Type.Array(Type.String({ pattern: "^RESOURCE_[A-Z0-9_]+$" })),
      missingResourceTypes: Type.Array(Type.String({ pattern: "^RESOURCE_[A-Z0-9_]+$" })),
      blockers: Type.Array(Type.String()),
      groups: Type.Array(ResourceGroupSummarySchema),
    },
    {
      additionalProperties: false,
      description:
        "Warning-only reconciliation of the four resource-family plans, preserving each symbolic row while reporting aggregate counts, missing evidence, duplicate ownership, and group-id blockers.",
    }
  ),
  strategies: [canonicalRollupDefinition],
});

export default PlanResourceGroupsContract;
