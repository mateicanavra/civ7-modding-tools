import { describe, expect, it } from "bun:test";
import { OFFICIAL_RESOURCE_BY_TYPE, OFFICIAL_RESOURCE_TYPE_ORDER } from "@civ7/map-policy";
import { EARTHLIKE_RESOURCE_EXPECTATIONS } from "@mapgen/domain/resources";

const blockedResources = [
  "RESOURCE_CLOVES",
  "RESOURCE_GOLD_DISTANT_LANDS",
  "RESOURCE_LAPIS_LAZULI",
  "RESOURCE_NICKEL",
  "RESOURCE_SILVER_DISTANT_LANDS",
] as const;

describe("resource demand Earthlike expectation policy", () => {
  it("covers the official resource corpus exactly once in canonical order", () => {
    const order = EARTHLIKE_RESOURCE_EXPECTATIONS.map((entry) => entry.resourceType);

    expect(EARTHLIKE_RESOURCE_EXPECTATIONS).toHaveLength(55);
    expect(order).toEqual(OFFICIAL_RESOURCE_TYPE_ORDER);
    expect(new Set(order).size).toBe(55);
    expect(order.every((resourceType) => resourceType.startsWith("RESOURCE_"))).toBe(true);
  });

  it("provides complete terminal source policy with ordered representative ranges", () => {
    const groups = new Set<string>();
    const statuses = new Set<string>();

    for (const row of EARTHLIKE_RESOURCE_EXPECTATIONS) {
      groups.add(row.groupId);
      statuses.add(row.status);
      expect(row.earthlikePredicate.length).toBeGreaterThan(0);
      expect(row.expectedCountRange.baseline).toBe("standard-earthlike-map");
      expect(row.expectedCountRange.min).toBeLessThanOrEqual(row.expectedCountRange.target);
      expect(row.expectedCountRange.target).toBeLessThanOrEqual(row.expectedCountRange.max);
      if (row.status === "expected") {
        expect(row.conditionMultipliers.length).toBeGreaterThan(0);
      }
    }

    expect([...groups].sort()).toEqual([
      "aquatic-coastal-navigable-river",
      "cultivated-plantation-medicinal",
      "geological-mineral-gemstone-industrial",
      "terrestrial-animal-forest-wild",
    ]);
    expect([...statuses].sort()).toEqual(["blocked", "expected"]);
  });

  it("keeps officially blocked resources visible with zero active demand", () => {
    const blocked = EARTHLIKE_RESOURCE_EXPECTATIONS.filter((entry) => entry.status === "blocked");

    expect(blocked.map((entry) => entry.resourceType).sort()).toEqual([...blockedResources]);
    for (const row of blocked) {
      expect(OFFICIAL_RESOURCE_BY_TYPE[row.resourceType]!.placeability.status).not.toBe(
        "placeable"
      );
      expect(row.expectedCountRange).toEqual({
        baseline: "standard-earthlike-map",
        min: 0,
        target: 0,
        max: 0,
        evidence: "blocked",
      });
      expect(row.conditionMultipliers).toEqual([]);
    }
  });

  it("retains navigable-river habitat evidence for crabs", () => {
    const crabs = EARTHLIKE_RESOURCE_EXPECTATIONS.find(
      (entry) => entry.resourceType === "RESOURCE_CRABS"
    );

    expect(crabs?.groupId).toBe("aquatic-coastal-navigable-river");
    expect(crabs?.caveats.join("\n")).toContain("NAVIGABLE_RIVERS_ELIGIBLE");
    expect(crabs?.signalRequirements.join("\n")).toContain("navigable-river");
  });
});
