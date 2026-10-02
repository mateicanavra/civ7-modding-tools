import { describe, expect, it } from "bun:test";
import { OperationInputAdmissionError } from "@swooper/mapgen-core/authoring";
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
  it("accumulates periodic pressure in binary64 before the final Float32 projection", () => {
    const samples = [sample(16_777_216), sample(1), sample(-16_777_216)];
    const weights = [1 / 3, 1 / 3, 1 / 3];
    const annual = op.run({ ...grid, reduction: "annual", model: "periodic-cycle", weights, samples }, config);
    const weather = op.run({ ...grid, reduction: "weather-members", samples }, config);
    expect(annual.pressure).toEqual(Float32Array.from([0, 1], i =>
      samples.reduce((sum, s, phase) => sum + s.pressure[i]! * weights[phase]!, 0)));
    expect(weather.pressure).toEqual(new Float32Array([1 / 3, 1 / 6]));
    expect(annual.pressure).toEqual(weather.pressure);
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

  it("uses the supplied same-weight phase measure for periodic pressure and vectors", () => {
    const samples = [sample(10, 10, -10), sample(30, 30, -30)];
    const weights = [0.25, 0.75];
    const result = op.run({ ...grid, reduction: "annual", model: "periodic-cycle", weights, samples }, config);
    expect(result.pressure).toEqual(new Float32Array([25, 12.5]));
    expect(result.windU[0]).toBe(25);
    expect(result.windV[0]).toBe(-25);
  });

  it("reduces deterministic varied samples using binary64 weighted sums", () => {
    let seed = 381;
    const random = () => ((seed = Math.imul(seed, 1664525) + 1013904223 | 0) >>> 0) / 2 ** 32;
    for (let run = 0; run < 100; run++) {
      const samples = Array.from({ length: run % 2 ? 2 : 4 }, () => sample((random() - 0.5) * 100, Math.floor(random() * 256) - 128, Math.floor(random() * 256) - 128));
      const n = samples.length;
      const result = op.run({ ...grid, reduction: "annual", model: "periodic-cycle", weights: samples.map(() => 1 / n), samples }, config);
      if (!("pressure" in result)) throw new Error("Wrong reduction branch");
      const pressure = Float32Array.from([0, 1], i => samples.reduce((sum, s) => sum + s.pressure[i]! / n, 0));
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
      { reduction: "thermal-centering", samples: [new Float32Array(2), new Float32Array(2)] },
      { reduction: "ground-thermal-mean", samples: [new Float32Array(2), new Float32Array(2)] },
    ]) expect(() => op.run({ ...base, ...bad } as never, config)).toThrow();
  });

  it("schema-refuses retired annual model tags before the reducer executes", () => {
    for (const model of ["legacy-snapshots", "unknown-model"]) {
      expect(() => op.run({
        ...grid, reduction: "annual", model, weights: [0.5, 0.5], samples: [sample(10), sample(20)],
      } as never, config)).toThrow(OperationInputAdmissionError);
    }
  });
});
