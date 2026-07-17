import { describe, expect, it } from "bun:test";

import { getHexRadiusIndicesOddQ, hexDistanceOddQPeriodicX } from "../../../src/lib/grid/index.js";

function radiusDistance(from: number, to: number, width: number, height: number): number {
  for (let radius = 0; radius < width + height; radius++) {
    if (getHexRadiusIndicesOddQ(from, width, height, radius).includes(to)) return radius;
  }
  throw new Error(`No radius path from ${from} to ${to} on ${width}x${height}.`);
}

describe("hexDistanceOddQPeriodicX", () => {
  it("chooses the shorter cube image at even-width half-wrap ties", () => {
    expect(hexDistanceOddQPeriodicX(0, 6, 4)).toBe(2);
    expect(hexDistanceOddQPeriodicX(6, 0, 4)).toBe(2);
  });

  it("fails closed for values that cannot identify plots on an integral-width grid", () => {
    for (const [from, to, width] of [
      [-1, 0, 4],
      [0, -1, 4],
      [0.5, 1, 4],
      [0, 1.5, 4],
      [0, 1, 0],
      [0, 1, -1],
      [0, 1, 1.5],
      [0, Number.MAX_SAFE_INTEGER + 1, 4],
    ] as const) {
      expect(() => hexDistanceOddQPeriodicX(from, to, width)).toThrow(RangeError);
    }
  });

  it("preserves row identity above the signed 32-bit range", () => {
    expect(hexDistanceOddQPeriodicX(0, 8_589_934_592, 4)).toBe(2_147_483_648);
  });

  it("matches canonical radius traversal across small periodic grids", () => {
    for (let width = 1; width <= 8; width++) {
      for (let height = 1; height <= 6; height++) {
        const size = width * height;
        for (let from = 0; from < size; from++) {
          for (let to = 0; to < size; to++) {
            expect(hexDistanceOddQPeriodicX(from, to, width)).toBe(
              radiusDistance(from, to, width, height)
            );
          }
        }
      }
    }
  });
});
