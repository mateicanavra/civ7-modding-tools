import { afterEach, describe, expect, it } from "bun:test";

import {
  DEFERRED_INITIAL_MAP_RESOURCE_TYPE_IDS,
  DEFERRED_INITIAL_MAP_RESOURCE_TYPES,
  filterInitialMapResourceTypeIds,
  filterResourceCandidatesForAge,
  getInitialMapResourcePolicyForStaticSlot,
  getInitialMapResourcePolicyForType,
  INITIAL_MAP_RESOURCE_AUTHORING_AGE,
  INITIAL_MAP_RESOURCE_AUTHORING_POLICY,
  INITIAL_MAP_RESOURCE_TYPE_IDS,
  INITIAL_MAP_RESOURCE_TYPES,
  OFFICIAL_RESOURCE_CORPUS,
  resolveActiveResourceAge,
} from "../../src/domain/resources/index.js";

type RuntimeGlobals = typeof globalThis & {
  Game?: { age?: unknown };
  GameInfo?: { Ages?: { lookup?: (age: number) => { AgeType?: unknown } | null } };
};

const runtime = globalThis as RuntimeGlobals;
const originalGame = runtime.Game;
const originalGameInfo = runtime.GameInfo;

function restoreRuntimeGlobals(): void {
  if (originalGame === undefined) delete runtime.Game;
  else runtime.Game = originalGame;
  if (originalGameInfo === undefined) delete runtime.GameInfo;
  else runtime.GameInfo = originalGameInfo;
}

function expectedStaticSlotsForAge(age: string): number[] {
  return OFFICIAL_RESOURCE_CORPUS.filter(
    (entry) =>
      entry.validAges.includes(age as never) &&
      entry.placeability.status === "placeable" &&
      entry.strategyRequired.status === "required"
  ).map((entry) => entry.staticResourceRowSlot);
}

describe("initial map resource authoring policy", () => {
  afterEach(() => {
    restoreRuntimeGlobals();
  });

  it("derives complete initial-map eligibility from the official resource corpus", () => {
    expect(INITIAL_MAP_RESOURCE_AUTHORING_AGE).toBe("AGE_ANTIQUITY");
    expect(INITIAL_MAP_RESOURCE_AUTHORING_POLICY).toHaveLength(OFFICIAL_RESOURCE_CORPUS.length);
    expect(INITIAL_MAP_RESOURCE_TYPES).toHaveLength(34);
    expect(INITIAL_MAP_RESOURCE_TYPE_IDS).toEqual([
      0, 1, 2, 3, 4, 6, 7, 8, 9, 10, 11, 12, 13, 14, 16, 17, 18, 19, 20, 21, 22, 41, 42, 43, 44, 45,
      46, 47, 48, 49, 50, 51, 52, 53,
    ]);

    for (const entry of INITIAL_MAP_RESOURCE_AUTHORING_POLICY) {
      const corpus = OFFICIAL_RESOURCE_CORPUS.find(
        (row) => row.resourceType === entry.resourceType
      );
      expect(corpus).toBeDefined();
      expect(entry.validAges).toEqual(corpus!.validAges);
      const expectedStatus =
        corpus!.strategyRequired.status === "blocked"
          ? "blocked-official"
          : corpus!.placeability.status !== "placeable"
            ? "not-placeable"
            : corpus!.validAges.includes("AGE_ANTIQUITY")
              ? "eligible"
              : "deferred-future-age";
      expect(entry.status).toBe(expectedStatus);
      expect(entry.rationale.length).toBeGreaterThan(0);
      expect(getInitialMapResourcePolicyForType(entry.resourceType)).toEqual(entry);
      expect(getInitialMapResourcePolicyForStaticSlot(entry.staticResourceRowSlot)).toEqual(entry);
    }
  });

  it("defers future-age resources including oil, coal, and rubber from initial map authoring", () => {
    expect(DEFERRED_INITIAL_MAP_RESOURCE_TYPES).toEqual([
      "RESOURCE_COCOA",
      "RESOURCE_FURS",
      "RESOURCE_SPICES",
      "RESOURCE_SUGAR",
      "RESOURCE_TEA",
      "RESOURCE_TRUFFLES",
      "RESOURCE_NITER",
      "RESOURCE_WHALES",
      "RESOURCE_COFFEE",
      "RESOURCE_TOBACCO",
      "RESOURCE_CITRUS",
      "RESOURCE_COAL",
      "RESOURCE_OIL",
      "RESOURCE_QUININE",
      "RESOURCE_RUBBER",
      "RESOURCE_PITCH",
    ]);
    expect(DEFERRED_INITIAL_MAP_RESOURCE_TYPE_IDS).toEqual([
      24, 25, 26, 27, 28, 29, 30, 32, 33, 34, 35, 36, 38, 39, 40, 54,
    ]);

    for (const resourceType of ["RESOURCE_COAL", "RESOURCE_OIL", "RESOURCE_RUBBER"] as const) {
      const policy = getInitialMapResourcePolicyForType(resourceType);
      expect(policy).toMatchObject({
        authoringAge: "AGE_ANTIQUITY",
        status: "deferred-future-age",
      });
      expect(INITIAL_MAP_RESOURCE_TYPES).not.toContain(resourceType);
      expect(INITIAL_MAP_RESOURCE_TYPE_IDS).not.toContain(policy!.staticResourceRowSlot);
    }
  });

  it("filters adapter catalogs to initial-map resource ids only", () => {
    expect(
      filterInitialMapResourceTypeIds(
        Array.from({ length: 55 }, (_, index) => index),
        -1
      )
    ).toEqual(INITIAL_MAP_RESOURCE_TYPE_IDS);
    expect(filterInitialMapResourceTypeIds([38, 4, 36, -1, 40, 4, 99], -1)).toEqual([4]);
  });

  it("uses the runtime Civ7 age when available", () => {
    runtime.Game = { age: 1234 };
    runtime.GameInfo = { Ages: { lookup: () => ({ AgeType: "AGE_MODERN" }) } };

    const allStaticSlots = OFFICIAL_RESOURCE_CORPUS.map((entry) => entry.staticResourceRowSlot);
    const filtered = filterResourceCandidatesForAge(allStaticSlots, resolveActiveResourceAge());

    expect(resolveActiveResourceAge()).toBe("AGE_MODERN");
    expect(filtered).toEqual(expectedStaticSlotsForAge("AGE_MODERN"));
    expect(filtered).not.toContain(18); // RESOURCE_HIDES, Antiquity-only
    expect(filtered).not.toContain(21); // RESOURCE_SALT, Antiquity-only
    expect(filtered).toContain(36); // RESOURCE_COAL, Modern-only
    expect(filtered).toContain(38); // RESOURCE_OIL, Modern-only
  });
});
