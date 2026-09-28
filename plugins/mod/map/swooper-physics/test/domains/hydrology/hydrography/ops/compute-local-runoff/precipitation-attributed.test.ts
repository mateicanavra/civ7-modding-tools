import { describe, expect, it } from "bun:test";
import hydrology from "../../../../../../src/domain/hydrology/router.js";

const { computeLocalRunoff, accumulateDischarge, projectRiverNetwork } = hydrology.hydrography.ops;
const config = {
  strategy: "precipitation-attributed",
  config: { infiltrationFraction: 0.15, humidityDampening: 0.25 },
} as const;
const input = () => ({
  width: 4,
  height: 1,
  landMask: Uint8Array.of(0, 1, 1, 1),
  rainfall: Uint8Array.of(200, 51, 99, 0),
  humidity: Uint8Array.of(0, 56, 121, 255),
});

describe("hydrology/compute-local-runoff", () => {
  it("preserves the original source arithmetic before Float32 narrowing and attributes no more than rainfall", () => {
    const forcing = input();
    const before = structuredClone(forcing);
    const { runoff } = computeLocalRunoff.run(forcing, config);
    const legacy = accumulateDischarge.run(
      { ...forcing, flowDir: Int32Array.of(-1, 0, 1, 2) },
      {
        strategy: "topological-runoff",
        config: { ...config.config, runoffScale: 1, minRunoff: 0 },
      }
    );
    expect(Array.isArray(runoff)).toBe(true);
    expect(runoff[0]).toBe(0);
    expect(runoff[3]).toBe(0);
    expect(runoff[1]).toBe(51 * (1 - 0.15) * (1 - 0.25 * (56 / 255)));
    expect(runoff[1]).not.toBe(Math.fround(runoff[1]!));
    for (let cell = 0; cell < runoff.length; cell++) {
      expect(runoff[cell]).toBeGreaterThanOrEqual(0);
      expect(runoff[cell]).toBeLessThanOrEqual(forcing.rainfall[cell]!);
      expect(Math.fround(runoff[cell]!)).toBe(legacy.runoff[cell]!);
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
    forcing.landMask[1] = 2;
    expect(() => computeLocalRunoff.run(forcing, config)).toThrow("binary");
    expect(Object.keys(computeLocalRunoff.defaultConfig.config)).toEqual([
      "infiltrationFraction",
      "humidityDampening",
    ]);
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
