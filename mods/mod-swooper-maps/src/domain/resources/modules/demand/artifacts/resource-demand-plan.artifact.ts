import {
  OFFICIAL_RESOURCE_BY_TYPE,
  type OfficialAgeType,
  type OfficialResourceType,
} from "@civ7/map-policy";
import { defineArtifact, type Static, Type } from "@swooper/mapgen-core/authoring/contracts";
import {
  type ResourceDemandExclusion,
  type ResourceDemandExclusionReason,
  ResourceDemandExclusionSchema,
  type ResourceDemandSummaryRow,
  ResourceDemandSummaryRowSchema,
} from "../model/atoms/resource-demand.schema.js";
import { ResourceGroupSummarySchema } from "../model/atoms/resource-group-plan.schema.js";
import {
  getInitialMapResourcePolicyForType,
  INITIAL_MAP_RESOURCE_AUTHORING_AGE,
  type InitialMapResourceAuthoringStatus,
} from "../model/policy/initial-map-authoring.js";

type PlannerStatus = Static<typeof ResourceGroupSummarySchema>["plans"][number]["status"];

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
      excluded: Type.Array(ResourceDemandExclusionSchema),
    },
    {
      additionalProperties: false,
      description:
        "Per-resource symbolic demand and admitted legal capacity before deterministic site selection.",
    }
  ),
  refine: (value, { issues }) => {
    const demandByType = new Map<string, ResourceDemandSummaryRow>();
    for (const row of value.demands) {
      if (demandByType.has(row.resourceType)) {
        issues.add(`Demand ${row.resourceType} appears more than once.`);
      }
      demandByType.set(row.resourceType, row);
      if (row.minCount > row.maxCount) {
        issues.add(
          `Demand ${row.resourceType} minCount ${row.minCount} > maxCount ${row.maxCount}.`
        );
      }
      if (row.targetCount > row.maxCount) {
        issues.add(
          `Demand ${row.resourceType} targetCount ${row.targetCount} > maxCount ${row.maxCount}.`
        );
      }
      if (row.legalTileCount <= 0) {
        issues.add(
          `Demand ${row.resourceType} has zero admitted legal tiles; it must be excluded, not planned.`
        );
      }
    }

    const exclusionByType = new Map<string, ResourceDemandExclusion>();
    for (const row of value.excluded) {
      if (exclusionByType.has(row.resourceType)) {
        issues.add(`Exclusion ${row.resourceType} appears more than once.`);
      }
      exclusionByType.set(row.resourceType, row);
    }

    const candidateStatusByType = new Map<string, PlannerStatus>();
    for (const group of value.groups.groups) {
      for (const plan of group.plans) {
        const resourceType = plan.resourceType;
        if (candidateStatusByType.has(resourceType)) {
          issues.add(`Planner candidate ${resourceType} appears more than once.`);
        }
        candidateStatusByType.set(resourceType, plan.status);

        const demand = demandByType.get(resourceType);
        const exclusion = exclusionByType.get(resourceType);
        const terminalCount = Number(demand !== undefined) + Number(exclusion !== undefined);
        if (terminalCount !== 1) {
          issues.add(
            `Planner candidate ${resourceType} must have exactly one terminal demand or exclusion; found ${terminalCount}.`
          );
        }
        if (demand && plan.status !== "planned") {
          issues.add(
            `Demand ${resourceType} requires planner status planned; received ${String(plan.status)}.`
          );
        }
        if (demand) {
          validateDemandPredicate(resourceType, plan.status, value.age, issues.add);
        }
        if (exclusion) {
          validateExclusionPredicate(
            resourceType,
            plan.status,
            value.age,
            exclusion.reason,
            issues.add
          );
        }
      }
    }

    for (const resourceType of demandByType.keys()) {
      if (!candidateStatusByType.has(resourceType)) {
        issues.add(`Demand ${resourceType} has no planner candidate.`);
      }
    }
    for (const resourceType of exclusionByType.keys()) {
      if (!candidateStatusByType.has(resourceType)) {
        issues.add(`Exclusion ${resourceType} has no planner candidate.`);
      }
    }
  },
});

function validateDemandPredicate(
  resourceType: string,
  plannerStatus: PlannerStatus,
  age: typeof INITIAL_MAP_RESOURCE_AUTHORING_AGE,
  addIssue: (message: string) => void
): void {
  if (plannerStatus !== "planned") return;
  if (!isOfficialResourceType(resourceType)) {
    addIssue(`Demand ${resourceType} requires membership in the official resource corpus.`);
    return;
  }
  const ageStatus = resourceAgeStatus(resourceType, age);
  if (ageStatus !== "eligible") {
    addIssue(
      `Demand ${resourceType} requires age-policy status eligible for ${age}; received ${ageStatus}.`
    );
  }
}

function validateExclusionPredicate(
  resourceType: string,
  plannerStatus: PlannerStatus,
  artifactAge: typeof INITIAL_MAP_RESOURCE_AUTHORING_AGE,
  reason: ResourceDemandExclusionReason,
  addIssue: (message: string) => void
): void {
  const official = isOfficialResourceType(resourceType);
  const ageStatus = official ? resourceAgeStatus(resourceType, artifactAge) : "unknown";

  switch (reason.kind) {
    case "outside-official-resource-corpus":
      if (official) {
        addIssue(
          `Outside-corpus exclusion ${resourceType} requires absence from the official resource corpus.`
        );
      }
      return;
    case "planner-status":
      if (!official) {
        addIssue(
          `Planner-status exclusion ${resourceType} requires membership in the official resource corpus.`
        );
        return;
      }
      if (plannerStatus === "planned" || reason.status !== plannerStatus) {
        addIssue(
          `Planner-status exclusion ${resourceType} records ${reason.status} but planner status is ${plannerStatus}.`
        );
      }
      return;
    case "age-policy": {
      if (!official || plannerStatus !== "planned") {
        addIssue(
          `Age-policy exclusion ${resourceType} requires a planned candidate in the official resource corpus.`
        );
      }
      if (reason.age !== artifactAge) {
        addIssue(
          `Age-policy exclusion ${resourceType} records age ${reason.age} but artifact age is ${artifactAge}.`
        );
      }
      if (ageStatus === "eligible" || reason.status !== ageStatus) {
        addIssue(
          `Age-policy exclusion ${resourceType} records ${reason.status} but source policy status is ${ageStatus}.`
        );
      }
      return;
    }
    case "no-admitted-legal-tiles":
      if (!official || plannerStatus !== "planned" || ageStatus !== "eligible") {
        addIssue(
          `No-admitted-legal-tiles exclusion ${resourceType} requires a planned, official, age-eligible candidate; received planner status ${plannerStatus} and age status ${ageStatus}.`
        );
      }
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
