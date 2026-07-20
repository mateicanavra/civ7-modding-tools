import { describe, expect, it } from "bun:test";
import { EARTHLIKE_RESOURCE_EXPECTATIONS } from "@mapgen/domain/resources/model/data/earthlike-expectations/index.js";
import resources from "@mapgen/domain/resources/ops";

import { normalizeOperationSelectionForTest, TestCompileError } from "@swooper/mapgen-core/testing";

const CULTIVATED_RESOURCE_TYPES = [
  "RESOURCE_COTTON",
  "RESOURCE_DATES",
  "RESOURCE_DYES",
  "RESOURCE_INCENSE",
  "RESOURCE_SILK",
  "RESOURCE_WINE",
  "RESOURCE_COCOA",
  "RESOURCE_SPICES",
  "RESOURCE_SUGAR",
  "RESOURCE_TEA",
  "RESOURCE_COFFEE",
  "RESOURCE_TOBACCO",
  "RESOURCE_CITRUS",
  "RESOURCE_QUININE",
  "RESOURCE_MANGOS",
  "RESOURCE_RICE",
  "RESOURCE_CLOVES",
  "RESOURCE_FLAX",
] as const;
type CultivatedExpectation = Parameters<
  typeof resources.ops.planCultivatedResources.run
>[0]["expectations"][number];

