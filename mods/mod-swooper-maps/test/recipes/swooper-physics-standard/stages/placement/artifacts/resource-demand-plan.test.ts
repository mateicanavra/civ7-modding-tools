import { describe, expect, it } from "bun:test";
import {
  INITIAL_MAP_RESOURCE_AUTHORING_AGE,
  INITIAL_MAP_RESOURCE_AUTHORING_POLICY,
} from "@mapgen/domain/resources";
import type { Static } from "@swooper/mapgen-core/authoring/contracts";

import { artifactModules as placementArtifactModules } from "../../../../../../src/recipes/standard/stages/placement/artifacts/index.js";
import { Schema as ResourceDemandPlanSchema } from "../../../../../../src/recipes/standard/stages/placement/artifacts/resource-demand-plan.artifact.js";

type ResourceDemandPlanPayload = Static<typeof ResourceDemandPlanSchema>;

describe("placement resource-demand-plan artifact", () => {
  it("requires exactly one terminal resource disposition for every planner candidate", () => {
    const missing = resourceDemandPlanPayload();
    missing.excluded = [];
    expect(resourceDemandMessages(missing)).toContain(
      "Planner candidate RESOURCE_CAMELS must have exactly one terminal demand or exclusion; found 0."
    );

    const duplicate = resourceDemandPlanPayload();
    duplicate.excluded.push({
      resourceType: "RESOURCE_FISH",
      reason: { kind: "no-admitted-legal-tiles" },
    });
    expect(resourceDemandMessages(duplicate)).toContain(
      "Planner candidate RESOURCE_FISH must have exactly one terminal demand or exclusion; found 2."
    );

    const extra = resourceDemandPlanPayload();
    extra.excluded.push({
      resourceType: "RESOURCE_IRON",
      reason: { kind: "no-admitted-legal-tiles" },
    });
    expect(resourceDemandMessages(extra)).toContain(
      "Exclusion RESOURCE_IRON has no planner candidate."
    );
  });

  it("admits demands only from planned rows and matches planner-status exclusions", () => {
    const admittedFromBlocked = resourceDemandPlanPayload();
    admittedFromBlocked.groups.groups[0]!.plans[0]!.status = "blocked";
    expect(resourceDemandMessages(admittedFromBlocked)).toContain(
      "Demand RESOURCE_FISH requires planner status planned; received blocked."
    );

    const mismatchedExclusion = resourceDemandPlanPayload();
    mismatchedExclusion.excluded[0]!.reason = {
      kind: "planner-status",
      status: "missing-signal",
    };
    expect(resourceDemandMessages(mismatchedExclusion)).toContain(
      "Planner-status exclusion RESOURCE_CAMELS records missing-signal but planner status is blocked."
    );
  });

  it("admits source-matched age-policy and scenario-capacity exclusions", () => {
    const withheld = INITIAL_MAP_RESOURCE_AUTHORING_POLICY.find(
      ({ status }) => status !== "eligible"
    );
    if (!withheld || withheld.status === "eligible") {
      throw new Error("Resource policy fixture has no age-withheld official resource.");
    }
    const ageExcluded = resourceDemandPlanPayload();
    ageExcluded.groups.groups[0]!.plans[0]!.resourceType = withheld.resourceType;
    ageExcluded.demands = [];
    ageExcluded.excluded = [
      {
        resourceType: withheld.resourceType,
        reason: {
          kind: "age-policy",
          status: withheld.status,
          age: INITIAL_MAP_RESOURCE_AUTHORING_AGE,
        },
      },
      ageExcluded.excluded[0]!,
    ];
    expect(resourceDemandMessages(ageExcluded)).toEqual([]);

    const scenarioExcluded = resourceDemandPlanPayload();
    scenarioExcluded.demands = [];
    scenarioExcluded.excluded = [
      { resourceType: "RESOURCE_FISH", reason: { kind: "no-admitted-legal-tiles" } },
      scenarioExcluded.excluded[0]!,
    ];
    expect(resourceDemandMessages(scenarioExcluded)).toEqual([]);

    const outsideCorpus = resourceDemandPlanPayload();
    outsideCorpus.groups.groups[0]!.plans[0]!.resourceType = "RESOURCE_NOT_OFFICIAL";
    outsideCorpus.demands = [];
    outsideCorpus.excluded = [
      {
        resourceType: "RESOURCE_NOT_OFFICIAL",
        reason: { kind: "outside-official-resource-corpus" },
      },
      outsideCorpus.excluded[0]!,
    ];
    expect(resourceDemandMessages(outsideCorpus)).toEqual([]);
  });

  it("rejects exclusion reasons whose planner, corpus, or age predicate is false", () => {
    const plannedAsPlannerFailure = scenarioExcludedPayload();
    plannedAsPlannerFailure.excluded[0]!.reason = {
      kind: "planner-status",
      status: "blocked",
    };
    expect(resourceDemandMessages(plannedAsPlannerFailure)).toContain(
      "Planner-status exclusion RESOURCE_FISH records blocked but planner status is planned."
    );

    const blockedAsCapacityFailure = resourceDemandPlanPayload();
    blockedAsCapacityFailure.excluded[0]!.reason = { kind: "no-admitted-legal-tiles" };
    expect(resourceDemandMessages(blockedAsCapacityFailure)).toContain(
      "No-admitted-legal-tiles exclusion RESOURCE_CAMELS requires a planned, official, age-eligible candidate; received planner status blocked and age status eligible."
    );

    const officialAsOutsideCorpus = scenarioExcludedPayload();
    officialAsOutsideCorpus.excluded[0]!.reason = {
      kind: "outside-official-resource-corpus",
    };
    expect(resourceDemandMessages(officialAsOutsideCorpus)).toContain(
      "Outside-corpus exclusion RESOURCE_FISH requires absence from the official resource corpus."
    );

    const eligibleAsAgeFailure = scenarioExcludedPayload();
    eligibleAsAgeFailure.excluded[0]!.reason = {
      kind: "age-policy",
      status: "deferred-future-age",
      age: "AGE_ANTIQUITY",
    };
    expect(resourceDemandMessages(eligibleAsAgeFailure)).toContain(
      "Age-policy exclusion RESOURCE_FISH records deferred-future-age but source policy status is eligible."
    );

    const outsideCorpusAsPlannerFailure = resourceDemandPlanPayload();
    outsideCorpusAsPlannerFailure.groups.groups[0]!.plans[0]!.resourceType =
      "RESOURCE_NOT_OFFICIAL";
    outsideCorpusAsPlannerFailure.demands = [];
    outsideCorpusAsPlannerFailure.excluded[0] = {
      resourceType: "RESOURCE_NOT_OFFICIAL",
      reason: { kind: "planner-status", status: "blocked" },
    };
    expect(resourceDemandMessages(outsideCorpusAsPlannerFailure)).toContain(
      "Planner-status exclusion RESOURCE_NOT_OFFICIAL requires membership in the official resource corpus."
    );
  });
});

