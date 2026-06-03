import { describe, expect, it, vi } from "vitest";

import {
  CIV7_MAP_SEED_MAX,
  assertCiv7MapSeed,
  clampCiv7MapSeed,
  isCiv7MapSeed,
  randomCiv7MapSeed,
} from "../../src/shared/civ7Seed";

describe("Civ7 seed utilities", () => {
  it("accepts only the Civ7 setup seed range", () => {
    expect(isCiv7MapSeed(0)).toBe(true);
    expect(isCiv7MapSeed(CIV7_MAP_SEED_MAX)).toBe(true);
    expect(isCiv7MapSeed(CIV7_MAP_SEED_MAX + 1)).toBe(false);
    expect(isCiv7MapSeed(-1)).toBe(false);
  });

  it("clamps Studio seeds to values Civ7 can read back unchanged", () => {
    expect(clampCiv7MapSeed("123")).toBe(123);
    expect(clampCiv7MapSeed(String(CIV7_MAP_SEED_MAX + 100))).toBe(CIV7_MAP_SEED_MAX);
    expect(clampCiv7MapSeed("-12")).toBe(0);
    expect(clampCiv7MapSeed("not-a-seed")).toBe(0);
  });

  it("rejects invalid Run-in-Game seeds instead of relying on Civ7 setup clamping", () => {
    expect(assertCiv7MapSeed("456")).toBe(456);
    expect(() => assertCiv7MapSeed(CIV7_MAP_SEED_MAX + 1)).toThrow("seed must be an integer between 0 and 2147483647");
  });

  it("rerolls inside the Civ7 seed range", () => {
    vi.stubGlobal("crypto", undefined);
    const spy = vi.spyOn(Math, "random").mockReturnValue(0.9999999999);
    try {
      expect(randomCiv7MapSeed()).toBeLessThanOrEqual(CIV7_MAP_SEED_MAX);
      expect(randomCiv7MapSeed()).toBeGreaterThanOrEqual(0);
    } finally {
      spy.mockRestore();
      vi.unstubAllGlobals();
    }
  });
});
