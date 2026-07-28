import { describe, expect, it } from "bun:test";
import { type OfficialResourceType, resolveResourceRuntimeIds } from "@civ7/map-policy";
import {
  EARTHLIKE_RESOURCE_EXPECTATIONS,
  getInitialMapResourcePolicyForType,
  INITIAL_MAP_RESOURCE_AUTHORING_AGE,
  RESOURCE_HABITAT_SIGNALS,
  resolveResourceRegionMinimumRequirement,
} from "../../../../../src/domain/resources/index.js";
import { artifacts as resourceDemandArtifacts } from "../../../../../src/domain/resources/modules/demand/artifacts/index.js";
import type { Static } from "@swooper/mapgen-core/authoring/contracts";
import { TEST_MAP_SIZE } from "../../../../setup.js";

type ResourceDemandPlanPayload = Static<
  (typeof resourceDemandArtifacts.resourceDemandPlan)["schema"]
>;
type AdmittedDemand = ResourceDemandPlanPayload["candidates"]["admitted"][number]["demand"];
type AdmittedCandidate = ResourceDemandPlanPayload["candidates"]["admitted"][number];
type TerminalCandidate =
  | ResourceDemandPlanPayload["candidates"]["admitted"][number]
  | ResourceDemandPlanPayload["candidates"]["excluded"]["expectationBlocked"][number]
  | ResourceDemandPlanPayload["candidates"]["excluded"]["ageDeferred"][number]
  | ResourceDemandPlanPayload["candidates"]["excluded"]["noLegalSites"][number];

