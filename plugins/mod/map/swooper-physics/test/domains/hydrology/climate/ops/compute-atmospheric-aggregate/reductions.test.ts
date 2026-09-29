import { describe, expect, it } from "bun:test";
import hydrology from "../../../../../../src/domain/hydrology/router.js";

const op = hydrology.climate.ops.computeAtmosphericAggregate;
const config = { strategy: "phase-reduction", config: {} } as const;
const grid = { width: 2, height: 1 };
function sample(p: number, u = 0, v = 0) {
  return {
    pressure: new Float32Array([p, p / 2]),
    windU: new Int8Array([u, -128]), windV: new Int8Array([v, 127]),
    currentU: new Int8Array([u, -128]), currentV: new Int8Array([v, 127]),
  };
}

describe("hydrology/compute-atmospheric-aggregate", () => {
  it("distinguishes legacy Float32 accumulation from weather and ground double sums", () => {
    const samples = [sample(16_777_216), sample(1), sample(-16_777_216)];
    const weights = [1 / 3, 1 / 3, 1 / 3];
    const annual = op.run({ ...grid, reduction: "annual", model: "legacy-snapshots", weights, samples }, config);
    const weather = op.run({ ...grid, reduction: "weather-members", samples }, config);
    const centering = op.run({
      ...grid, reduction: "thermal-centering", model: "legacy-snapshots", weights,
      samples: samples.map((s) => s.pressure),
    }, config);
    const ground = op.run({ ...grid, reduction: "ground-thermal-mean", samples: samples.map((s) => s.pressure) }, config);
    if (!("pressure" in annual) || !("pressure" in weather) ||
        !("meanSurfaceTemperatureC" in centering) || !("meanSurfaceTemperatureC" in ground)) throw new Error("Wrong reduction branch");
    expect(annual.pressure).toEqual(new Float32Array(2));
    expect(centering.meanSurfaceTemperatureC).toEqual(annual.pressure);
    expect(weather.pressure).toEqual(new Float32Array([1 / 3, 1 / 6]));
    expect(ground.meanSurfaceTemperatureC).toEqual(weather.pressure);
  });

  it("retains signed-byte rounding/clamping and does not mutate or alias input fields", () => {
    const samples = [sample(10, -2, 2), sample(20, -1, 3)];
    const before = structuredClone(samples);
    const result = op.run({ ...grid, reduction: "weather-members", samples }, config);
    if (!("pressure" in result)) throw new Error("Wrong reduction branch");
    expect(result.windU).toEqual(new Int8Array([-1, -127]));
    expect(result.windV).toEqual(new Int8Array([3, 127]));
    expect(result.currentU).toEqual(result.windU);
    expect(result.currentV).toEqual(result.windV);
    expect(result.pressure).toEqual(new Float32Array([15, 7.5]));
    expect(samples).toEqual(before);
    expect(result.pressure).not.toBe(samples[0]!.pressure);
  });

  it("uses the supplied same-weight phase measure for periodic pressure, vectors and centering", () => {
    const samples = [sample(10, 10, -10), sample(30, 30, -30)];
    const weights = [0.25, 0.75];
    const result = op.run({ ...grid, reduction: "annual", model: "periodic-cycle", weights, samples }, config);
    const center = op.run({
      ...grid, reduction: "thermal-centering", model: "periodic-cycle", weights, samples: samples.map((s) => s.pressure),
    }, config);
    if (!("pressure" in result) || !("meanSurfaceTemperatureC" in center)) throw new Error("Wrong reduction branch");
    expect(result.pressure).toEqual(new Float32Array([25, 12.5]));
    expect(center.meanSurfaceTemperatureC).toEqual(result.pressure);
    expect(result.windU[0]).toBe(25);
    expect(result.windV[0]).toBe(-25);
  });

  it("reproduces the old reducers across deterministic varied samples", () => {
    let seed = 381;
    const random = () => ((seed = Math.imul(seed, 1664525) + 1013904223 | 0) >>> 0) / 2 ** 32;
    for (let run = 0; run < 100; run++) {
      const samples = Array.from({ length: run % 2 ? 2 : 4 }, () => sample((random() - 0.5) * 100, Math.floor(random() * 256) - 128, Math.floor(random() * 256) - 128));
      const n = samples.length;
      const result = op.run({ ...grid, reduction: "annual", model: "legacy-snapshots", weights: samples.map(() => 1 / n), samples }, config);
      if (!("pressure" in result)) throw new Error("Wrong reduction branch");
      const pressure = new Float32Array(2);
      for (const s of samples) for (let i = 0; i < 2; i++) pressure[i]! += s.pressure[i]!;
      for (let i = 0; i < 2; i++) pressure[i]! /= n;
      expect(result.pressure).toEqual(pressure);
      for (const key of ["windU", "windV", "currentU", "currentV"] as const) {
        expect(result[key]).toEqual(Int8Array.from([0, 1], (i) =>
          Math.max(-127, Math.min(127, Math.round(samples.reduce((sum, s) => sum + s[key][i]!, 0) / n)))));
      }
    }
  });

  it("refuses empty, nonfinite, wrong-constructor, unaligned and invalid-weight inputs", () => {
    const base = { ...grid, reduction: "annual" as const, model: "periodic-cycle" as const, weights: [0.5, 0.5], samples: [sample(10), sample(20)] };
    for (const bad of [
      { samples: [] }, { weights: [1] }, { weights: [0, 1] }, { weights: [0.2, 0.2] },
      { weights: [NaN, 1] }, { width: 3 }, { model: "legacy-snapshots", weights: [0.25, 0.75] },
      { samples: [sample(NaN), sample(20)] },
      { samples: [{ ...sample(10), windU: new Uint8Array(2) }, sample(20)] },
    ]) expect(() => op.run({ ...base, ...bad } as never, config)).toThrow();
  });
});
