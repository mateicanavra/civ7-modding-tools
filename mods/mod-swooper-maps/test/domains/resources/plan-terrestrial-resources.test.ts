import { describe, expect, it } from "bun:test";
import { EARTHLIKE_RESOURCE_EXPECTATIONS } from "@mapgen/domain/resources/model/data/earthlike-expectations/index.js";
import resources from "@mapgen/domain/resources/ops";

import { normalizeOpSelectionOrThrow, TestCompileError } from "../../support/compiler-helpers.js";

const TERRESTRIAL_RESOURCE_TYPES = [
  "RESOURCE_CAMELS",
  "RESOURCE_HIDES",
  "RESOURCE_HORSES",
  "RESOURCE_WOOL",
  "RESOURCE_IVORY",
  "RESOURCE_FURS",
  "RESOURCE_TRUFFLES",
  "RESOURCE_RUBBER",
  "RESOURCE_HARDWOOD",
  "RESOURCE_WILD_GAME",
  "RESOURCE_LLAMAS",
] as const;
type TerrestrialExpectation = Parameters<
  typeof resources.ops.planTerrestrialResources.run
>[0]["expectations"][number];

describe("terrestrial resource operation contract", () => {
  it("plans all terrestrial resource rows symbolically without runtime ids", () => {
    const width = 5;
    const height = 5;
    const size = width * height;
    const selection = normalizeOpSelectionOrThrow(
      resources.ops.planTerrestrialResources,
      structuredClone(resources.ops.planTerrestrialResources.defaultConfig)
    );

    const result = resources.ops.planTerrestrialResources.run(
      {
        width,
        height,
        expectations: terrestrialExpectations(),
        aridRangelandMask: every(size),
        openGrassPlainsMask: every(size),
        tundraColdEdgeMask: every(size),
        hillHighlandMask: every(size),
        savannaWateringHoleMask: every(size),
        tropicalForestEdgeMask: every(size),
        taigaBorealForestMask: every(size),
        moistWoodlandEdgeMask: every(size),
        tropicalForestMask: every(size),
        diverseWildHabitatMask: every(size),
        tropicalHighlandMask: every(size),
        coldMask: new Uint8Array(size),
        aridWithoutWaterMask: new Uint8Array(size),
        denseForestMask: new Uint8Array(size),
        cultivatedPressureMask: new Uint8Array(size),
      },
      selection
    );

    expect(result.groupId).toBe("terrestrial-animal-forest-wild");
    expect(result.proofStatus).toBe("warning-only");
    expect(result.missingResourceTypes).toEqual([]);
    expect(result.plans.map((plan) => plan.resourceType)).toEqual([...TERRESTRIAL_RESOURCE_TYPES]);
    expect(result.plans.every((plan) => plan.status === "planned")).toBe(true);

    for (const row of result.plans) {
      expect(Object.hasOwn(row, "resourceId")).toBe(false);
      expect(Object.hasOwn(row, "numericId")).toBe(false);
      expect(Object.hasOwn(row, "preferredResourceType")).toBe(false);
    }
  });

  it("keeps woodland-host and tropical-highland signal requirements visible", () => {
    const width = 3;
    const height = 3;
    const size = width * height;
    const woodland = new Uint8Array(size);
    const tropicalHighland = new Uint8Array(size);
    woodland[4] = 1;
    tropicalHighland[7] = 1;

    const result = resources.ops.planTerrestrialResources.run(
      {
        width,
        height,
        expectations: terrestrialExpectations(),
        moistWoodlandEdgeMask: woodland,
        tropicalHighlandMask: tropicalHighland,
      },
      resources.ops.planTerrestrialResources.defaultConfig
    );

    const truffles = result.plans.find((plan) => plan.resourceType === "RESOURCE_TRUFFLES");
    const llamas = result.plans.find((plan) => plan.resourceType === "RESOURCE_LLAMAS");
    expect(truffles?.laneId).toBe("woodland-host");
    expect(truffles?.signalFields).toContain("moistWoodlandEdgeMask");
    expect(truffles?.signalRequirements).toContain("woodland or host-tree signal");
    expect(truffles?.eligibleTileCount).toBe(1);
    expect(llamas?.laneId).toBe("tropical-highland-pastoral");
    expect(llamas?.signalFields).toContain("tropicalHighlandMask");
    expect(llamas?.signalRequirements).toContain("tropical hill or highland candidate histogram");
    expect(llamas?.eligibleTileCount).toBe(1);
  });

  it("keeps ivory on savanna or forest-edge proxies instead of broad tropical forest", () => {
    const width = 3;
    const height = 3;
    const size = width * height;
    const forestEdge = new Uint8Array(size);
    forestEdge[5] = 1;

    const result = resources.ops.planTerrestrialResources.run(
      {
        width,
        height,
        expectations: terrestrialExpectations(),
        tropicalForestEdgeMask: forestEdge,
        tropicalForestMask: every(size),
      },
      resources.ops.planTerrestrialResources.defaultConfig
    );

    const ivory = result.plans.find((plan) => plan.resourceType === "RESOURCE_IVORY");
    expect(ivory?.laneId).toBe("savanna-megafauna");
    expect(ivory?.signalFields).toContain("tropicalForestEdgeMask");
    expect(ivory?.signalFields).not.toContain("tropicalForestMask");
    expect(ivory?.eligibleTileCount).toBe(1);
  });

  it("keeps synthetic blocked rows visible and active-zero", () => {
    const expectations = terrestrialExpectations();
    const camels = expectations.find((row) => row.resourceType === "RESOURCE_CAMELS");
    expect(camels).toBeDefined();
    const result = resources.ops.planTerrestrialResources.run(
      {
        width: 2,
        height: 2,
        expectations: [
          {
            ...camels!,
            status: "blocked",
            expectedCountRange: {
              baseline: "standard-earthlike-map",
              min: 0,
              target: 0,
              max: 0,
              evidence: "blocked",
            },
            conditionMultipliers: [],
          },
          ...expectations.filter((row) => row.resourceType !== "RESOURCE_CAMELS"),
        ],
        aridRangelandMask: every(4),
      },
      resources.ops.planTerrestrialResources.defaultConfig
    );

    const camelsRow = result.plans.find((plan) => plan.resourceType === "RESOURCE_CAMELS");
    expect(camelsRow?.status).toBe("blocked");
    expect(camelsRow?.targetIntentCount).toBe(0);
    expect(camelsRow?.eligibleTileCount).toBe(0);
    expect(camelsRow?.rangeStatus).toBe("not-gated");
  });

  it("suppression masks reduce observed eligibility", () => {
    const size = 4;
    const open = every(size);
    const denseForest = new Uint8Array(size);
    const cultivated = new Uint8Array(size);
    denseForest[0] = 1;
    cultivated[1] = 1;

    const result = resources.ops.planTerrestrialResources.run(
      {
        width: 2,
        height: 2,
        expectations: terrestrialExpectations(),
        openGrassPlainsMask: open,
        diverseWildHabitatMask: open,
        denseForestMask: denseForest,
        cultivatedPressureMask: cultivated,
      },
      resources.ops.planTerrestrialResources.defaultConfig
    );

    expect(
      result.plans.find((plan) => plan.resourceType === "RESOURCE_HORSES")?.eligibleTileCount
    ).toBe(3);
    expect(
      result.plans.find((plan) => plan.resourceType === "RESOURCE_WILD_GAME")?.eligibleTileCount
    ).toBe(3);
  });

  it("keeps hardwood caveat visible", () => {
    const result = resources.ops.planTerrestrialResources.run(
      {
        width: 2,
        height: 2,
        expectations: terrestrialExpectations(),
        tropicalForestMask: every(4),
      },
      resources.ops.planTerrestrialResources.defaultConfig
    );

    const hardwood = result.plans.find((plan) => plan.resourceType === "RESOURCE_HARDWOOD");
    expect(hardwood?.laneId).toBe("tropical-forest-product");
    expect(hardwood?.caveats).toContain(
      "Do not broaden to temperate forests without official or runtime proof."
    );
  });

  it("reports missing expectation rows instead of silently dropping resources", () => {
    const result = resources.ops.planTerrestrialResources.run(
      {
        width: 2,
        height: 2,
        expectations: terrestrialExpectations().filter(
          (row) => row.resourceType === "RESOURCE_CAMELS"
        ),
        aridRangelandMask: every(4),
      },
      resources.ops.planTerrestrialResources.defaultConfig
    );

    expect(result.plans).toHaveLength(TERRESTRIAL_RESOURCE_TYPES.length);
    expect(result.missingResourceTypes).toEqual(TERRESTRIAL_RESOURCE_TYPES.slice(1));
    expect(result.plans.filter((plan) => plan.status === "missing-expectation")).toHaveLength(10);
  });

  it("does not allow caller config to omit required terrestrial resources", () => {
    for (const selector of ["requiredResourceTypes", "resourceTypes", "includeResources"]) {
      expect(() =>
        normalizeOpSelectionOrThrow(resources.ops.planTerrestrialResources, {
          strategy: "default",
          config: { [selector]: ["RESOURCE_CAMELS"] },
        })
      ).toThrow(TestCompileError);
    }
  });

  it("marks rows as signal gaps when no terrestrial signal mask is supplied", () => {
    const result = resources.ops.planTerrestrialResources.run(
      {
        width: 2,
        height: 2,
        expectations: terrestrialExpectations(),
      },
      resources.ops.planTerrestrialResources.defaultConfig
    );

    expect(result.missingResourceTypes).toEqual([]);
    expect(result.plans.every((plan) => plan.status === "missing-signal")).toBe(true);
    expect(result.plans.every((plan) => plan.rangeStatus === "not-gated")).toBe(true);
    expect(result.plans.every((plan) => plan.targetIntentCount === 0)).toBe(true);
  });
});

function terrestrialExpectations(): TerrestrialExpectation[] {
  return EARTHLIKE_RESOURCE_EXPECTATIONS.filter(
    (row) => row.groupId === "terrestrial-animal-forest-wild"
  ).map((row) => ({
    resourceType: row.resourceType,
    groupId: "terrestrial-animal-forest-wild",
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