describe("placement resource-demand-plan artifact", () => {
  it("requires the exact canonical corpus once with source-matched terminal dispositions", () => {
    const baseline = resourceDemandPlanPayload();
    expect(resourceDemandMessages(baseline)).toEqual([]);

    const missing = structuredClone(baseline);
    const removed = missing.candidates.excluded.noLegalSites.shift();
    if (!removed) throw new Error("Missing terminal candidate fixture.");
    expect(resourceDemandMessages(missing)).toEqual(
      expect.arrayContaining([
        `Resource demand ledger has ${EARTHLIKE_RESOURCE_EXPECTATIONS.length - 1} candidates; expected exact official corpus size ${EARTHLIKE_RESOURCE_EXPECTATIONS.length}.`,
        `Resource demand ledger is missing ${removed.source.resourceType}.`,
      ])
    );

    const duplicate = structuredClone(baseline);
    duplicate.candidates.excluded.noLegalSites.push(
      structuredClone(duplicate.candidates.excluded.noLegalSites[0]!)
    );
    expect(resourceDemandMessages(duplicate)).toEqual(
      expect.arrayContaining([
        `Resource demand source ${duplicate.candidates.excluded.noLegalSites[0]!.source.resourceType} appears more than once.`,
        `Resource demand ledger has ${EARTHLIKE_RESOURCE_EXPECTATIONS.length + 1} candidates; expected exact official corpus size ${EARTHLIKE_RESOURCE_EXPECTATIONS.length}.`,
      ])
    );
  });

  it("rejects canonical group, status, range, family, lane, and lane-kind drift", () => {
    const payload = resourceDemandPlanPayload();
    const fish = findNoLegalCandidate(payload, "RESOURCE_FISH");
    Object.assign(fish.source, {
      groupId: "geological-mineral-gemstone-industrial",
      family: "geological",
      laneId: "not-aquatic",
      laneKind: "land",
      expectedCountRange: {
        ...fish.source.expectedCountRange,
        max: fish.source.expectedCountRange.max + 1,
      },
    });

    expect(resourceDemandMessages(payload)).toEqual(
      expect.arrayContaining([
        "Resource demand source RESOURCE_FISH group geological-mineral-gemstone-industrial does not match canonical group aquatic-coastal-navigable-river.",
        "Resource demand source RESOURCE_FISH family geological does not match canonical family aquatic.",
        "Resource demand source RESOURCE_FISH lane not-aquatic does not match canonical lane aquatic.",
        "Resource demand source RESOURCE_FISH lane kind land does not match canonical lane kind water.",
      ])
    );
    expect(
      resourceDemandMessages(payload).some((message) => message.includes("canonical range"))
    ).toBe(true);

    const impossibleStatus = resourceDemandPlanPayload();
    (
      findCandidate(impossibleStatus, "RESOURCE_FISH").source as {
        expectationStatus: string;
      }
    ).expectationStatus = "blocked";
    expect(
      resourceDemandMessages(impossibleStatus).some((message) =>
        message.includes("expectationStatus must be equal to constant")
      )
    ).toBe(true);
  });

  it("binds dimensions, binary habitat evidence, counts, and target derivation", () => {
    const payload = resourceDemandPlanPayload();
    const foreignDimensions = {
      width: TEST_MAP_SIZE.dimensions.width + 1,
      height: TEST_MAP_SIZE.dimensions.height,
    };
    expect(resourceDemandMessages(payload, foreignDimensions)).toContain(
      `resourceDemandPlan dimensions ${payload.width}x${payload.height} do not match execution dimensions ${foreignDimensions.width}x${foreignDimensions.height}.`
    );

    const fish = findNoLegalCandidate(payload, "RESOURCE_FISH");
    fish.source.habitatMask[0] = 2;
    Object.assign(fish.source, {
      habitatTileCount: fish.source.habitatTileCount - 1,
      targetIntentCount: 0,
    });

    expect(resourceDemandMessages(payload)).toEqual(
      expect.arrayContaining([
        "Resource demand RESOURCE_FISH habitatMask[0] is 2; masks admit only 0 or 1.",
        `Resource demand source RESOURCE_FISH habitatTileCount ${fish.source.habitatTileCount} does not match habitatMask count ${fish.source.habitatMask.length}.`,
        `Resource demand source RESOURCE_FISH target 0 does not match canonical habitat-derived target ${EARTHLIKE_RESOURCE_EXPECTATIONS.find((row) => row.resourceType === "RESOURCE_FISH")!.expectedCountRange.target}.`,
      ])
    );
  });

  it("proves no-legal-sites from the persisted legality surface", () => {
    const payload = resourceDemandPlanPayload();
    const fish = findNoLegalCandidate(payload, "RESOURCE_FISH");
    fish.reason.legalMask[0] = 1;

    expect(resourceDemandMessages(payload)).toContain(
      "No-legal-sites disposition RESOURCE_FISH retains 1 legal tiles."
    );
  });

  it("proves admitted legal and intersection counts and preserves partition order", () => {
    const payload = resourceDemandPlanPayload();
    const fish = admitCandidate(payload, "RESOURCE_FISH");
    const size = TEST_MAP_SIZE.dimensions.width * TEST_MAP_SIZE.dimensions.height;
    expect(resourceDemandMessages(payload)).toEqual([]);

    const corruptedDemand = fish.demand as {
      legalTileCount: number;
      eligibleTileCount: number;
    };
    corruptedDemand.legalTileCount -= 1;
    corruptedDemand.eligibleTileCount -= 1;
    expect(resourceDemandMessages(payload)).toEqual(
      expect.arrayContaining([
        `Demand RESOURCE_FISH legalTileCount ${size - 1} does not match legalMask count ${size}.`,
        `Demand RESOURCE_FISH eligibleTileCount ${size - 1} does not match habitat/legal intersection count ${size}.`,
      ])
    );

    const reordered = resourceDemandPlanPayload();
    [reordered.candidates.excluded.noLegalSites[0], reordered.candidates.excluded.noLegalSites[1]] =
      [
        reordered.candidates.excluded.noLegalSites[1]!,
        reordered.candidates.excluded.noLegalSites[0]!,
      ];
    expect(
      resourceDemandMessages(reordered).some((message) =>
        message.includes("noLegalSites partition does not preserve canonical corpus order")
      )
    ).toBe(true);
  });

  it("binds admitted weight and regional policy while rejecting invalid intensity", () => {
    const payload = resourceDemandPlanPayload();
    const gold = admitCandidate(payload, "RESOURCE_GOLD", false);
    expect(resourceDemandMessages(payload)).toEqual([]);

    const resolved = resolveResourceRuntimeIds().byType.get("RESOURCE_GOLD");
    if (!resolved || gold.demand.regionMinimumRequirement.kind === "not-applicable") {
      throw new Error("Missing positive RESOURCE_GOLD regional-minimum policy.");
    }
    const demand = gold.demand as {
      weight: number;
      regionMinimumRequirement: { minimumPerHemisphere: number };
      intensity: Float32Array;
    };
    demand.weight += 1;
    demand.regionMinimumRequirement.minimumPerHemisphere += 1;
    demand.intensity[0] = Number.NaN;
    demand.intensity[1] = 1.25;

    expect(resourceDemandMessages(payload)).toEqual(
      expect.arrayContaining([
        `Demand RESOURCE_GOLD weight ${Math.max(1, resolved.weight) + 1} does not match canonical weight ${Math.max(1, resolved.weight)}.`,
        `Demand RESOURCE_GOLD regional minimum ${resolved.minimumPerHemisphere + 1} does not match canonical minimum ${resolved.minimumPerHemisphere}.`,
        "Demand RESOURCE_GOLD intensity[0] is NaN; intensity must be finite and within [0, 1].",
        "Demand RESOURCE_GOLD intensity[1] is 1.25; intensity must be finite and within [0, 1].",
      ])
    );
  });
});

function resourceDemandMessages(
  value: ResourceDemandPlanPayload,
  dimensions = TEST_MAP_SIZE.dimensions
): string[] {
  return resourceDemandArtifacts.resourceDemandPlan
    .validate(value, { dimensions })
    .map((issue) => issue.message);
}

