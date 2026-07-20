import { describe, expect, it } from "bun:test";
import { EARTHLIKE_RESOURCE_EXPECTATIONS } from "@mapgen/domain/resources/model/data/earthlike-expectations/index.js";
import resources from "@mapgen/domain/resources/ops";

import { normalizeOperationSelectionForTest, TestCompileError } from "@swooper/mapgen-core/testing";
import { TEST_MAP_SIZE } from "../../../map-size.js";

const AQUATIC_RESOURCE_TYPES = [
  "RESOURCE_FISH",
  "RESOURCE_PEARLS",
  "RESOURCE_WHALES",
  "RESOURCE_CRABS",
  "RESOURCE_COWRIE",
  "RESOURCE_TURTLES",
] as const;
type AquaticExpectation = Parameters<
  typeof resources.ops.planAquaticResources.run
>[0]["expectations"][number];

describe("aquatic resource operation contract", () => {
  it("plans all aquatic resource rows symbolically without runtime ids", () => {
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const size = width * height;
    const selection = normalizeOperationSelectionForTest(
      resources.ops.planAquaticResources,
      structuredClone(resources.ops.planAquaticResources.defaultConfig)
    );

    const result = resources.ops.planAquaticResources.run(
      {
        width,
        height,
        expectations: aquaticExpectations(),
        coastalWaterMask: every(size),
        shelfMask: every(size),
        warmShallowWaterMask: every(size),
        coldProductiveWaterMask: every(size),
        reefOrProtectedShallowsMask: every(size),
        estuaryMask: every(size),
        navigableRiverMouthMask: every(size),
        lakeMask: new Uint8Array(size),
        iceMask: new Uint8Array(size),
      },
      selection
    );

    expect(result.groupId).toBe("aquatic-coastal-navigable-river");
    expect(result.proofStatus).toBe("warning-only");
    expect(result.missingResourceTypes).toEqual([]);
    expect(result.plans.map((plan) => plan.resourceType)).toEqual([...AQUATIC_RESOURCE_TYPES]);
    expect(result.plans.every((plan) => plan.status === "planned")).toBe(true);
    expect(result.plans.every((plan) => plan.eligibilityStatus === "observed")).toBe(true);
    expect(
      result.plans.every((plan) => plan.targetIntentCount === plan.expectedCountRange.target)
    ).toBe(true);

    for (const row of result.plans) {
      expect(Object.hasOwn(row, "resourceId")).toBe(false);
      expect(Object.hasOwn(row, "numericId")).toBe(false);
      expect(Object.hasOwn(row, "preferredResourceType")).toBe(false);
    }
  });

  it("keeps crabs navigable-river signal visible", () => {
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const size = width * height;
    const riverMouths = new Uint8Array(size);
    riverMouths[4] = 1;

    const result = resources.ops.planAquaticResources.run(
      {
        width,
        height,
        expectations: aquaticExpectations(),
        navigableRiverMouthMask: riverMouths,
      },
      resources.ops.planAquaticResources.defaultConfig
    );

    const crabs = result.plans.find((plan) => plan.resourceType === "RESOURCE_CRABS");
    expect(crabs).toBeDefined();
    expect(crabs?.signalFields).toContain("navigableRiverMouthMask");
    expect(crabs?.signalRequirements).toContain("navigable-river mouth or floodplain signal");
    expect(crabs?.eligibleTileCount).toBe(1);
    expect(crabs?.status).toBe("planned");
  });

  it("reports missing expectation rows instead of silently dropping resources", () => {
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const size = width * height;
    const result = resources.ops.planAquaticResources.run(
      {
        width,
        height,
        expectations: aquaticExpectations().filter((row) => row.resourceType === "RESOURCE_FISH"),
        coastalWaterMask: every(size),
      },
      resources.ops.planAquaticResources.defaultConfig
    );

    expect(result.plans).toHaveLength(AQUATIC_RESOURCE_TYPES.length);
    expect(result.missingResourceTypes).toEqual([
      "RESOURCE_PEARLS",
      "RESOURCE_WHALES",
      "RESOURCE_CRABS",
      "RESOURCE_COWRIE",
      "RESOURCE_TURTLES",
    ]);
    expect(result.plans.filter((plan) => plan.status === "missing-expectation")).toHaveLength(5);
  });

  it("does not allow caller config to omit required aquatic resources", () => {
    expect(() =>
      normalizeOperationSelectionForTest(resources.ops.planAquaticResources, {
        strategy: "default",
        config: { requiredResourceTypes: ["RESOURCE_FISH"] },
      })
    ).toThrow(TestCompileError);
  });

  it("marks rows as signal gaps when no aquatic signal mask is supplied", () => {
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const result = resources.ops.planAquaticResources.run(
      {
        width,
        height,
        expectations: aquaticExpectations(),
      },
      resources.ops.planAquaticResources.defaultConfig
    );

    expect(result.missingResourceTypes).toEqual([]);
    expect(result.plans.every((plan) => plan.status === "missing-signal")).toBe(true);
    expect(result.plans.every((plan) => plan.rangeStatus === "not-gated")).toBe(true);
    expect(result.plans.every((plan) => plan.targetIntentCount === 0)).toBe(true);
  });
});

function aquaticExpectations(): AquaticExpectation[] {
  return EARTHLIKE_RESOURCE_EXPECTATIONS.filter(
    (row) => row.groupId === "aquatic-coastal-navigable-river"
  ).map((row) => ({
    resourceType: row.resourceType,
    groupId: "aquatic-coastal-navigable-river",
    status: row.status,
    earthlikePredicate: row.earthlikePredicate,
    expectedCountRange: { ...row.expectedCountRange },
    conditionMultipliers: [...row.conditionMultipliers],
    signalRequirements: [...row.signalRequirements],
    caveats: [...row.caveats],
  }));
}

function every(size: number): Uint8Array {
  return new Uint8Array(size).fill(1);
}
