import { createStrategy } from "@swooper/mapgen-core/authoring";

import PlanResourceGroupsContract from "../contract.js";

type ResourceGroupId =
  | "aquatic-coastal-navigable-river"
  | "cultivated-plantation-medicinal"
  | "terrestrial-animal-forest-wild"
  | "geological-mineral-gemstone-industrial";

type ResourceRowStatus = "planned" | "blocked" | "missing-expectation" | "missing-signal";

type ResourcePlanRow = {
  readonly resourceType: string;
  readonly status: ResourceRowStatus;
  readonly proofStatus: "warning-only";
  readonly targetIntentCount: number;
  readonly eligibleTileCount: number;
};

type ResourceGroupPlan = {
  readonly groupId: ResourceGroupId;
  readonly plans: readonly ResourcePlanRow[];
  readonly missingResourceTypes: readonly string[];
};

const EXPECTED_INPUT_GROUPS = [
  ["aquaticPlan", "aquatic-coastal-navigable-river"],
  ["cultivatedPlan", "cultivated-plantation-medicinal"],
  ["terrestrialPlan", "terrestrial-animal-forest-wild"],
  ["geologicalPlan", "geological-mineral-gemstone-industrial"],
] as const satisfies readonly (readonly [string, ResourceGroupId])[];

export const defaultStrategy = createStrategy(PlanResourceGroupsContract, "default", {
  run: (input) => {
    const seenResources = new Map<string, ResourceGroupId>();
    const duplicateResourceTypes = new Set<string>();
    const groups = [];
    const blockers = [];

    for (const [inputField, expectedGroupId] of EXPECTED_INPUT_GROUPS) {
      const groupPlan = input[inputField] as ResourceGroupPlan;
      if (groupPlan.groupId !== expectedGroupId) {
        blockers.push(`${inputField} supplied ${groupPlan.groupId}; expected ${expectedGroupId}.`);
      }

      for (const row of groupPlan.plans) {
        const priorExpectedGroup = seenResources.get(row.resourceType);
        if (priorExpectedGroup) {
          duplicateResourceTypes.add(row.resourceType);
          if (priorExpectedGroup === expectedGroupId) {
            blockers.push(`${row.resourceType} appears more than once in ${expectedGroupId}.`);
          } else {
            blockers.push(
              `${row.resourceType} appears in both ${priorExpectedGroup} and ${expectedGroupId}.`
            );
          }
        }
        seenResources.set(row.resourceType, expectedGroupId);
      }

      groups.push(summarizeGroup(expectedGroupId, groupPlan));
    }

    const totals = summarizeTotals(groups);
    const missingResourceTypes = uniqueSorted(
      groups.flatMap((group) => group.missingResourceTypes)
    );

    return {
      artifactId: "artifact:resources.groupPlans" as const,
      proofStatus: "warning-only" as const,
      groupCount: groups.length,
      ...totals,
      duplicateResourceTypes: [...duplicateResourceTypes].sort(),
      missingResourceTypes,
      blockers,
      groups,
    };
  },
});

function summarizeGroup(expectedGroupId: ResourceGroupId, groupPlan: ResourceGroupPlan) {
  const statusCounts = countStatuses(groupPlan.plans);
  const missingResourceTypes = uniqueSorted(groupPlan.missingResourceTypes);
  const blockers = [];

  if (missingResourceTypes.length > 0) {
    blockers.push(
      `${expectedGroupId} has missing expectation rows: ${missingResourceTypes.join(", ")}.`
    );
  }

  return {
    groupId: expectedGroupId,
    inputGroupId: groupPlan.groupId,
    resourceCount: groupPlan.plans.length,
    plannedCount: statusCounts.planned,
    blockedCount: statusCounts.blocked,
    missingSignalCount: statusCounts["missing-signal"],
    missingExpectationCount: statusCounts["missing-expectation"],
    targetIntentCount: sum(groupPlan.plans.map((row) => row.targetIntentCount)),
    eligibleTileCount: sum(groupPlan.plans.map((row) => row.eligibleTileCount)),
    missingResourceTypes,
    blockers,
    plans: groupPlan.plans.map((row) => ({ ...row })),
  };
}

function summarizeTotals(groups: readonly ReturnType<typeof summarizeGroup>[]) {
  return {
    resourceCount: sum(groups.map((group) => group.resourceCount)),
    plannedCount: sum(groups.map((group) => group.plannedCount)),
    blockedCount: sum(groups.map((group) => group.blockedCount)),
    missingSignalCount: sum(groups.map((group) => group.missingSignalCount)),
    missingExpectationCount: sum(groups.map((group) => group.missingExpectationCount)),
    targetIntentCount: sum(groups.map((group) => group.targetIntentCount)),
    eligibleTileCount: sum(groups.map((group) => group.eligibleTileCount)),
  };
}

function countStatuses(rows: readonly ResourcePlanRow[]): Record<ResourceRowStatus, number> {
  return {
    planned: rows.filter((row) => row.status === "planned").length,
    blocked: rows.filter((row) => row.status === "blocked").length,
    "missing-expectation": rows.filter((row) => row.status === "missing-expectation").length,
    "missing-signal": rows.filter((row) => row.status === "missing-signal").length,
  };
}

function sum(values: readonly number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

function uniqueSorted(values: readonly string[]): string[] {
  return [...new Set(values)].sort();
}