function resourceDemandPlanPayload(): ResourceDemandPlanPayload {
  const size = TEST_MAP_SIZE.dimensions.width * TEST_MAP_SIZE.dimensions.height;
  const candidates: ResourceDemandPlanPayload["candidates"] = {
    admitted: [],
    excluded: {
      expectationBlocked: [],
      ageDeferred: [],
      noLegalSites: [],
    },
  };

  for (const expectation of EARTHLIKE_RESOURCE_EXPECTATIONS) {
    const identity = {
      resourceType: expectation.resourceType,
      groupId: expectation.groupId,
      expectationStatus: expectation.status,
      expectedCountRange: { ...expectation.expectedCountRange },
    };

    if (expectation.status === "blocked") {
      candidates.excluded.expectationBlocked.push({
        source: { ...identity, expectationStatus: "blocked" },
        reason: { kind: "expectation-blocked" },
      });
      continue;
    }
    const agePolicy = getInitialMapResourcePolicyForType(
      expectation.resourceType,
      INITIAL_MAP_RESOURCE_AUTHORING_AGE
    );
    if (!agePolicy) throw new Error(`Missing age policy for ${expectation.resourceType}.`);
    if (agePolicy.status === "deferred-future-age") {
      candidates.excluded.ageDeferred.push({
        source: { ...identity, expectationStatus: "expected" },
        reason: {
          kind: "age-policy",
          status: "deferred-future-age",
          age: INITIAL_MAP_RESOURCE_AUTHORING_AGE,
        },
      });
      continue;
    }
    if (agePolicy.status !== "eligible") {
      throw new Error(
        `Expected resource ${expectation.resourceType} has impossible age status ${agePolicy.status}.`
      );
    }
    const signal = RESOURCE_HABITAT_SIGNALS.get(expectation.resourceType);
    if (!signal) throw new Error(`Missing signal for ${expectation.resourceType}.`);
    const habitatMask = new Uint8Array(size).fill(1);
    const habitatTileCount = size;
    const source = {
      ...identity,
      expectationStatus: "expected" as const,
      family: signal.family,
      laneId: signal.laneId,
      laneKind: signal.laneKind,
      targetIntentCount: Math.min(
        expectation.expectedCountRange.max,
        habitatTileCount,
        expectation.expectedCountRange.target
      ),
      habitatMask,
      habitatTileCount,
    };
    candidates.excluded.noLegalSites.push({
      source,
      reason: {
        kind: "no-legal-sites",
        legalMask: new Uint8Array(size),
      },
    });
  }

  return {
    width: TEST_MAP_SIZE.dimensions.width,
    height: TEST_MAP_SIZE.dimensions.height,
    age: INITIAL_MAP_RESOURCE_AUTHORING_AGE,
    minimumAmountModifier: 0,
    candidates,
  };
}

function canonicalDemand(
  resourceType: string,
  size: number,
  observedRequiredForAge: boolean | null = null
): AdmittedDemand {
  const resolved = resolveResourceRuntimeIds().byType.get(resourceType as OfficialResourceType);
  if (!resolved) throw new Error(`Missing runtime policy for ${resourceType}.`);
  return {
    weight: Math.max(1, resolved.weight),
    regionMinimumRequirement: resolveResourceRegionMinimumRequirement({
      resourceType: resourceType as OfficialResourceType,
      age: INITIAL_MAP_RESOURCE_AUTHORING_AGE,
      minimumPerHemisphere: resolved.minimumPerHemisphere,
      observedRequiredForAge,
    }),
    legalMask: new Uint8Array(size).fill(1),
    intensity: new Float32Array(size).fill(1),
    legalTileCount: size,
    eligibleTileCount: size,
  };
}

function admitCandidate(
  value: ResourceDemandPlanPayload,
  resourceType: string,
  observedRequiredForAge: boolean | null = null
): AdmittedCandidate {
  const index = value.candidates.excluded.noLegalSites.findIndex(
    (candidate) => candidate.source.resourceType === resourceType
  );
  const [excluded] = value.candidates.excluded.noLegalSites.splice(index, 1);
  if (!excluded || excluded.source.expectationStatus !== "expected") {
    throw new Error(`Missing expected ${resourceType} fixture.`);
  }
  const size = TEST_MAP_SIZE.dimensions.width * TEST_MAP_SIZE.dimensions.height;
  const candidate: AdmittedCandidate = {
    source: excluded.source,
    demand: canonicalDemand(resourceType, size, observedRequiredForAge),
  };
  value.candidates.admitted.push(candidate);
  return candidate;
}

function findCandidate(value: ResourceDemandPlanPayload, resourceType: string): TerminalCandidate {
  const candidate = [
    ...value.candidates.admitted,
    ...value.candidates.excluded.expectationBlocked,
    ...value.candidates.excluded.ageDeferred,
    ...value.candidates.excluded.noLegalSites,
  ].find((row) => row.source.resourceType === resourceType);
  if (!candidate) throw new Error(`Missing ${resourceType} candidate fixture.`);
  return candidate;
}

function findNoLegalCandidate(
  value: ResourceDemandPlanPayload,
  resourceType: string
): ResourceDemandPlanPayload["candidates"]["excluded"]["noLegalSites"][number] {
  const candidate = value.candidates.excluded.noLegalSites.find(
    (row) => row.source.resourceType === resourceType
  );
  if (!candidate) throw new Error(`Missing excluded ${resourceType} fixture.`);
  return candidate;
}