describe("cultivated resource operation contract", () => {
  it("plans all cultivated resource rows symbolically without runtime ids", () => {
    const syntheticDimensions = { width: 5, height: 5 } as const;
    const { width, height } = syntheticDimensions;
    const size = width * height;
    const selection = normalizeOperationSelectionForTest(
      resources.ops.planCultivatedResources,
      structuredClone(resources.ops.planCultivatedResources.defaultConfig)
    );

    const result = resources.ops.planCultivatedResources.run(
      {
        width,
        height,
        expectations: cultivatedExpectations(),
        warmAlluvialMask: every(size),
        floodplainOrRiverMask: every(size),
        warmGrassPlainsMask: every(size),
        oasisOrDesertWaterMask: every(size),
        aridDryWoodlandMask: every(size),
        coastalMarineMask: every(size),
        humidTropicalForestMask: every(size),
        wetTropicsMask: every(size),
        highlandOrReliefMask: every(size),
        temperateDryPlainsMask: every(size),
        savannaForestMask: every(size),
        tropicalFruitMask: every(size),
        wetlandPaddyMask: every(size),
        coolTemperatePlainsMask: every(size),
        coldMask: new Uint8Array(size),
        aridWithoutWaterMask: new Uint8Array(size),
        waterloggedMask: new Uint8Array(size),
      },
      selection
    );

    expect(result.groupId).toBe("cultivated-plantation-medicinal");
    expect(result.proofStatus).toBe("warning-only");
    expect(result.missingResourceTypes).toEqual([]);
    expect(result.plans.map((plan) => plan.resourceType)).toEqual([...CULTIVATED_RESOURCE_TYPES]);
    expect(result.plans.filter((plan) => plan.status === "planned")).toHaveLength(17);
    expect(result.plans.find((plan) => plan.resourceType === "RESOURCE_CLOVES")?.status).toBe(
      "blocked"
    );

    for (const row of result.plans) {
      expect(Object.hasOwn(row, "resourceId")).toBe(false);
      expect(Object.hasOwn(row, "numericId")).toBe(false);
      expect(Object.hasOwn(row, "preferredResourceType")).toBe(false);
    }
  });

  it("keeps highland and coastal signal requirements visible", () => {
    const syntheticDimensions = { width: 3, height: 3 } as const;
    const { width, height } = syntheticDimensions;
    const size = width * height;
    const highlands = new Uint8Array(size);
    const coast = new Uint8Array(size);
    highlands[4] = 1;
    coast[2] = 1;

    const result = resources.ops.planCultivatedResources.run(
      {
        width,
        height,
        expectations: cultivatedExpectations(),
        highlandOrReliefMask: highlands,
        coastalMarineMask: coast,
      },
      resources.ops.planCultivatedResources.defaultConfig
    );

    const tea = result.plans.find((plan) => plan.resourceType === "RESOURCE_TEA");
    const dyes = result.plans.find((plan) => plan.resourceType === "RESOURCE_DYES");
    expect(tea?.signalFields).toContain("highlandOrReliefMask");
    expect(tea?.signalRequirements).toContain("highland or relief signal");
    expect(tea?.eligibleTileCount).toBe(1);
    expect(dyes?.signalFields).toContain("coastalMarineMask");
    expect(dyes?.laneId).toBe("marine-dye");
    expect(dyes?.signalRequirements).toContain("marine/coast lane despite cultivated group");
    expect(dyes?.eligibleTileCount).toBe(1);
  });

  it("keeps oasis and wetland signal families visible", () => {
    const syntheticDimensions = { width: 3, height: 3 } as const;
    const { width, height } = syntheticDimensions;
    const size = width * height;
    const oasis = new Uint8Array(size);
    const wetland = new Uint8Array(size);
    oasis[0] = 1;
    wetland[8] = 1;

    const result = resources.ops.planCultivatedResources.run(
      {
        width,
        height,
        expectations: cultivatedExpectations(),
        oasisOrDesertWaterMask: oasis,
        wetlandPaddyMask: wetland,
      },
      resources.ops.planCultivatedResources.defaultConfig
    );

    const dates = result.plans.find((plan) => plan.resourceType === "RESOURCE_DATES");
    const rice = result.plans.find((plan) => plan.resourceType === "RESOURCE_RICE");
    expect(dates?.signalFields).toContain("oasisOrDesertWaterMask");
    expect(dates?.eligibleTileCount).toBe(1);
    expect(rice?.signalFields).toContain("wetlandPaddyMask");
    expect(rice?.eligibleTileCount).toBe(1);
  });

  it("keeps blocked cloves visible and active-zero", () => {
    const syntheticDimensions = { width: 2, height: 2 } as const;
    const { width, height } = syntheticDimensions;
    const size = width * height;
    const result = resources.ops.planCultivatedResources.run(
      {
        width,
        height,
        expectations: cultivatedExpectations(),
        warmGrassPlainsMask: every(size),
      },
      resources.ops.planCultivatedResources.defaultConfig
    );

    const cloves = result.plans.find((plan) => plan.resourceType === "RESOURCE_CLOVES");
    expect(cloves).toBeDefined();
    expect(cloves?.status).toBe("blocked");
    expect(cloves?.expectedCountRange).toMatchObject({ min: 0, target: 0, max: 0 });
    expect(cloves?.targetIntentCount).toBe(0);
    expect(cloves?.conditionMultipliers).toEqual([]);
  });

  it("reports missing expectation rows instead of silently dropping resources", () => {
    const syntheticDimensions = { width: 2, height: 2 } as const;
    const { width, height } = syntheticDimensions;
    const size = width * height;
    const result = resources.ops.planCultivatedResources.run(
      {
        width,
        height,
        expectations: cultivatedExpectations().filter(
          (row) => row.resourceType === "RESOURCE_COTTON"
        ),
        warmGrassPlainsMask: every(size),
      },
      resources.ops.planCultivatedResources.defaultConfig
    );

    expect(result.plans).toHaveLength(CULTIVATED_RESOURCE_TYPES.length);
    expect(result.missingResourceTypes).toEqual(CULTIVATED_RESOURCE_TYPES.slice(1));
    expect(result.plans.filter((plan) => plan.status === "missing-expectation")).toHaveLength(17);
  });

  it("does not allow caller config to omit required cultivated resources", () => {
    for (const selector of ["requiredResourceTypes", "resourceTypes", "includeResources"]) {
      expect(() =>
        normalizeOperationSelectionForTest(resources.ops.planCultivatedResources, {
          strategy: "default",
          config: { [selector]: ["RESOURCE_COTTON"] },
        })
      ).toThrow(TestCompileError);
    }
  });

  it("marks active rows as signal gaps when no cultivated signal mask is supplied", () => {
    const syntheticDimensions = { width: 2, height: 2 } as const;
    const { width, height } = syntheticDimensions;
    const result = resources.ops.planCultivatedResources.run(
      {
        width,
        height,
        expectations: cultivatedExpectations(),
      },
      resources.ops.planCultivatedResources.defaultConfig
    );

    expect(result.missingResourceTypes).toEqual([]);
    expect(result.plans.filter((plan) => plan.status === "missing-signal")).toHaveLength(17);
    expect(result.plans.find((plan) => plan.resourceType === "RESOURCE_CLOVES")?.status).toBe(
      "blocked"
    );
    expect(result.plans.every((plan) => plan.rangeStatus === "not-gated")).toBe(true);
  });
});

function cultivatedExpectations(): CultivatedExpectation[] {
  return EARTHLIKE_RESOURCE_EXPECTATIONS.filter(
    (row) => row.groupId === "cultivated-plantation-medicinal"
  ).map((row) => ({
    resourceType: row.resourceType,
    groupId: "cultivated-plantation-medicinal",
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
