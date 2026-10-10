import { describe, expect, it } from "bun:test";
import { runAdmittedOperationForTest } from "@swooper/mapgen-core/testing";
import hydrology from "../../../../../../src/domain/hydrology/router.js";

const { computeLocalRunoff, projectRiverNetwork } = hydrology.hydrography.ops;
const config = {
  strategy: "precipitation-attributed",
  config: { infiltrationFraction: 0.15, humidityDampening: 0.25 },
} as const;
const input = () => ({
  width: 4,
  height: 1,
  externalWaterMask: Uint8Array.of(1, 0, 0, 0),
  precipitation: Float32Array.of(420.75, 51.125, 399.75, 0),
  surfaceWetness: Float32Array.from([0, 56, 121, 255], value => value / 255),
});

describe("hydrology/compute-local-runoff", () => {
  it("uses unclipped float precipitation and normalized wetness without narrowing Number runoff", () => {
    const forcing = input();
    const before = structuredClone(forcing);
    const { runoff } = computeLocalRunoff.run(forcing, config);
    expect(Array.isArray(runoff)).toBe(true);
    expect(runoff[0]).toBe(0);
    expect(runoff[3]).toBe(0);
    expect(runoff[1]).toBe(51.125 * (1 - 0.15) * (1 - 0.25 * forcing.surfaceWetness[1]!));
    expect(runoff[2]).toBe(399.75 * (1 - 0.15) * (1 - 0.25 * forcing.surfaceWetness[2]!));
    expect(runoff[2]).toBeGreaterThan(255);
    expect(runoff[1]).not.toBe(Math.fround(runoff[1]!));
    for (let cell = 0; cell < runoff.length; cell++) {
      expect(runoff[cell]).toBeGreaterThanOrEqual(0);
      expect(runoff[cell]).toBeLessThanOrEqual(forcing.precipitation[cell]!);
    }
    expect(computeLocalRunoff.run(forcing, config)).toEqual({ runoff });
    expect(forcing).toEqual(before);
  });

  it("admits zero/full fraction boundaries but rejects malformed masks and hidden floor or scale controls", () => {
    const forcing = input();
    expect(
      computeLocalRunoff.run(forcing, {
        strategy: "precipitation-attributed",
        config: { infiltrationFraction: 1, humidityDampening: 0 },
      }).runoff
    ).toEqual([0, 0, 0, 0]);
    forcing.externalWaterMask[1] = 2;
    expect(() => computeLocalRunoff.run(forcing, config)).toThrow("binary");
    for (const invalid of [-1, NaN, Infinity]) {
      const malformed = input();
      malformed.precipitation[1] = invalid;
      expect(() => computeLocalRunoff.run(malformed, config)).toThrow("precipitation");
    }
    for (const invalid of [-1, 1.01, NaN, Infinity]) {
      const malformed = input();
      malformed.surfaceWetness[1] = invalid;
      expect(() => computeLocalRunoff.run(malformed, config)).toThrow("surface wetness");
    }
    for (const retired of [{ minRunoff: 0 }, { runoffScale: 1 }]) {
      const retiredSelection = { ...config, config: { ...config.config, ...retired } };
      expect(() =>
        runAdmittedOperationForTest(computeLocalRunoff, input(), retiredSelection)
      ).toThrow();
    }
  });

  it("classifies supplied Number discharge without a Float32 threshold round-trip", () => {
    const low = 1 + 2 ** -26,
      high = 1 + 2 ** -25;
    expect(Math.fround(low)).toBe(Math.fround(high));
    const result = projectRiverNetwork.run(
      {
        width: 3,
        height: 1,
        landMask: Uint8Array.of(0, 1, 1),
        flowDir: Int32Array.of(-1, 0, 0),
        discharge: [0, low, high],
      },
      {
        strategy: "discharge-percentiles",
        config: {
          minorPercentile: 1,
          majorPercentile: 1,
          minMinorDischarge: 0,
          minMajorDischarge: 10,
        },
      }
    );
    expect(result.minorThreshold).toBe(high);
    expect(Array.from(result.riverClass)).toEqual([0, 0, 1]);
  });
});
