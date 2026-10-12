import { describe, expect, it } from "bun:test";
import { runAdmittedOperationForTest } from "@swooper/mapgen-core/testing";
import hydrology from "../../../../../../src/domain/hydrology/router.js";

const { computeLocalRunoff, projectRiverNetwork } = hydrology.hydrography.ops;
const config = {
  strategy: "annual-water-yield",
  config: {},
} as const;
const input = () => ({
  width: 4,
  height: 1,
  externalWaterMask: Uint8Array.of(1, 0, 0, 0),
  precipitation: Float32Array.of(420.75, 51.125, 399.75, 0),
  potentialDemand: Float32Array.of(100, 4, 1, 0),
});
const yieldFor = (precipitation: number, demand: number) => computeLocalRunoff.run({
  width: 1, height: 1, externalWaterMask: Uint8Array.of(0),
  precipitation: Float32Array.of(precipitation), potentialDemand: Float32Array.of(demand),
}, config).runoff[0]!;

describe("hydrology/compute-local-runoff", () => {
  it("uses unclipped baseline P/D without narrowing Number yield or mutating inputs", () => {
    const forcing = input();
    const before = structuredClone(forcing);
    const { runoff } = computeLocalRunoff.run(forcing, config);
    expect(Array.isArray(runoff)).toBe(true);
    expect(runoff[0]).toBe(0);
    expect(runoff[3]).toBe(0);
    for (const cell of [1, 2]) {
      const p = forcing.precipitation[cell]!, d = forcing.potentialDemand[cell]!;
      const actualET = p * d / Math.sqrt(p * p + d * d);
      expect(runoff[cell]).toBeCloseTo(p - actualET, 12);
    }
    expect(runoff[2]).toBeGreaterThan(255);
    expect(runoff[1]).not.toBe(Math.fround(runoff[1]!));
    for (let cell = 0; cell < runoff.length; cell++) {
      expect(runoff[cell]).toBeGreaterThanOrEqual(0);
      expect(runoff[cell]).toBeLessThanOrEqual(forcing.precipitation[cell]!);
    }
    expect(computeLocalRunoff.run(forcing, config)).toEqual({ runoff });
    expect(forcing).toEqual(before);
  });

  it("honors hand-computable water/energy limits and preserves tiny positive dry yield", () => {
    expect(yieldFor(3, 4)).toBeCloseTo(.6, 15);
    expect(yieldFor(0, 0)).toBe(0);
    expect(yieldFor(0, 40)).toBe(0);
    expect(yieldFor(40, 0)).toBe(40);
    expect(yieldFor(5, 80)).toBeGreaterThan(0);
    expect(yieldFor(5, 80)).toBeLessThan(yieldFor(5, 40));
    const tiny = Math.fround(1e-20), demand = Math.fround(1e20);
    expect(tiny - tiny * demand / Math.hypot(tiny, demand)).toBe(0);
    expect(yieldFor(tiny, demand)).toBeGreaterThan(0);
    expect(yieldFor(tiny, demand) / (tiny * tiny * tiny / (2 * demand * demand))).toBeCloseTo(1, 14);
  });

  it("partitions finite Float32 regimes within water/energy bounds and monotone P/D response", () => {
    const values = [0, Math.fround(1.401298464324817e-45), Math.fround(1e-20), 3, 4, 100, Math.fround(3.4028234663852886e38)];
    for (const p of values) for (const d of values) {
      const q = yieldFor(p, d), h = Math.hypot(p, d);
      const e = h ? p * (d / h) : 0;
      const error = 8 * Number.EPSILON * Math.max(p, Number.MIN_VALUE);
      expect(Number.isFinite(q)).toBe(true);
      expect(q).toBeGreaterThanOrEqual(0);
      expect(q).toBeLessThanOrEqual(p);
      expect(e).toBeLessThanOrEqual(Math.min(p, d) + error);
      expect(Math.abs(e + q - p)).toBeLessThanOrEqual(error);
    }
    for (const p of values) {
      const q = values.map((d) => yieldFor(p, d));
      for (let i = 1; i < q.length; i++) expect(q[i]).toBeLessThanOrEqual(q[i - 1]!);
    }
    for (const d of values) {
      const q = values.map((p) => yieldFor(p, d));
      for (let i = 1; i < q.length; i++) expect(q[i]).toBeGreaterThanOrEqual(q[i - 1]!);
    }
  });

  it("rejects malformed forcing and retired loss, wetness, floor or scale paths", () => {
    const forcing = input();
    forcing.externalWaterMask[1] = 2;
    expect(() => computeLocalRunoff.run(forcing, config)).toThrow("binary");
    for (const invalid of [-1, NaN, Infinity]) {
      const malformed = input();
      malformed.precipitation[1] = invalid;
      expect(() => computeLocalRunoff.run(malformed, config)).toThrow("precipitation");
    }
    for (const invalid of [-1, NaN, Infinity]) {
      const malformed = input();
      malformed.potentialDemand[1] = invalid;
      expect(() => computeLocalRunoff.run(malformed, config)).toThrow("potential demand");
    }
    expect(() => computeLocalRunoff.run({ ...input(), potentialDemand: Float32Array.of(1) }, config)).toThrow("input admission");
    // @ts-expect-error Retired wetness is deliberately supplied to test runtime refusal.
    expect(() => runAdmittedOperationForTest(computeLocalRunoff, { ...input(), surfaceWetness: new Float32Array(4) }, config)).toThrow();
    // @ts-expect-error The retired strategy is deliberately supplied to test runtime refusal.
    expect(() => runAdmittedOperationForTest(computeLocalRunoff, input(), { strategy: "precipitation-attributed", config: {} })).toThrow();
    for (const retired of [{ infiltrationFraction: .15 }, { humidityDampening: .25 }, { minRunoff: 0 }, { runoffScale: 1 }]) {
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
