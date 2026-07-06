import { describe, expect, it } from "bun:test";
import { quantizeI8Symmetric, quantizeU8 } from "@mapgen/lib/math/index.js";

describe("lib/math quantize", () => {
  it("quantizes unsigned bytes with rounding and saturation", () => {
    expect(quantizeU8(Number.NaN)).toBe(0);
    expect(quantizeU8(Number.NEGATIVE_INFINITY)).toBe(0);
    expect(quantizeU8(Number.POSITIVE_INFINITY)).toBe(255);

    expect(quantizeU8(-1)).toBe(0);
    expect(quantizeU8(0)).toBe(0);
    expect(quantizeU8(12.49)).toBe(12);
    expect(quantizeU8(12.5)).toBe(13);
    expect(quantizeU8(255)).toBe(255);
    expect(quantizeU8(256)).toBe(255);
  });

  it("quantizes signed symmetric i8 values with rounding and saturation", () => {
    expect(quantizeI8Symmetric(Number.NaN)).toBe(0);
    expect(quantizeI8Symmetric(Number.NEGATIVE_INFINITY)).toBe(-127);
    expect(quantizeI8Symmetric(Number.POSITIVE_INFINITY)).toBe(127);

    expect(quantizeI8Symmetric(-128)).toBe(-127);
    expect(quantizeI8Symmetric(-12.5)).toBe(-12);
    expect(quantizeI8Symmetric(-12.51)).toBe(-13);
    expect(quantizeI8Symmetric(0)).toBe(0);
    expect(quantizeI8Symmetric(12.49)).toBe(12);
    expect(quantizeI8Symmetric(12.5)).toBe(13);
    expect(quantizeI8Symmetric(128)).toBe(127);
  });
});
