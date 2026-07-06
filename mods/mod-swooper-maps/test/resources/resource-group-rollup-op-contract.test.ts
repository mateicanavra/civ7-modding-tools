import { describe, expect, it } from "bun:test";
import {
  EARTHLIKE_RESOURCE_EXPECTATIONS,
  type EarthlikeResourceExpectation,
} from "@mapgen/domain/resources/model/data/earthlike-expectations/index.js";
import resources from "@mapgen/domain/resources/ops";

import { normalizeOpSelectionOrThrow, TestCompileError } from "../support/compiler-helpers.js";

describe("resource group rollup operation contract", () => {
  it("publishes one warning-only group plan artifact across all symbolic resource groups", () => {
    const selection = normalizeOpSelectionOrThrow(resources.ops.planResourceGroups, {
      strategy: "default",
      config: {},
    });

    const result = resources.ops.planResourceGroups.run(allGroupPlans(5, 5), selection);

    expect(result.artifactId).toBe("artifact:resources.groupPlans");
    expect(result.proofStatus).toBe("warning-only");
    expect(result.groupCount).toBe(4);
    expect(result.resourceCount).toBe(55);
    expect(result.plannedCount).toBe(50);
    expect(result.blockedCount).toBe(5);
    expect(result.missingSignalCount).toBe(0);
    expect(result.missingExpectationCount).toBe(0);
    expect(result.targetIntentCount).toBe(374);
    expect(result.eligibleTileCount).toBe(1250);
    expect(result.duplicateResourceTypes).toEqual([]);
    expect(result.missingResourceTypes).toEqual([]);
    expect(result.blockers).toEqual([]);

    expect(result.groups.map((group) => group.groupId)).toEqual([
      "aquatic-coastal-navigable-river",
      "cultivated-plantation-medicinal",
      "terrestrial-animal-forest-wild",
      "geological-mineral-gemstone-industrial",
    ]);
    expect(result.groups.map((group) => group.inputGroupId)).toEqual(
      result.groups.map((group) => group.groupId)
    );
    expect(result.groups.map((group) => group.plans.length)).toEqual([6, 18, 11, 20]);
    expect(result.groups[0]?.plans.map((plan) => plan.resourceType)).toContain("RESOURCE_FISH");

    for (const group of result.groups) {
      for (const row of group.plans) {
        expect(Object.hasOwn(row, "resourceId")).toBe(false);
        expect(Object.hasOwn(row, "numericId")).toBe(false);
        expect(Object.hasOwn(row, "preferredResourceType")).toBe(false);
      }
    }
  });

  it("preserves group-level blocked, missing-signal, and missing-expectation counts", () => {
    const plans = allGroupPlans(2, 2);
    const result = resources.ops.planResourceGroups.run(
      {
        ...plans,
        geologicalPlan: resources.ops.planGeologicalResources.run(
          {
            width: 2,
            height: 2,
            expectations: geologicalExpectations().filter(
              (row) => row.resourceType !== "RESOURCE_RUBIES"
            ),
          },
          resources.ops.planGeologicalResources.defaultConfig
        ),
      },
      resources.ops.planResourceGroups.defaultConfig
    );

    const geological = result.groups.find(
      (group) => group.groupId === "geological-mineral-gemstone-industrial"
    );
    expect(geological?.blockedCount).toBe(4);
    expect(geological?.missingSignalCount).toBe(15);
    expect(geological?.missingExpectationCount).toBe(1);
    expect(result.missingResourceTypes).toEqual(["RESOURCE_RUBIES"]);
    expect(geological?.blockers).toEqual([
      "geological-mineral-gemstone-industrial has missing expectation rows: RESOURCE_RUBIES.",
    ]);
  });

  it("reports duplicate resource ownership across group plans", () => {
    const plans = allGroupPlans(2, 2);
    const result = resources.ops.planResourceGroups.run(
      {
        ...plans,
        cultivatedPlan: {
          ...plans.cultivatedPlan,
          plans: [...plans.cultivatedPlan.plans, plans.aquaticPlan.plans[0]],
        },
      },
      resources.ops.planResourceGroups.defaultConfig
    );

    expect(result.duplicateResourceTypes).toEqual(["RESOURCE_FISH"]);
    expect(result.blockers).toEqual([
      "RESOURCE_FISH appears in both aquatic-coastal-navigable-river and cultivated-plantation-medicinal.",
    ]);
  });

  it("reports duplicate rows inside one group plan", () => {
    const plans = allGroupPlans(2, 2);
    const result = resources.ops.planResourceGroups.run(
      {
        ...plans,
        aquaticPlan: {
          ...plans.aquaticPlan,
          plans: [...plans.aquaticPlan.plans, plans.aquaticPlan.plans[0]],
        },
      },
      resources.ops.planResourceGroups.defaultConfig
    );

    expect(result.duplicateResourceTypes).toEqual(["RESOURCE_FISH"]);
    expect(result.blockers).toEqual([
      "RESOURCE_FISH appears more than once in aquatic-coastal-navigable-river.",
    ]);
  });

  it("reports group input miswiring without changing the runtime boundary", () => {
    const plans = allGroupPlans(2, 2);
    const result = resources.ops.planResourceGroups.run(
      {
        ...plans,
        aquaticPlan: {
          ...plans.aquaticPlan,
          groupId: "cultivated-plantation-medicinal",
        },
      },
      resources.ops.planResourceGroups.defaultConfig
    );
    expect(result.proofStatus).toBe("warning-only");
    expect(result.blockers).toContain(
      "aquaticPlan supplied cultivated-plantation-medicinal; expected aquatic-coastal-navigable-river."
    );
    expect(result.groups.map((group) => group.groupId)).toEqual([
      "aquatic-coastal-navigable-river",
      "cultivated-plantation-medicinal",
      "terrestrial-animal-forest-wild",
      "geological-mineral-gemstone-industrial",
    ]);
    expect(result.groups[0]?.inputGroupId).toBe("cultivated-plantation-medicinal");
    expect(result.groups[0]?.plans).toHaveLength(6);
  });

  it("does not allow caller config to omit resource groups", () => {
    for (const selector of ["requiredGroupIds", "groupIds", "includeGroups"]) {
      expect(() =>
        normalizeOpSelectionOrThrow(resources.ops.planResourceGroups, {
          strategy: "default",
          config: { [selector]: ["aquatic-coastal-navigable-river"] },
        })
      ).toThrow(TestCompileError);
    }
  });
});

