import { describe, expect, it } from "bun:test";
import { quantizeUnitVec2I8 } from "@mapgen/lib/grid/index.js";

describe("lib/grid vector field quantization", () => {
  it("returns zero for zero, tiny, and non-finite vectors", () => {
    expect(quantizeUnitVec2I8(0, 0)).toEqual({ x: 0, y: 0 });
    expect(quantizeUnitVec2I8(1e-12, 0)).toEqual({ x: 0, y: 0 });
    expect(quantizeUnitVec2I8(Number.NaN, 1)).toEqual({ x: 0, y: 0 });
    expect(quantizeUnitVec2I8(1, Number.POSITIVE_INFINITY)).toEqual({ x: 0, y: 0 });
  });

  it("normalizes cardinal and diagonal vectors into signed i8 components", () => {
    expect(quantizeUnitVec2I8(3, 0)).toEqual({ x: 127, y: 0 });
    expect(quantizeUnitVec2I8(-3, 0)).toEqual({ x: -127, y: 0 });
    expect(quantizeUnitVec2I8(0, 5)).toEqual({ x: 0, y: 127 });
    expect(quantizeUnitVec2I8(0, -5)).toEqual({ x: 0, y: -127 });

    expect(quantizeUnitVec2I8(1, 1)).toEqual({ x: 90, y: 90 });
    expect(quantizeUnitVec2I8(-1, 1)).toEqual({ x: -90, y: 90 });
  });

  it("always stays inside the signed i8 symmetric component bounds", () => {
    for (const [x, y] of [
      [1, 1000],
      [1000, 1],
      [-1000, -1],
      [Number.MAX_VALUE, Number.MAX_VALUE],
    ]) {
      const q = quantizeUnitVec2I8(x, y);
      expect(q.x).toBeGreaterThanOrEqual(-127);
      expect(q.x).toBeLessThanOrEqual(127);
      expect(q.y).toBeGreaterThanOrEqual(-127);
      expect(q.y).toBeLessThanOrEqual(127);
    }
  });
});
