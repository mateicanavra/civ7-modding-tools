import { describe, expect, it } from "bun:test";
import { EARTHLIKE_RESOURCE_EXPECTATIONS } from "@mapgen/domain/resources/model/data/earthlike-expectations/index.js";
import resources from "@mapgen/domain/resources/ops";

import { normalizeOpSelectionOrThrow, TestCompileError } from "../../support/compiler-helpers.js";

const GEOLOGICAL_RESOURCE_TYPES = [
  "RESOURCE_GOLD",
  "RESOURCE_GOLD_DISTANT_LANDS",
  "RESOURCE_SILVER",
  "RESOURCE_SILVER_DISTANT_LANDS",
  "RESOURCE_GYPSUM",
  "RESOURCE_JADE",
  "RESOURCE_KAOLIN",
  "RESOURCE_MARBLE",
  "RESOURCE_IRON",
  "RESOURCE_SALT",
  "RESOURCE_LAPIS_LAZULI",
  "RESOURCE_NITER",
  "RESOURCE_COAL",
  "RESOURCE_NICKEL",
  "RESOURCE_OIL",
  "RESOURCE_CLAY",
  "RESOURCE_LIMESTONE",
  "RESOURCE_TIN",
  "RESOURCE_PITCH",
  "RESOURCE_RUBIES",
] as const;
type GeologicalExpectation = Parameters<
  typeof resources.ops.planGeologicalResources.run
>[0]["expectations"][number];

const BLOCKED_GEOLOGICAL_RESOURCE_TYPES = [
  "RESOURCE_GOLD_DISTANT_LANDS",
  "RESOURCE_SILVER_DISTANT_LANDS",
  "RESOURCE_LAPIS_LAZULI",
  "RESOURCE_NICKEL",
] as const;

