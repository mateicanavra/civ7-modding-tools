import { afterEach, describe, expect, it } from "bun:test";

import { OFFICIAL_RESOURCE_CORPUS } from "../../src/domain/resources/index.js";
import {
  filterResourceCandidatesForAge,
  resolveActiveResourceAge,
} from "../../src/recipes/standard/stages/placement/steps/derive-placement-inputs/inputs.js";

type RuntimeGlobals = typeof globalThis & {
  Game?: { age?: unknown };
  GameInfo?: { Ages?: { lookup?: (age: number) => { AgeType?: unknown } | null } };
};

const runtime = globalThis as RuntimeGlobals;
const originalGame = runtime.Game;
const originalGameInfo = runtime.GameInfo;

function expectedStaticSlotsForAge(age: string): number[] {
  return OFFICIAL_RESOURCE_CORPUS
    .filter(
      (entry) =>
        entry.validAges.includes(age as never) &&
        entry.placeability.status === "placeable" &&
        entry.strategyRequired.status === "required"
    )
    .map((entry) => entry.staticResourceRowSlot);
}

function restoreRuntimeGlobals(): void {
  if (originalGame === undefined) delete runtime.Game;
  else runtime.Game = originalGame;
  if (originalGameInfo === undefined) delete runtime.GameInfo;
  else runtime.GameInfo = originalGameInfo;
}

describe("resource age filtering", () => {
  afterEach(() => {
    restoreRuntimeGlobals();
  });

  it("defaults offline placement to source-backed Antiquity resource candidates", () => {
    const allStaticSlots = OFFICIAL_RESOURCE_CORPUS.map((entry) => entry.staticResourceRowSlot);
    const expected = expectedStaticSlotsForAge("AGE_ANTIQUITY");
    const filtered = filterResourceCandidatesForAge(allStaticSlots, resolveActiveResourceAge());

    expect(resolveActiveResourceAge()).toBe("AGE_ANTIQUITY");
    expect(filtered).toEqual(expected);
    expect(filtered).toHaveLength(34);
    expect(filtered).not.toContain(24); // RESOURCE_COCOA, Exploration+
    expect(filtered).not.toContain(33); // RESOURCE_COFFEE, Modern-only
    expect(filtered).not.toContain(36); // RESOURCE_COAL, Modern-only
    expect(filtered).not.toContain(38); // RESOURCE_OIL, Modern-only
    expect(filtered).not.toContain(40); // RESOURCE_RUBBER, Modern-only
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

  it("excludes blocked and no-biome-row resources even when their age matches", () => {
    const allStaticSlots = OFFICIAL_RESOURCE_CORPUS.map((entry) => entry.staticResourceRowSlot);
    const filtered = filterResourceCandidatesForAge(allStaticSlots, "AGE_ANTIQUITY");

    expect(filtered).not.toContain(5); // RESOURCE_GOLD_DISTANT_LANDS
    expect(filtered).not.toContain(15); // RESOURCE_SILVER_DISTANT_LANDS
    expect(filtered).not.toContain(23); // RESOURCE_LAPIS_LAZULI
  });
});
