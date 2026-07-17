import resources, { ResourceFamilySchema, ResourceSymbolSchema } from "@mapgen/domain/resources";
import {
  defineArtifact,
  Type,
  validateArtifactSchema,
} from "@swooper/mapgen-core/authoring/contracts";

const ResourceDemandSummaryRowSchema = Type.Object(
  {
    resourceType: ResourceSymbolSchema,
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
      "Per-type resource demand/eligibility plan from the domain/resources family planners. Rows stay symbolic; runtime ids are resolved only at map-policy/materialization boundaries.",
  }
);

/** Runtime schema for symbolic per-resource demand and policy-legal capacity. */
export const Schema = ResourceDemandPlanArtifactSchema;

/** Registers symbolic per-resource demand and eligibility before site selection. */
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

  const seenTypes = new Set<string>();
  for (const row of demands) {
    if (!isRecord(row)) {
      issues.push(issue("resourceDemandPlan demand row must be an object."));
      continue;
    }
    const resourceType = String(row.resourceType);
    if (seenTypes.has(resourceType)) {
      issues.push(issue(`Demand ${resourceType} appears more than once.`));
    }
    seenTypes.add(resourceType);
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

/**
 * Rejects duplicate resource rows, inverted min/max bounds, targets above max,
 * and planned demands with no policy-legal tiles.
 */
export function validate(value: unknown): readonly { message: string }[] {
  return Object.freeze([...validateArtifactSchema(Schema, value), ...validatePayload(value)]);
}
