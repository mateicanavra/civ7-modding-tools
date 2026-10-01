import { describe, expect, it } from "bun:test";

import {
  projectStandardElevation,
  STANDARD_NATIVE_ELEVATION_SCALE,
  STANDARD_NATIVE_LAND_ELEVATION_FLOOR,
} from "../../../src/recipes/standard/elevation-projection.js";

function input(elevation: readonly number[], seaLevel = 0) {
  return {
    elevation,
    seaLevel,
    landMask: elevation.map(() => 1),
    acceptedLakeMask: elevation.map(() => 0),
  };
}

describe("Standard physical-to-native elevation policy", () => {
  it("uses the empirical native floor and fixed product scale without per-map normalization", () => {
    expect(STANDARD_NATIVE_LAND_ELEVATION_FLOOR).toBe(128);
    expect(STANDARD_NATIVE_ELEVATION_SCALE).toBe(10);
    expect(projectStandardElevation(input([0, 1, 22, 63, 81]))).toEqual([128, 138, 348, 758, 938]);
    expect(projectStandardElevation(input([0, 1, 22, 63, 81, 158]))).toEqual([
      128, 138, 348, 758, 938, 1708,
    ]);
  });

  it("is deterministic, returns independent arrays, and never changes input surfaces", () => {
    const source = Object.freeze({
      elevation: Object.freeze([-7, 4, 19, 50]),
      seaLevel: 3,
      landMask: Object.freeze([0, 1, 1, 1]),
      acceptedLakeMask: Object.freeze([0, 0, 1, 0]),
    });
    const before = structuredClone(source);
    const first = projectStandardElevation(source);
    const second = projectStandardElevation(source);
    expect(first).toEqual(second);
    expect(first).not.toBe(second);
    first[1] = 999;
    expect(projectStandardElevation(source)).toEqual(second);
    expect(source).toEqual(before);
  });

  it("preserves strict ranks and ties among quantized physical land heights above the datum", () => {
    const physical = [40, 12, 13, 12, 81, 30];
    const projected = projectStandardElevation(input(physical, 11.25));
    for (let left = 0; left < physical.length; left += 1) {
      for (let right = 0; right < physical.length; right += 1) {
        expect(Math.sign(projected[left]! - projected[right]!)).toBe(
          Math.sign(physical[left]! - physical[right]!)
        );
      }
    }
    expect(projected[1]).toBe(136);
  });

  it("uses the physical sea datum, remaining invariant when that entire datum is translated", () => {
    expect(projectStandardElevation(input([12, 33, 92], 11))).toEqual([138, 348, 938]);
    expect(projectStandardElevation(input([-88, -67, -8], -89))).toEqual([138, 348, 938]);
    expect(projectStandardElevation(input([-100, 0], 0))).toEqual([128, 128]);
  });

  it("zeros non-lake ocean and preserves unlevelled physical requests for every accepted lake", () => {
    expect(
      projectStandardElevation({
        elevation: new Int16Array([-100, 80, 20, 30, 40]),
        seaLevel: 10,
        landMask: new Uint8Array([0, 0, 1, 0, 1]),
        acceptedLakeMask: new Uint8Array([0, 0, 1, 1, 0]),
      })
    ).toEqual([0, 0, 228, 328, 428]);
  });

  it("clamps accepted-lake requests below the physical datum to 128 on either modeled mask", () => {
    expect(projectStandardElevation({
      elevation: Int16Array.of(-1, 0, 1, -1, 0, 1, -1),
      seaLevel: 0,
      landMask: Uint8Array.of(1, 1, 1, 0, 0, 0, 0),
      acceptedLakeMask: Uint8Array.of(1, 1, 1, 1, 1, 1, 0),
    })).toEqual([128, 128, 138, 128, 128, 138, 0]);
  });

  it("rejects empty, incomplete, and nonbinary surfaces", () => {
    for (const invalid of [
      input([]),
      { ...input([1]), landMask: [] },
      { ...input([1]), acceptedLakeMask: [0, 0] },
      { ...input([1]), landMask: [2] },
      { ...input([1]), landMask: [-1] },
      { ...input([1]), acceptedLakeMask: [0.5] },
      { ...input([1]), acceptedLakeMask: [Number.NaN] },
    ]) {
      expect(() => projectStandardElevation(invalid)).toThrow();
    }
  });

  it.each([
    Number.NaN,
    Number.POSITIVE_INFINITY,
    Number.NEGATIVE_INFINITY,
  ])("rejects non-finite physical samples and sea datum %s, including ocean samples", (invalid) => {
    expect(() => projectStandardElevation(input([1], invalid))).toThrow(/finite.*datum/);
    expect(() => projectStandardElevation({ ...input([invalid]), landMask: [0] })).toThrow(
      /not finite at plot 0/
    );
  });

  it("refuses overflow instead of flattening peaks or allowing native integer wrapping", () => {
    expect(projectStandardElevation(input([6540.7]))).toEqual([65_535]);
    expect(() => projectStandardElevation(input([6540.8]))).toThrow(/exceeds 65535/);
    expect(() => projectStandardElevation(input([Number.MAX_VALUE], -Number.MAX_VALUE))).toThrow(
      /exceeds 65535/
    );
    expect(() =>
      projectStandardElevation({
        ...input([6540.8]),
        landMask: [0],
        acceptedLakeMask: [1],
      })
    ).toThrow(/exceeds 65535/);
  });
});
