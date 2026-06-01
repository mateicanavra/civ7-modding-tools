import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Value } from "typebox/value";

import {
  EARTHLIKE_RESOURCE_EXPECTATIONS,
  EARTHLIKE_RESOURCE_EXPECTATIONS_ARTIFACT,
  OFFICIAL_RESOURCE_BY_TYPE,
  OFFICIAL_RESOURCE_TYPE_ORDER,
} from "../../src/domain/resources/index.js";
import {
  ResourceEarthlikeExpectationsArtifactSchema,
  resourceArtifacts,
} from "../../src/recipes/standard/stages/resources/artifacts.js";

const blockedResources = [
  "RESOURCE_CLOVES",
  "RESOURCE_GOLD_DISTANT_LANDS",
  "RESOURCE_LAPIS_LAZULI",
  "RESOURCE_NICKEL",
  "RESOURCE_SILVER_DISTANT_LANDS",
] as const;

const repoRoot = join(import.meta.dir, "../../../..");
const sourceRoot = join(repoRoot, "mods/mod-swooper-maps/src/domain/resources/earthlike-expectations");

describe("resource earthlike expectations artifact", () => {
  it("declares the resource-owned earthlike expectations artifact id", () => {
    expect(resourceArtifacts.earthlikeExpectations.id).toBe(
      "artifact:resources.earthlikeExpectations"
    );
    expect(resourceArtifacts.earthlikeExpectations.name).toBe(
      "resourceEarthlikeExpectations"
    );
  });

  it("covers the official corpus exactly once in corpus order without feature leakage", () => {
    const order = EARTHLIKE_RESOURCE_EXPECTATIONS.map((entry) => entry.resourceType);

    expect(EARTHLIKE_RESOURCE_EXPECTATIONS).toHaveLength(55);
    expect(order).toEqual(OFFICIAL_RESOURCE_TYPE_ORDER);
    expect(new Set(order).size).toBe(55);
    expect(order.every((resourceType) => resourceType.startsWith("RESOURCE_"))).toBe(true);
    expect(order.some((resourceType) => resourceType.startsWith("FEATURE_"))).toBe(false);
    expect(order).not.toContain("FEATURE_LOTUS");
    expect(order).not.toContain("RESOURCE_LOTUS");
  });

  it("preserves corpus refs, official constraints, and unverified runtime boundary", () => {
    for (const row of EARTHLIKE_RESOURCE_EXPECTATIONS) {
      const corpus = OFFICIAL_RESOURCE_BY_TYPE[row.resourceType]!;

      expect(row.corpusRef).toEqual({
        resourceType: corpus.resourceType,
        staticResourceRowSlot: corpus.staticResourceRowSlot,
        runtimeIdStatus: "unverified",
      });
      expect(row.eligibleAges).toEqual(corpus.validAges);
      expect(row.officialConstraintSummary).toEqual(corpus.officialPlacementConstraints);
      expect(row.evidenceStrength.legality).toBe("official");
      expect(row.expectedCountRange.baseline).toBe("standard-earthlike-map");
      expect(row.expectedCountRange.min).toBeLessThanOrEqual(row.expectedCountRange.target);
      expect(row.expectedCountRange.target).toBeLessThanOrEqual(row.expectedCountRange.max);
      expect(Object.hasOwn(row, "runtimeId")).toBe(false);
      expect(Object.hasOwn(row, "resourceId")).toBe(false);
      expect(Object.hasOwn(row, "numericId")).toBe(false);
    }
  });

  it("keeps corpus-blocked resources visible, blocked, and active-zero", () => {
    const blocked = EARTHLIKE_RESOURCE_EXPECTATIONS.filter((entry) => entry.status === "blocked");

    expect(blocked.map((entry) => entry.resourceType).sort()).toEqual([...blockedResources]);
    for (const row of blocked) {
      expect(OFFICIAL_RESOURCE_BY_TYPE[row.resourceType]!.strategyRequired.status).toBe("blocked");
      expect(row.expectedCountRange).toEqual({
        baseline: "standard-earthlike-map",
        min: 0,
        target: 0,
        max: 0,
        evidence: "blocked",
      });
      expect(row.conditionMultipliers).toEqual([]);
      expect(row.operationObligation).toContain("do not place");
      expect(row.statsProof).toContain("zero active expectation");
    }
  });

  it("preserves crabs navigable-river eligibility as a per-resource caveat", () => {
    const crabs = EARTHLIKE_RESOURCE_EXPECTATIONS.find(
      (entry) => entry.resourceType === "RESOURCE_CRABS"
    );

    expect(crabs?.groupId).toBe("aquatic-coastal-navigable-river");
    expect(crabs?.caveats.join("\n")).toContain("NAVIGABLE_RIVERS_ELIGIBLE");
    expect(crabs?.proxyRequirements.join("\n")).toContain("navigable-river");
  });

  it("validates the artifact with a strict schema and rejects overclaims", () => {
    expect(
      Value.Check(ResourceEarthlikeExpectationsArtifactSchema, EARTHLIKE_RESOURCE_EXPECTATIONS_ARTIFACT)
    ).toBe(true);

    const first = EARTHLIKE_RESOURCE_EXPECTATIONS_ARTIFACT.resources[0]!;
    const invalidExtraRuntimeField = {
      ...EARTHLIKE_RESOURCE_EXPECTATIONS_ARTIFACT,
      resources: [{ ...first, runtimeId: { status: "verified", value: 0 } }],
    };
    const invalidFeature = {
      ...EARTHLIKE_RESOURCE_EXPECTATIONS_ARTIFACT,
      resources: [{ ...first, resourceType: "FEATURE_LOTUS" }],
    };
    const invalidStatus = {
      ...EARTHLIKE_RESOURCE_EXPECTATIONS_ARTIFACT,
      resources: [{ ...first, status: "done" }],
    };
    const invalidMissingRangeField = {
      ...EARTHLIKE_RESOURCE_EXPECTATIONS_ARTIFACT,
      resources: [
        {
          ...first,
          expectedCountRange: {
            baseline: "standard-earthlike-map",
            min: 1,
            target: 2,
            evidence: "inference-backed",
          },
        },
      ],
    };
    const invalidBlockedLeak = {
      ...EARTHLIKE_RESOURCE_EXPECTATIONS_ARTIFACT,
      resources: [
        {
          ...EARTHLIKE_RESOURCE_EXPECTATIONS_ARTIFACT.resources.find(
            (entry) => entry.resourceType === "RESOURCE_CLOVES"
          )!,
          expectedCountRange: {
            baseline: "standard-earthlike-map",
            min: 0,
            target: 1,
            max: 3,
            evidence: "inference-backed",
          },
        },
      ],
    };
    const invalidBlockedAsActive = {
      ...EARTHLIKE_RESOURCE_EXPECTATIONS_ARTIFACT,
      resources: [
        {
          ...EARTHLIKE_RESOURCE_EXPECTATIONS_ARTIFACT.resources.find(
            (entry) => entry.resourceType === "RESOURCE_CLOVES"
          )!,
          status: "expected",
          expectedCountRange: {
            baseline: "standard-earthlike-map",
            min: 2,
            target: 3,
            max: 5,
            evidence: "inference-backed",
          },
          conditionMultipliers: ["rainforest up"],
        },
      ],
    };
    const invalidRangeOrdering = {
      ...EARTHLIKE_RESOURCE_EXPECTATIONS_ARTIFACT,
      resources: [
        {
          ...first,
          expectedCountRange: {
            baseline: "standard-earthlike-map",
            min: 10,
            target: 2,
            max: 1,
            evidence: "inference-backed",
          },
        },
      ],
    };
    const invalidRuntimeCalibratedWithoutTelemetry = {
      ...EARTHLIKE_RESOURCE_EXPECTATIONS_ARTIFACT,
      resources: [
        {
          ...first,
          expectedCountRange: {
            ...first.expectedCountRange,
            evidence: "runtime-calibrated",
          },
        },
      ],
    };

    expect(Value.Check(ResourceEarthlikeExpectationsArtifactSchema, invalidExtraRuntimeField)).toBe(false);
    expect(Value.Check(ResourceEarthlikeExpectationsArtifactSchema, invalidFeature)).toBe(false);
    expect(Value.Check(ResourceEarthlikeExpectationsArtifactSchema, invalidStatus)).toBe(false);
    expect(Value.Check(ResourceEarthlikeExpectationsArtifactSchema, invalidMissingRangeField)).toBe(false);
    expect(Value.Check(ResourceEarthlikeExpectationsArtifactSchema, invalidBlockedLeak)).toBe(false);
    expect(Value.Check(ResourceEarthlikeExpectationsArtifactSchema, invalidBlockedAsActive)).toBe(false);
    expect(Value.Check(ResourceEarthlikeExpectationsArtifactSchema, invalidRangeOrdering)).toBe(false);
    expect(Value.Check(ResourceEarthlikeExpectationsArtifactSchema, invalidRuntimeCalibratedWithoutTelemetry)).toBe(false);
  });

  it("keeps the expectation artifact outside placement runtime behavior", () => {
    const source = [
      "index.ts",
      "official-earthlike.ts",
      "types.ts",
    ].map((file) => readFileSync(join(sourceRoot, file), "utf8")).join("\n");

    expect(source).not.toContain("@civ7/adapter");
    expect(source).not.toContain("ResourceBuilder");
    expect(source).not.toContain("placeResourceIntent");
    expect(source).not.toContain("placement/ops");
  });
});