function resourceDemandMessages(value: ResourceDemandPlanPayload): string[] {
  return placementArtifactModules.resourceDemandPlan.validate(value).map((issue) => issue.message);
}

function scenarioExcludedPayload(): ResourceDemandPlanPayload {
  const value = resourceDemandPlanPayload();
  value.demands = [];
  value.excluded = [
    { resourceType: "RESOURCE_FISH", reason: { kind: "no-admitted-legal-tiles" } },
    value.excluded[0]!,
  ];
  return value;
}

function resourceDemandPlanPayload(): ResourceDemandPlanPayload {
  const plans = [
    {
      resourceType: "RESOURCE_FISH",
      status: "planned" as const,
      proofStatus: "warning-only" as const,
      targetIntentCount: 1,
      eligibleTileCount: 1,
    },
    {
      resourceType: "RESOURCE_CAMELS",
      status: "blocked" as const,
      proofStatus: "warning-only" as const,
      targetIntentCount: 0,
      eligibleTileCount: 0,
    },
  ];
  return {
    age: "AGE_ANTIQUITY",
    minimumAmountModifier: 0,
    groups: {
      artifactId: "artifact:resources.groupPlans",
      proofStatus: "warning-only",
      groupCount: 1,
      resourceCount: 2,
      plannedCount: 1,
      blockedCount: 1,
      missingSignalCount: 0,
      missingExpectationCount: 0,
      targetIntentCount: 1,
      eligibleTileCount: 1,
      duplicateResourceTypes: [],
      missingResourceTypes: [],
      blockers: [],
      groups: [
        {
          groupId: "aquatic-coastal-navigable-river",
          inputGroupId: "aquatic-coastal-navigable-river",
          resourceCount: 2,
          plannedCount: 1,
          blockedCount: 1,
          missingSignalCount: 0,
          missingExpectationCount: 0,
          targetIntentCount: 1,
          eligibleTileCount: 1,
          missingResourceTypes: [],
          blockers: [],
          plans,
        },
      ],
    },
    demands: [
      {
        resourceType: "RESOURCE_FISH",
        family: "aquatic",
        laneId: "coastal-water",
        laneKind: "water",
        weight: 1,
        regionMinimumRequirement: {
          kind: "not-applicable",
          reason: "no-official-minimum",
        },
        targetCount: 1,
        minCount: 0,
        maxCount: 2,
        habitatTileCount: 1,
        legalTileCount: 1,
        eligibleTileCount: 1,
      },
    ],
    excluded: [
      {
        resourceType: "RESOURCE_CAMELS",
        reason: { kind: "planner-status", status: "blocked" },
      },
    ],
  };
}
