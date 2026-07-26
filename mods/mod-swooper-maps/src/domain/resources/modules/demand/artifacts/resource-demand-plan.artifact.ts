import {
  OFFICIAL_RESOURCE_BY_TYPE,
  type OfficialAgeType,
  type OfficialResourceType,
} from "@civ7/map-policy";
import {
  ResourceFamilySchema,
  ResourceSymbolSchema,
} from "../../../model/atoms/resource-family.schema.js";
import { ResourceRegionMinimumRequirementSchema } from "../../../model/atoms/region-minimum-requirement.schema.js";
import { ResourceGroupSummarySchema } from "../model/atoms/resource-group-plan.schema.js";
import {
  getInitialMapResourcePolicyForType,
  INITIAL_MAP_RESOURCE_AUTHORING_AGE,
  type InitialMapResourceAuthoringStatus,
} from "../model/policy/initial-map-authoring.js";
import {
  type ArtifactValidationIssue,
  defineArtifact,
  type Static,
  Type,
} from "@swooper/mapgen-core/authoring/contracts";

const ResourceDemandSummaryRowSchema = Type.Object(
  {
    resourceType: ResourceSymbolSchema,
    family: ResourceFamilySchema,
    laneId: Type.String(),
    laneKind: Type.Union([Type.Literal("land"), Type.Literal("water")]),
    weight: Type.Number({ minimum: 1 }),
    regionMinimumRequirement: ResourceRegionMinimumRequirementSchema,
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
const ResourceDemandExclusionReasonSchema = Type.Union([
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

type ResourceDemandExclusionReason = Static<typeof ResourceDemandExclusionReasonSchema>;
type ResourceDemandRow = Static<typeof ResourceDemandSummaryRowSchema>;
type ResourceGroupSummary = Static<typeof ResourceGroupSummarySchema>;
type ResourceDemandPlanPayload = Readonly<{
  age: typeof INITIAL_MAP_RESOURCE_AUTHORING_AGE;
  minimumAmountModifier: number;
  groups: Readonly<{ groups: readonly ResourceGroupSummary[] }>;
  demands: readonly ResourceDemandRow[];
  excluded: readonly Readonly<{
    resourceType: string;
    reason: ResourceDemandExclusionReason;
  }>[];
}>;
type PlannerStatus =
  ResourceDemandPlanPayload["groups"]["groups"][number]["plans"][number]["status"];

/** Registers symbolic per-resource demand and eligibility before site selection. */
export const artifact = defineArtifact({
  name: "resourceDemandPlan",
  id: "artifact:placement.resourceDemandPlan",
  schema: Type.Object(
    {
      age: Type.Literal(INITIAL_MAP_RESOURCE_AUTHORING_AGE),
      minimumAmountModifier: Type.Integer(),
      groups: Type.Object(
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
            "Warning-only reconciliation of the four symbolic resource-family demand branches.",
        }
      ),
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
        "Per-resource symbolic demand and admitted legal capacity before deterministic site selection.",
    }
  ),
  refine: (input): readonly ArtifactValidationIssue[] => {
    const value = input as ResourceDemandPlanPayload;
    const issues: ArtifactValidationIssue[] = [];

    const demandByType = new Map<string, ResourceDemandRow>();
    for (const row of value.demands) {
      if (demandByType.has(row.resourceType)) {
        issues.push(issue(`Demand ${row.resourceType} appears more than once.`));
      }
      demandByType.set(row.resourceType, row);
      if (row.minCount > row.maxCount) {
        issues.push(
          issue(`Demand ${row.resourceType} minCount ${row.minCount} > maxCount ${row.maxCount}.`)
        );
      }
      if (row.targetCount > row.maxCount) {
        issues.push(
          issue(
            `Demand ${row.resourceType} targetCount ${row.targetCount} > maxCount ${row.maxCount}.`
          )
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
      if (exclusionByType.has(row.resourceType)) {
        issues.push(issue(`Exclusion ${row.resourceType} appears more than once.`));
      }
      exclusionByType.set(row.resourceType, row);
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
  },
});

function issue(message: string): ArtifactValidationIssue {
  return { message };
}

function validateDemandPredicate(
  resourceType: string,
  plannerStatus: PlannerStatus,
  age: typeof INITIAL_MAP_RESOURCE_AUTHORING_AGE
): ArtifactValidationIssue[] {
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
): ArtifactValidationIssue[] {
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
      const issues: ArtifactValidationIssue[] = [];
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
