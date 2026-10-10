import { describe, expect, it } from "bun:test";
import { OFFICIAL_RESOURCE_BY_TYPE, OFFICIAL_RESOURCE_TYPE_ORDER } from "@civ7/map-policy";
import { resolveEarthlikeResourceExpectations } from "../../../../../src/domain/resources/index.js";

const expectations = resolveEarthlikeResourceExpectations({ aliveMajorPlayerCount: 4 });

const blockedResources = [
  "RESOURCE_CLOVES",
  "RESOURCE_GOLD_DISTANT_LANDS",
  "RESOURCE_LAPIS_LAZULI",
  "RESOURCE_NICKEL",
  "RESOURCE_SILVER_DISTANT_LANDS",
] as const;

describe("resource demand Earthlike expectation policy", () => {
  it("covers the official resource corpus exactly once in canonical order", () => {
    const order = expectations.map((entry) => entry.resourceType);

    expect(expectations).toHaveLength(55);
    expect(order).toEqual(OFFICIAL_RESOURCE_TYPE_ORDER);
    expect(new Set(order).size).toBe(55);
    expect(order.every((resourceType) => resourceType.startsWith("RESOURCE_"))).toBe(true);
  });

  it("provides complete terminal source policy with ordered representative ranges", () => {
    const groups = new Set<string>();
    const statuses = new Set<string>();

    for (const row of expectations) {
      groups.add(row.groupId);
      statuses.add(row.status);
      expect(row.earthlikePredicate.length).toBeGreaterThan(0);
      expect(row.expectedCountRange.baseline).toBe(
        row.resourceType === "RESOURCE_FISH" || row.resourceType === "RESOURCE_CRABS"
          ? "alive-major-player-supply"
          : "standard-earthlike-map"
      );
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
    const blocked = expectations.filter((entry) => entry.status === "blocked");

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
    const crabs = expectations.find(
      (entry) => entry.resourceType === "RESOURCE_CRABS"
    );

    expect(crabs?.groupId).toBe("aquatic-coastal-navigable-river");
    expect(crabs?.caveats.join("\n")).toContain("NAVIGABLE_RIVERS_ELIGIBLE");
    expect(crabs?.signalRequirements.join("\n")).toContain("navigable-river");
  });

  it.each([
    { count: 1, fish: [2, 3, 4], crabs: [1, 1, 2] },
    { count: 3, fish: [6, 9, 12], crabs: [2, 3, 5] },
    { count: 4, fish: [8, 12, 16], crabs: [2, 4, 6] },
    { count: 5, fish: [10, 15, 20], crabs: [3, 5, 8] },
    { count: 6, fish: [12, 18, 24], crabs: [3, 6, 9] },
    { count: 8, fish: [16, 24, 32], crabs: [4, 8, 12] },
    { count: 10, fish: [20, 30, 40], crabs: [5, 10, 15] },
    { count: 64, fish: [128, 192, 256], crabs: [32, 64, 96] },
  ])("resolves authored Fish and Crab supply for $count alive-major players", ({ count, fish, crabs }) => {
    const resolved = resolveEarthlikeResourceExpectations({ aliveMajorPlayerCount: count });
    for (const [resourceType, range] of [
      ["RESOURCE_FISH", fish],
      ["RESOURCE_CRABS", crabs],
    ] as const) {
      expect(resolved.find((row) => row.resourceType === resourceType)?.expectedCountRange).toEqual({
        baseline: "alive-major-player-supply",
        min: range[0],
        target: range[1],
        max: range[2],
        evidence: "authored-gameplay",
      });
    }
    expect(Object.isFrozen(resolved)).toBe(true);
    expect(resolved.every((row) => Object.isFrozen(row.expectedCountRange))).toBe(true);
  });

  it.each([undefined, 0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, 65])(
    "rejects an absent or invalid alive-major count %s without a fallback",
    (aliveMajorPlayerCount) => {
      expect(() =>
        resolveEarthlikeResourceExpectations({
          // Deliberately cross the direct resolver's required count boundary.
          aliveMajorPlayerCount: aliveMajorPlayerCount as number,
        })
      ).toThrow("integer count in [1, 64]");
    }
  );

  it("refuses an omitted direct resolver count", () => {
    expect(() => Reflect.apply(resolveEarthlikeResourceExpectations, undefined, [{}]))
      .toThrow("integer count in [1, 64]");
  });

  it("keeps all 53 other authored rows, ranges, and evidence independent of player supply", () => {
    const fixedRanges = {
      RESOURCE_COTTON: [6, 8, 12],
      RESOURCE_DATES: [2, 3, 5],
      RESOURCE_DYES: [2, 3, 5],
      RESOURCE_GOLD: [16, 18, 20],
      RESOURCE_GOLD_DISTANT_LANDS: [0, 0, 0],
      RESOURCE_GYPSUM: [4, 6, 8],
      RESOURCE_INCENSE: [2, 3, 5],
      RESOURCE_IVORY: [2, 3, 5],
      RESOURCE_JADE: [2, 3, 5],
      RESOURCE_KAOLIN: [6, 8, 10],
      RESOURCE_MARBLE: [4, 6, 8],
      RESOURCE_PEARLS: [2, 3, 5],
      RESOURCE_SILK: [4, 6, 8],
      RESOURCE_SILVER: [16, 18, 20],
      RESOURCE_SILVER_DISTANT_LANDS: [0, 0, 0],
      RESOURCE_WINE: [4, 6, 8],
      RESOURCE_CAMELS: [2, 3, 5],
      RESOURCE_HIDES: [8, 11, 14],
      RESOURCE_HORSES: [4, 6, 8],
      RESOURCE_IRON: [8, 11, 14],
      RESOURCE_SALT: [5, 7, 9],
      RESOURCE_WOOL: [4, 6, 8],
      RESOURCE_LAPIS_LAZULI: [0, 0, 0],
      RESOURCE_COCOA: [8, 10, 12],
      RESOURCE_FURS: [2, 3, 5],
      RESOURCE_SPICES: [8, 10, 12],
      RESOURCE_SUGAR: [8, 10, 12],
      RESOURCE_TEA: [8, 10, 12],
      RESOURCE_TRUFFLES: [2, 3, 5],
      RESOURCE_NITER: [6, 8, 10],
      RESOURCE_CLOVES: [0, 0, 0],
      RESOURCE_WHALES: [1, 2, 3],
      RESOURCE_COFFEE: [16, 18, 20],
      RESOURCE_TOBACCO: [16, 18, 20],
      RESOURCE_CITRUS: [16, 18, 20],
      RESOURCE_COAL: [6, 8, 10],
      RESOURCE_NICKEL: [0, 0, 0],
      RESOURCE_OIL: [5, 7, 9],
      RESOURCE_QUININE: [16, 18, 20],
      RESOURCE_RUBBER: [2, 3, 4],
      RESOURCE_MANGOS: [3, 5, 7],
      RESOURCE_CLAY: [6, 8, 10],
      RESOURCE_FLAX: [5, 7, 9],
      RESOURCE_RUBIES: [3, 4, 6],
      RESOURCE_RICE: [4, 6, 8],
      RESOURCE_LIMESTONE: [6, 9, 12],
      RESOURCE_TIN: [8, 11, 14],
      RESOURCE_LLAMAS: [1, 2, 4],
      RESOURCE_HARDWOOD: [4, 6, 8],
      RESOURCE_WILD_GAME: [6, 8, 10],
      RESOURCE_COWRIE: [1, 2, 4],
      RESOURCE_TURTLES: [1, 2, 3],
      RESOURCE_PITCH: [3, 4, 6],
    } as const;
    const otherRows = (count: number) =>
      resolveEarthlikeResourceExpectations({ aliveMajorPlayerCount: count }).filter(
        (row) => row.resourceType !== "RESOURCE_FISH" && row.resourceType !== "RESOURCE_CRABS"
      );
    const baseline = otherRows(1);
    expect(baseline).toHaveLength(53);
    for (const count of [3, 4, 5, 6, 8, 10, 64]) expect(otherRows(count)).toEqual(baseline);
    for (const row of baseline) {
      const [min, target, max] = fixedRanges[row.resourceType as keyof typeof fixedRanges];
      expect(row.expectedCountRange).toEqual({
        baseline: "standard-earthlike-map",
        min,
        target,
        max,
        evidence: row.status === "blocked" ? "blocked" : "inference-backed",
      });
    }
  });
});
