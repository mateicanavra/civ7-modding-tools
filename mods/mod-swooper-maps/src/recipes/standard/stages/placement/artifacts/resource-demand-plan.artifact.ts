import {
  OFFICIAL_RESOURCE_BY_TYPE,
  type OfficialAgeType,
  type OfficialResourceType,
} from "@civ7/map-policy";
import {
  getInitialMapResourcePolicyForType,
  INITIAL_MAP_RESOURCE_AUTHORING_AGE,
  type InitialMapResourceAuthoringStatus,
  default as resources,
  ResourceFamilySchema,
  ResourceSymbolSchema,
} from "@mapgen/domain/resources";
import {
  defineArtifact,
  type Static,
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

/**
 * Closed terminal reasons for excluding one family-planner candidate from resource demand.
 * Structured evidence keeps planner state, age policy, and scenario capacity distinct without
 * encoding a second grammar for downstream consumers to parse.
 */
export const ResourceDemandExclusionReasonSchema = Type.Union([
  Type.Object(
    { kind: Type.Literal("outside-official-resource-corpus") },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      kind: Type.Literal("planner-status"),
      status: Type.Union([
        Type.Literal("blocked"),
        Type.Literal("missing-expectation"),
        Type.Literal("missing-signal"),
      ]),
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      kind: Type.Literal("age-policy"),
      status: Type.Union([
        Type.Literal("deferred-future-age"),
        Type.Literal("blocked-official"),
        Type.Literal("not-placeable"),
        Type.Literal("unknown"),
      ]),
      age: Type.Literal(INITIAL_MAP_RESOURCE_AUTHORING_AGE),
    },
    { additionalProperties: false }
  ),
  Type.Object({ kind: Type.Literal("no-admitted-legal-tiles") }, { additionalProperties: false }),
]);

/** One artifact-owned terminal reason for excluding a resource demand candidate. */
export type ResourceDemandExclusionReason = Static<typeof ResourceDemandExclusionReasonSchema>;

