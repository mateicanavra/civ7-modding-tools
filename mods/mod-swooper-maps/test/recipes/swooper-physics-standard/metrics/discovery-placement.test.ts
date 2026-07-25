import { describe, expect, it } from "bun:test";
import { measureStandardDiscoveryPlacement } from "../../../../src/recipes/standard/metrics/families/discovery-placement.js";

describe("Standard discovery-placement measurements", () => {
  it("derives rejected placements from the observed attempt and acceptance counts", () => {
    expect(
      measureStandardDiscoveryPlacement({
        attemptedCount: 7,
        placedCount: 5,
      })
    ).toEqual({
      version: 1,
      attemptedCount: 7,
      placedCount: 5,
      rejectedCount: 2,
    });
  });

  it("refuses acceptance counts that exceed the attempted placements", () => {
    expect(() =>
      measureStandardDiscoveryPlacement({
        attemptedCount: 2,
        placedCount: 3,
      })
    ).toThrow("Discovery placement accepted 3 of 2 attempts.");
  });
});
