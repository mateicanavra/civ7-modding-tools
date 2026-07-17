import { describe, expect, it } from "bun:test";
import {
  INITIAL_MAP_RESOURCE_AUTHORING_AGE,
  INITIAL_MAP_RESOURCE_AUTHORING_POLICY,
} from "@mapgen/domain/resources";
import type { Static } from "@swooper/mapgen-core/authoring/contracts";

import { artifactModules as ecologyArtifactModules } from "../../../../src/recipes/standard/stages/ecology/artifacts/index.js";
import { artifactModules as hydrologyHydrographyArtifactModules } from "../../../../src/recipes/standard/stages/hydrology-hydrography/artifacts/index.js";
import { artifactModules as morphologyArtifactModules } from "../../../../src/recipes/standard/stages/morphology/artifacts/index.js";
import { artifactModules as placementArtifactModules } from "../../../../src/recipes/standard/stages/placement/artifacts/index.js";
import { Schema as ResourceDemandPlanSchema } from "../../../../src/recipes/standard/stages/placement/artifacts/resource-demand-plan.artifact.js";

const dimensions = { width: 1, height: 1 } as const;
type ResourceDemandPlanPayload = Static<typeof ResourceDemandPlanSchema>;

describe("metric source artifact validation", () => {
  it("refuses unknown biome indices and non-finite classifier fields", () => {
    const payload = biomePayload();
    payload.biomeIndex[0] = 8;
    payload.effectiveMoisture[0] = Number.NaN;

    const messages = ecologyArtifactModules.biomeClassification
      .validate(payload, { dimensions })
      .map((issue) => issue.message);
    expect(messages.some((message) => message.includes("closed biome vocabulary"))).toBe(true);
    expect(messages.some((message) => message.includes("effectiveMoisture"))).toBe(true);
  });

  it("admits the explicit biome sentinel at the artifact boundary", () => {
    const value = biomePayload();
    value.biomeIndex[0] = 255;

    expect(ecologyArtifactModules.biomeClassification.validate(value, { dimensions })).toEqual([]);
  });

  it("refuses nonbinary orographic region masks", () => {
    const payload = {
      mountainMask: new Uint8Array(1),
      mountainRegionMask: new Uint8Array([2]),
      mountainRegionIdByTile: new Int32Array([-1]),
      hillMask: new Uint8Array(1),
      foothillMask: new Uint8Array(1),
      roughLandMask: new Uint8Array(1),
      orogenyPotential: new Uint8Array(1),
      fracturePotential: new Uint8Array(1),
      roughnessPotential: new Uint8Array(1),
    };

    expect(
      morphologyArtifactModules.mountains
        .validate(payload, { dimensions })
        .some((issue) => issue.message.includes("mountainRegionMask"))
    ).toBe(true);
  });

  it("refuses wrong mountain-field constructors and map-size mismatches", () => {
    const payload = mountainPayload() as Record<string, unknown>;
    payload.orogenyPotential = [0];
    payload.roughnessPotential = new Uint8Array(2);

    const messages = morphologyArtifactModules.mountains
      .validate(payload, { dimensions })
      .map((issue) => issue.message);
    expect(messages.some((message) => message.includes("orogenyPotential to be Uint8Array"))).toBe(
      true
    );
    expect(messages.some((message) => message.includes("roughnessPotential length 1"))).toBe(true);
  });

  it("refuses nonbinary outlets and unknown terminal classes", () => {
    const payload = hydrographyPayload();
    payload.outletMask[0] = 2;
    payload.terminalType[0] = 3;

    const messages = hydrologyHydrographyArtifactModules.hydrography
      .validate(payload, { dimensions })
      .map((issue) => issue.message);
    expect(messages.some((message) => message.includes("outletMask"))).toBe(true);
    expect(messages.some((message) => message.includes("terminalType"))).toBe(true);
  });

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

function biomePayload() {
  return {
    width: 1,
    height: 1,
    biomeIndex: new Uint8Array(1),
    vegetationDensity: new Float32Array(1),
    effectiveMoisture: new Float32Array(1),
    surfaceTemperature: new Float32Array(1),
    aridityIndex: new Float32Array(1),
    freezeIndex: new Float32Array(1),
    groundIce01: new Float32Array(1),
    permafrost01: new Float32Array(1),
    meltPotential01: new Float32Array(1),
    treeLine01: new Float32Array(1),
  };
}

function mountainPayload() {
  return {
    mountainMask: new Uint8Array(1),
    mountainRegionMask: new Uint8Array(1),
    mountainRegionIdByTile: new Int32Array([-1]),
    hillMask: new Uint8Array(1),
    foothillMask: new Uint8Array(1),
    roughLandMask: new Uint8Array(1),
    orogenyPotential: new Uint8Array(1),
    fracturePotential: new Uint8Array(1),
    roughnessPotential: new Uint8Array(1),
  };
}

function hydrographyPayload() {
  return {
    runoff: new Float32Array(1),
    discharge: new Float32Array(1),
    riverClass: new Uint8Array(1),
    flowDir: new Int32Array([-1]),
    sinkMask: new Uint8Array(1),
    outletMask: new Uint8Array(1),
    terminalType: new Uint8Array(1),
  };
}

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
        minimumPerHemisphere: 0,
        requiredForAge: false,
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