function allGroupPlans(width: number, height: number) {
  const size = width * height;
  return {
    aquaticPlan: resources.ops.planAquaticResources.run(
      {
        width,
        height,
        expectations: expectationsFor("aquatic-coastal-navigable-river"),
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
      resources.ops.planAquaticResources.defaultConfig
    ),
    cultivatedPlan: resources.ops.planCultivatedResources.run(
      {
        width,
        height,
        expectations: expectationsFor("cultivated-plantation-medicinal"),
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
      resources.ops.planCultivatedResources.defaultConfig
    ),
    terrestrialPlan: resources.ops.planTerrestrialResources.run(
      {
        width,
        height,
        expectations: expectationsFor("terrestrial-animal-forest-wild"),
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
      resources.ops.planTerrestrialResources.defaultConfig
    ),
    geologicalPlan: resources.ops.planGeologicalResources.run(
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
      resources.ops.planGeologicalResources.defaultConfig
    ),
  };
}

function expectationsFor(
  groupId: EarthlikeResourceExpectation["groupId"]
): EarthlikeResourceExpectation[] {
  return EARTHLIKE_RESOURCE_EXPECTATIONS.filter((row) => row.groupId === groupId);
}

function geologicalExpectations(): EarthlikeResourceExpectation[] {
  return expectationsFor("geological-mineral-gemstone-industrial");
}

function every(size: number): Uint8Array {
  return new Uint8Array(size).fill(1);
}