const ResourceDemandPlanArtifactSchema = Type.Object(
  {
    age: Type.Literal(INITIAL_MAP_RESOURCE_AUTHORING_AGE),
    minimumAmountModifier: Type.Integer(),
    groups: resources.ops.planResourceGroups.output,
    demands: Type.Array(ResourceDemandSummaryRowSchema),
    excluded: Type.Array(
      Type.Object(
        {
          resourceType: Type.String(),
          reason: ResourceDemandExclusionReasonSchema,
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

/** Runtime schema for symbolic per-resource demand and admitted legal capacity. */
export const Schema = ResourceDemandPlanArtifactSchema;

type ResourceDemandPlanPayload = Static<typeof Schema>;
type PlannerStatus =
  ResourceDemandPlanPayload["groups"]["groups"][number]["plans"][number]["status"];

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

/**
 * Validate hooks for the resource planning artifacts (placement-realignment
 * S3 artifact hygiene: placement previously registered zero validators).
 * These check cross-field invariants the schemas cannot express.
 */

function validatePayload(value: ResourceDemandPlanPayload): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  const demandByType = new Map<string, ResourceDemandPlanPayload["demands"][number]>();
  for (const row of value.demands) {
    const resourceType = row.resourceType;
    if (demandByType.has(resourceType)) {
      issues.push(issue(`Demand ${resourceType} appears more than once.`));
    }
    demandByType.set(resourceType, row);
    const { minCount, maxCount, targetCount } = row;
    if (minCount > maxCount) {
      issues.push(issue(`Demand ${row.resourceType} minCount ${minCount} > maxCount ${maxCount}.`));
    }
    if (targetCount > maxCount) {
      issues.push(
        issue(`Demand ${row.resourceType} targetCount ${targetCount} > maxCount ${maxCount}.`)
      );
    }
    if (row.legalTileCount <= 0) {
      issues.push(
        issue(
          `Demand ${row.resourceType} has zero admitted legal tiles; it must be excluded, not planned.`
        )
      );
    }
  }

  const exclusionByType = new Map<string, ResourceDemandPlanPayload["excluded"][number]>();
  for (const row of value.excluded) {
    const resourceType = row.resourceType;
    if (exclusionByType.has(resourceType)) {
      issues.push(issue(`Exclusion ${resourceType} appears more than once.`));
    }
    exclusionByType.set(resourceType, row);
  }

  const candidateStatusByType = new Map<string, PlannerStatus>();
  for (const group of value.groups.groups) {
    for (const plan of group.plans) {
      const resourceType = plan.resourceType;
      if (candidateStatusByType.has(resourceType)) {
        issues.push(issue(`Planner candidate ${resourceType} appears more than once.`));
      }
      candidateStatusByType.set(resourceType, plan.status);

      const demand = demandByType.get(resourceType);
      const exclusion = exclusionByType.get(resourceType);
      const terminalCount = Number(demand !== undefined) + Number(exclusion !== undefined);
      if (terminalCount !== 1) {
        issues.push(
          issue(
            `Planner candidate ${resourceType} must have exactly one terminal demand or exclusion; found ${terminalCount}.`
          )
        );
      }
      if (demand && plan.status !== "planned") {
        issues.push(
          issue(
            `Demand ${resourceType} requires planner status planned; received ${String(plan.status)}.`
          )
        );
      }
      if (demand) {
        issues.push(...validateDemandPredicate(resourceType, plan.status, value.age));
      }
      if (exclusion) {
        issues.push(
          ...validateExclusionPredicate(resourceType, plan.status, value.age, exclusion.reason)
        );
      }
    }
  }

  for (const resourceType of demandByType.keys()) {
    if (!candidateStatusByType.has(resourceType)) {
      issues.push(issue(`Demand ${resourceType} has no planner candidate.`));
    }
  }
  for (const resourceType of exclusionByType.keys()) {
    if (!candidateStatusByType.has(resourceType)) {
      issues.push(issue(`Exclusion ${resourceType} has no planner candidate.`));
    }
  }
  return issues;
}

function validateDemandPredicate(
  resourceType: string,
  plannerStatus: PlannerStatus,
  age: typeof INITIAL_MAP_RESOURCE_AUTHORING_AGE
): ValidationIssue[] {
  if (plannerStatus !== "planned") return [];
  if (!isOfficialResourceType(resourceType)) {
    return [issue(`Demand ${resourceType} requires membership in the official resource corpus.`)];
  }
  const ageStatus = resourceAgeStatus(resourceType, age);
  return ageStatus === "eligible"
    ? []
    : [
        issue(
          `Demand ${resourceType} requires age-policy status eligible for ${age}; received ${ageStatus}.`
        ),
      ];
}

function validateExclusionPredicate(
  resourceType: string,
  plannerStatus: PlannerStatus,
  artifactAge: typeof INITIAL_MAP_RESOURCE_AUTHORING_AGE,
  reason: ResourceDemandExclusionReason
): ValidationIssue[] {
  const official = isOfficialResourceType(resourceType);
  const ageStatus = official ? resourceAgeStatus(resourceType, artifactAge) : "unknown";

  switch (reason.kind) {
    case "outside-official-resource-corpus":
      return official
        ? [
            issue(
              `Outside-corpus exclusion ${resourceType} requires absence from the official resource corpus.`
            ),
          ]
        : [];
    case "planner-status":
      if (!official) {
        return [
          issue(
            `Planner-status exclusion ${resourceType} requires membership in the official resource corpus.`
          ),
        ];
      }
      return plannerStatus !== "planned" && reason.status === plannerStatus
        ? []
        : [
            issue(
              `Planner-status exclusion ${resourceType} records ${reason.status} but planner status is ${plannerStatus}.`
            ),
          ];
    case "age-policy": {
      const issues: ValidationIssue[] = [];
      if (!official || plannerStatus !== "planned") {
        issues.push(
          issue(
            `Age-policy exclusion ${resourceType} requires a planned candidate in the official resource corpus.`
          )
        );
      }
      if (reason.age !== artifactAge) {
        issues.push(
          issue(
            `Age-policy exclusion ${resourceType} records age ${reason.age} but artifact age is ${artifactAge}.`
          )
        );
      }
      if (ageStatus === "eligible" || reason.status !== ageStatus) {
        issues.push(
          issue(
            `Age-policy exclusion ${resourceType} records ${reason.status} but source policy status is ${ageStatus}.`
          )
        );
      }
      return issues;
    }
    case "no-admitted-legal-tiles":
      return official && plannerStatus === "planned" && ageStatus === "eligible"
        ? []
        : [
            issue(
              `No-admitted-legal-tiles exclusion ${resourceType} requires a planned, official, age-eligible candidate; received planner status ${plannerStatus} and age status ${ageStatus}.`
            ),
          ];
  }
}

function isOfficialResourceType(resourceType: string): resourceType is OfficialResourceType {
  return Object.hasOwn(OFFICIAL_RESOURCE_BY_TYPE, resourceType);
}

function resourceAgeStatus(
  resourceType: OfficialResourceType,
  age: OfficialAgeType
): InitialMapResourceAuthoringStatus | "unknown" {
  return getInitialMapResourcePolicyForType(resourceType, age)?.status ?? "unknown";
}

/**
 * Requires one terminal demand or exclusion per unique planner candidate and derives each terminal
 * predicate from planner status, official-corpus membership, and the artifact age's source policy.
 * Count bounds and positive admitted legal capacity remain mandatory for demand rows.
 */
export function validate(value: unknown): readonly { message: string }[] {
  const schemaIssues = validateArtifactSchema(Schema, value);
  if (schemaIssues.length > 0) return Object.freeze([...schemaIssues]);
  return Object.freeze(validatePayload(value as ResourceDemandPlanPayload));
}
