import resources from "@mapgen/domain/resources/contract";
import { defineArtifact, Type } from "@swooper/mapgen-core/authoring/contracts";

/** Resource demand plan (`artifact:placement.resourceDemandPlan`). One artifact per file by repo convention. */
const ResourceFamilySchema = Type.Union([
  Type.Literal("aquatic"),
  Type.Literal("cultivated"),
  Type.Literal("terrestrial"),
  Type.Literal("geological"),
]);

const ResourceDemandSummaryRowSchema = Type.Object(
  {
    resourceType: Type.String({ pattern: "^RESOURCE_[A-Z0-9_]+$" }),
    resourceTypeId: Type.Integer({ minimum: 0 }),
    family: ResourceFamilySchema,
    laneId: Type.String(),
    laneKind: Type.Union([Type.Literal("land"), Type.Literal("water")]),
    weight: Type.Number({ minimum: 1 }),
    minimumPerHemisphere: Type.Integer({ minimum: 0 }),
    requiredForAge: Type.Boolean(),
    targetCount: Type.Integer({ minimum: 0 }),
    minCount: Type.Integer({ minimum: 0 }),
    maxCount: Type.Integer({ minimum: 0 }),
    habitatTileCount: Type.Integer({ minimum: 0 }),
    legalTileCount: Type.Integer({ minimum: 0 }),
    eligibleTileCount: Type.Integer({ minimum: 0 }),
  },
  { additionalProperties: false }
);

const ResourceDemandPlanArtifactSchema = Type.Object(
  {
    age: Type.String({ pattern: "^AGE_[A-Z_]+$" }),
    runtimeIdResolution: Type.Object(
      {
        status: Type.Literal("verified"),
        checkedCount: Type.Integer({ minimum: 0 }),
      },
      { additionalProperties: false }
    ),
    minimumAmountModifier: Type.Integer(),
    groups: resources.ops.planResourceGroups.output,
    demands: Type.Array(ResourceDemandSummaryRowSchema),
    excluded: Type.Array(
      Type.Object(
        {
          resourceType: Type.String(),
          reason: Type.String(),
        },
        { additionalProperties: false }
      )
    ),
  },
  {
    additionalProperties: false,
    description:
      "Per-type resource demand/eligibility plan from the domain/resources family planners: symbolic group rollup plus proven-runtime-id demand rows (weight, range gates, region-minimum facts) feeding site selection.",
  }
);

export const resourceDemandPlanArtifact = defineArtifact({
  name: "resourceDemandPlan",
  id: "artifact:placement.resourceDemandPlan",
  schema: ResourceDemandPlanArtifactSchema,
});
