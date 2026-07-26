import { describe, expect, it } from "bun:test";
import { computeMaskDistanceFieldOddQ } from "../../../src/lib/grid/index.js";

describe("computeMaskDistanceFieldOddQ", () => {
  it("bounds expansion while preserving wrapped hex distance", () => {
    const width = 7;
    const height = 5;
    const size = width * height;
    const mask = new Uint8Array(size).fill(1);
    const source = 2 * width;

    const distance = computeMaskDistanceFieldOddQ({
      mask,
      width,
      height,
      sources: [source],
      maxDistance: 1,
    });
    const unbounded = computeMaskDistanceFieldOddQ({
      mask,
      width,
      height,
      sources: [source],
    });
    const sourceOnly = computeMaskDistanceFieldOddQ({
      mask,
      width,
      height,
      sources: [source],
      maxDistance: 0,
    });

    expect(distance[source]).toBe(0);
    expect(distance[2 * width + width - 1]).toBe(1);
    expect(distance[width + width - 1]).toBe(1);
    expect(distance[3 * width + width - 1]).toBe(1);
    expect(distance[2 * width + 2]).toBe(-1);
    expect(distance[width + 1]).toBe(-1);
    expect(unbounded[2 * width + 2]).toBe(2);
    expect(unbounded[width + 1]).toBe(2);
    expect(sourceOnly[source]).toBe(0);
    expect(sourceOnly[2 * width + width - 1]).toBe(-1);
  });
});
