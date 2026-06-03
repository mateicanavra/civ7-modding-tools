import { describe, expect, it } from "bun:test";

import { hashUint32, hashUnit } from "@mapgen/lib/rng/hash.js";

describe("rng/hash", () => {
  it("returns stable integer and unit hashes for the same seed, value, and salt", () => {
    expect(hashUint32(17, 42, 3)).toBe(hashUint32(17, 42, 3));
    expect(hashUnit(17, 42, 3)).toBe(hashUnit(17, 42, 3));
    expect(hashUnit(17, 42, 3)).toBeGreaterThanOrEqual(0);
    expect(hashUnit(17, 42, 3)).toBeLessThanOrEqual(1);
  });

  it("changes when any coordinate key changes", () => {
    const baseline = hashUint32(17, 42, 3);

    expect(hashUint32(18, 42, 3)).not.toBe(baseline);
    expect(hashUint32(17, 43, 3)).not.toBe(baseline);
    expect(hashUint32(17, 42, 4)).not.toBe(baseline);
  });
});
