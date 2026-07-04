import resources from "@mapgen/domain/resources";
import { defineArtifact, Type } from "@swooper/mapgen-core/authoring/contracts";
import { validateArtifactSchema } from "@swooper/mapgen-core/authoring/contracts";

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

export const Schema = ResourceDemandPlanArtifactSchema;

export const artifact = defineArtifact({
  name: "resourceDemandPlan",
  id: "artifact:placement.resourceDemandPlan",
  schema: Schema,
});

type ValidationIssue = { message: string };

function issue(message: string): ValidationIssue {
  return { message };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/**
 * Validate hooks for the resource planning artifacts (placement-realignment
 * S3 artifact hygiene: placement previously registered zero validators).
 * These check cross-field invariants the schemas cannot express.
 */

function validatePayload(value: unknown): ValidationIssue[] {
  if (!isRecord(value)) return [issue("resourceDemandPlan artifact must be an object.")];
  const issues: ValidationIssue[] = [];
  const demands = Array.isArray(value.demands) ? value.demands : null;
  if (!demands) return [issue("resourceDemandPlan.demands must be an array.")];

  const resolution = isRecord(value.runtimeIdResolution) ? value.runtimeIdResolution : null;
  if (!resolution || resolution.status !== "verified") {
    issues.push(issue("resourceDemandPlan.runtimeIdResolution.status must be 'verified'."));
  } else if (resolution.checkedCount !== demands.length) {
    issues.push(
      issue(
        `resourceDemandPlan runtimeIdResolution.checkedCount ${String(resolution.checkedCount)} != demands.length ${demands.length}.`
      )
    );
  }

  const seenIds = new Set<number>();
  for (const row of demands) {
    if (!isRecord(row)) {
      issues.push(issue("resourceDemandPlan demand row must be an object."));
      continue;
    }
    const id = typeof row.resourceTypeId === "number" ? row.resourceTypeId : -1;
    if (id < 0) {
      issues.push(issue(`Demand ${String(row.resourceType)} has no proven runtime id.`));
      continue;
    }
    if (seenIds.has(id)) {
      issues.push(issue(`Demand runtime id ${id} appears more than once.`));
    }
    seenIds.add(id);
    const minCount = Number(row.minCount);
    const maxCount = Number(row.maxCount);
    const targetCount = Number(row.targetCount);
    if (minCount > maxCount) {
      issues.push(
        issue(`Demand ${String(row.resourceType)} minCount ${minCount} > maxCount ${maxCount}.`)
      );
    }
    if (targetCount > maxCount) {
      issues.push(
        issue(
          `Demand ${String(row.resourceType)} targetCount ${targetCount} > maxCount ${maxCount}.`
        )
      );
    }
    if (Number(row.legalTileCount) <= 0) {
      issues.push(
        issue(
          `Demand ${String(row.resourceType)} has zero policy-legal tiles; it must be excluded, not planned.`
        )
      );
    }
  }
  return issues;
}

export function validate(value: unknown): readonly { message: string }[] {
  return Object.freeze([...validateArtifactSchema(Schema, value), ...validatePayload(value)]);
}
