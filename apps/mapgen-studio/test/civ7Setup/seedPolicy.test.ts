import { describe, expect, it } from "vitest";

import {
  CIV7_STUDIO_SEED_MAX,
  formatCiv7StudioSeedError,
  parseCiv7StudioSeed,
  randomCiv7StudioSeed,
} from "../../src/features/civ7Setup/seedPolicy";

describe("Civ7 Studio seed policy", () => {
  it("accepts non-negative signed-int Civ7 setup seeds", () => {
    expect(parseCiv7StudioSeed("0")).toEqual({ ok: true, value: 0 });
    expect(parseCiv7StudioSeed(String(CIV7_STUDIO_SEED_MAX))).toEqual({
      ok: true,
      value: CIV7_STUDIO_SEED_MAX,
    });
  });

  it("rejects empty, non-integer, negative, and uint32-overflow seeds", () => {
    expect(parseCiv7StudioSeed("")).toMatchObject({ ok: false, reason: "empty" });
    expect(parseCiv7StudioSeed("1.5")).toMatchObject({ ok: false, reason: "not-integer" });
    expect(parseCiv7StudioSeed("-1")).toMatchObject({ ok: false, reason: "out-of-range" });
    expect(parseCiv7StudioSeed("2147483648")).toMatchObject({ ok: false, reason: "out-of-range" });
  });

  it("generates seeds that Civ7 will not wrap during setup readback", () => {
    for (let i = 0; i < 100; i += 1) {
      const seed = parseCiv7StudioSeed(randomCiv7StudioSeed());
      expect(seed.ok ? seed.value : formatCiv7StudioSeedError(seed)).toEqual(expect.any(Number));
    }
  });
});