describe("geological resource operation contract", () => {
  it("plans all geological resource rows symbolically without runtime ids", () => {
    const width = 5;
    const height = 5;
    const size = width * height;
    const selection = normalizeOpSelectionOrThrow(
      resources.ops.planGeologicalResources,
      structuredClone(resources.ops.planGeologicalResources.defaultConfig)
    );

    const result = resources.ops.planGeologicalResources.run(
      {
        width,
        height,
        expectations: geologicalExpectations(),
        orogenyMask: every(size),
        alluvialPlacerMask: every(size),
        tundraDesertHillMask: every(size),
        evaporiteBasinMask: every(size),
        sedimentaryBasinMask: every(size),
        ultramaficMask: every(size),
        weatheringClayFlatMask: every(size),
        carbonateBeltMask: every(size),
        cratonMask: every(size),
        closedBasinMask: every(size),
        aridSoilMask: every(size),
        forestWetlandBasinMask: every(size),
        hydrocarbonBasinMask: every(size),
        wetAlluvialMask: every(size),
        graniteBeltMask: every(size),
        oilAdjacencyMask: every(size),
        metamorphicBeltMask: every(size),
        collisionBeltMask: every(size),
        flatNonGeologicMask: new Uint8Array(size),
        wetSuppressionMask: new Uint8Array(size),
        humidSuppressionMask: new Uint8Array(size),
        offshoreMask: new Uint8Array(size),
        igneousTerrainMask: new Uint8Array(size),
      },
      selection
    );

    expect(result.groupId).toBe("geological-mineral-gemstone-industrial");
    expect(result.proofStatus).toBe("warning-only");
    expect(result.missingResourceTypes).toEqual([]);
    expect(result.plans.map((plan) => plan.resourceType)).toEqual([...GEOLOGICAL_RESOURCE_TYPES]);
    expect(result.plans.filter((plan) => plan.status === "planned")).toHaveLength(16);

    for (const blockedResourceType of BLOCKED_GEOLOGICAL_RESOURCE_TYPES) {
      expect(result.plans.find((plan) => plan.resourceType === blockedResourceType)?.status).toBe(
        "blocked"
      );
    }

    for (const row of result.plans) {
      expect(Object.hasOwn(row, "resourceId")).toBe(false);
      expect(Object.hasOwn(row, "numericId")).toBe(false);
      expect(Object.hasOwn(row, "preferredResourceType")).toBe(false);
    }
  });

  it("keeps blocked official rows visible and active-zero", () => {
    const result = resources.ops.planGeologicalResources.run(
      {
        width: 2,
        height: 2,
        expectations: geologicalExpectations(),
        orogenyMask: every(4),
      },
      resources.ops.planGeologicalResources.defaultConfig
    );

    for (const blockedResourceType of BLOCKED_GEOLOGICAL_RESOURCE_TYPES) {
      const row = result.plans.find((plan) => plan.resourceType === blockedResourceType);
      expect(row).toBeDefined();
      expect(row?.status).toBe("blocked");
      expect(row?.expectedCountRange).toMatchObject({ min: 0, target: 0, max: 0 });
      expect(row?.targetIntentCount).toBe(0);
      expect(row?.eligibleTileCount).toBe(0);
      expect(row?.rangeStatus).toBe("not-gated");
      expect(row?.conditionMultipliers).toEqual([]);
    }
  });

  it("preserves hydrothermal, carbonate, hydrocarbon, granite, and metamorphic signal families", () => {
    const size = 9;
    const alluvial = new Uint8Array(size);
    const closedBasin = new Uint8Array(size);
    const hydrocarbon = new Uint8Array(size);
    const granite = new Uint8Array(size);
    const carbonate = new Uint8Array(size);
    const metamorphic = new Uint8Array(size);
    alluvial[0] = 1;
    closedBasin[1] = 1;
    hydrocarbon[2] = 1;
    granite[3] = 1;
    carbonate[4] = 1;
    metamorphic[5] = 1;

    const result = resources.ops.planGeologicalResources.run(
      {
        width: 3,
        height: 3,
        expectations: geologicalExpectations(),
        alluvialPlacerMask: alluvial,
        closedBasinMask: closedBasin,
        hydrocarbonBasinMask: hydrocarbon,
        graniteBeltMask: granite,
        carbonateBeltMask: carbonate,
        metamorphicBeltMask: metamorphic,
      },
      resources.ops.planGeologicalResources.defaultConfig
    );

    const gold = result.plans.find((plan) => plan.resourceType === "RESOURCE_GOLD");
    const salt = result.plans.find((plan) => plan.resourceType === "RESOURCE_SALT");
    const oil = result.plans.find((plan) => plan.resourceType === "RESOURCE_OIL");
    const pitch = result.plans.find((plan) => plan.resourceType === "RESOURCE_PITCH");
    const tin = result.plans.find((plan) => plan.resourceType === "RESOURCE_TIN");
    const limestone = result.plans.find((plan) => plan.resourceType === "RESOURCE_LIMESTONE");
    const rubies = result.plans.find((plan) => plan.resourceType === "RESOURCE_RUBIES");

    expect(gold?.signalFields).toContain("alluvialPlacerMask");
    expect(gold?.signalRequirements).toContain("orogeny or alluvial signal");
    expect(salt?.signalFields).toContain("closedBasinMask");
    expect(salt?.signalRequirements).toContain("closed basin or evaporite signal");
    expect(oil?.signalFields).toContain("hydrocarbonBasinMask");
    expect(oil?.signalRequirements).toContain("sedimentary basin or hydrocarbon basin signal");
    expect(pitch?.signalFields).toContain("hydrocarbonBasinMask");
    expect(pitch?.signalRequirements).toContain("hydrocarbon basin signal");
    expect(tin?.signalFields).toContain("graniteBeltMask");
    expect(tin?.signalRequirements).toContain("granite, orogeny, or placer signal");
    expect(limestone?.signalFields).toContain("carbonateBeltMask");
    expect(limestone?.signalRequirements).toContain("carbonate basin signal");
    expect(rubies?.signalFields).toContain("metamorphicBeltMask");
    expect(rubies?.signalRequirements).toContain("metamorphic, marble, or collision-belt signal");
  });

  it("keeps narrow geological proxies from broadening into generic terrain signals", () => {
    const result = resources.ops.planGeologicalResources.run(
      {
        width: 2,
        height: 2,
        expectations: geologicalExpectations(),
        alluvialPlacerMask: every(4),
        tundraDesertHillMask: every(4),
        sedimentaryBasinMask: every(4),
        forestWetlandBasinMask: every(4),
        wetAlluvialMask: every(4),
        carbonateBeltMask: every(4),
      },
      resources.ops.planGeologicalResources.defaultConfig
    );

    const jade = result.plans.find((plan) => plan.resourceType === "RESOURCE_JADE");
    const silver = result.plans.find((plan) => plan.resourceType === "RESOURCE_SILVER");
    const coal = result.plans.find((plan) => plan.resourceType === "RESOURCE_COAL");
    const niter = result.plans.find((plan) => plan.resourceType === "RESOURCE_NITER");
    const limestone = result.plans.find((plan) => plan.resourceType === "RESOURCE_LIMESTONE");
    const rubies = result.plans.find((plan) => plan.resourceType === "RESOURCE_RUBIES");

    expect(jade?.status).toBe("missing-signal");
    expect(jade?.signalFields).not.toContain("alluvialPlacerMask");
    expect(silver?.signalFields).toEqual(["tundraDesertHillMask"]);
    expect(silver?.signalFields).not.toContain("hillMask");
    expect(coal?.signalFields).toEqual(["sedimentaryBasinMask", "forestWetlandBasinMask"]);
    expect(coal?.signalFields).not.toContain("forestMask");
    expect(coal?.signalFields).not.toContain("wetlandMask");
    expect(niter?.status).toBe("missing-signal");
    expect(niter?.signalFields).not.toContain("wetAlluvialMask");
    expect(limestone?.signalFields).toEqual(["carbonateBeltMask"]);
    expect(limestone?.signalFields).not.toContain("tundraDesertHillMask");
    expect(rubies?.status).toBe("missing-signal");
    expect(rubies?.signalFields).not.toContain("carbonateBeltMask");
  });

  it("suppression masks reduce observed geological eligibility", () => {
    const size = 4;
    const all = every(size);
    const flat = new Uint8Array(size);
    const offshore = new Uint8Array(size);
    const igneous = new Uint8Array(size);
    flat[0] = 1;
    offshore[1] = 1;
    igneous[2] = 1;

    const result = resources.ops.planGeologicalResources.run(
      {
        width: 2,
        height: 2,
        expectations: geologicalExpectations(),
        orogenyMask: all,
        hydrocarbonBasinMask: all,
        carbonateBeltMask: all,
        flatNonGeologicMask: flat,
        offshoreMask: offshore,
        igneousTerrainMask: igneous,
      },
      resources.ops.planGeologicalResources.defaultConfig
    );

    expect(
      result.plans.find((plan) => plan.resourceType === "RESOURCE_GOLD")?.eligibleTileCount
    ).toBe(3);
    expect(
      result.plans.find((plan) => plan.resourceType === "RESOURCE_OIL")?.eligibleTileCount
    ).toBe(3);
    expect(
      result.plans.find((plan) => plan.resourceType === "RESOURCE_LIMESTONE")?.eligibleTileCount
    ).toBe(3);
  });

  it("reports missing expectation rows instead of silently dropping resources", () => {
    const result = resources.ops.planGeologicalResources.run(
      {
        width: 2,
        height: 2,
        expectations: geologicalExpectations().filter(
          (row) => row.resourceType === "RESOURCE_GOLD"
        ),
        orogenyMask: every(4),
      },
      resources.ops.planGeologicalResources.defaultConfig
    );

    expect(result.plans).toHaveLength(GEOLOGICAL_RESOURCE_TYPES.length);
    expect(result.missingResourceTypes).toEqual(GEOLOGICAL_RESOURCE_TYPES.slice(1));
    expect(result.plans.filter((plan) => plan.status === "missing-expectation")).toHaveLength(19);
  });

  it("does not allow caller config to omit required geological resources", () => {
    for (const selector of ["requiredResourceTypes", "resourceTypes", "includeResources"]) {
      expect(() =>
        normalizeOpSelectionOrThrow(resources.ops.planGeologicalResources, {
          strategy: "default",
          config: { [selector]: ["RESOURCE_GOLD"] },
        })
      ).toThrow(TestCompileError);
    }
  });

  it("marks active rows as signal gaps when no geological signal mask is supplied", () => {
    const result = resources.ops.planGeologicalResources.run(
      {
        width: 2,
        height: 2,
        expectations: geologicalExpectations(),
      },
      resources.ops.planGeologicalResources.defaultConfig
    );

    expect(result.missingResourceTypes).toEqual([]);
    expect(result.plans.filter((plan) => plan.status === "missing-signal")).toHaveLength(16);
    for (const blockedResourceType of BLOCKED_GEOLOGICAL_RESOURCE_TYPES) {
      expect(result.plans.find((plan) => plan.resourceType === blockedResourceType)?.status).toBe(
        "blocked"
      );
    }
    expect(result.plans.every((plan) => plan.rangeStatus === "not-gated")).toBe(true);
  });
});

function geologicalExpectations(): GeologicalExpectation[] {
  return EARTHLIKE_RESOURCE_EXPECTATIONS.filter(
    (row) => row.groupId === "geological-mineral-gemstone-industrial"
  ).map((row) => ({
    resourceType: row.resourceType,
    groupId: "geological-mineral-gemstone-industrial",
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
