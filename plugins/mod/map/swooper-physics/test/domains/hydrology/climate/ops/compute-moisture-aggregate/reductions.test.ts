import { describe, expect, it } from "bun:test";
import { OperationInputAdmissionError } from "@swooper/mapgen-core/authoring";
import hydrology from "../../../../../../src/domain/hydrology/router.js";

const op = hydrology.climate.ops.computeMoistureAggregate;
const config = { strategy: "phase-reduction", config: {} } as const;
const grid = { width: 2, height: 1 };
const sample = (rain: number, wetness: number, pet: number) => ({
  precipitation: new Float32Array([rain, 450.25]),
  surfaceWetness: new Float32Array([wetness, 1]),
  potentialDemand: [pet, pet / 2],
});

describe("hydrology/compute-moisture-aggregate", () => {
  it("independently averages member P/W before demand without rounding or deriving W from mean P", () => {
    const memberSamples = [sample(0.25, 0, 0), sample(400.75, 1, 0)]
      .map(({ precipitation, surfaceWetness }) => ({ precipitation, surfaceWetness }));
    const pair = op.run({ ...grid, reduction: "weather-members", samples: memberSamples }, config);
    expect(pair.precipitation).toEqual(new Float32Array([200.5, 450.25]));
    expect(pair.surfaceWetness).toEqual(new Float32Array([0.5, 1]));
    expect(Object.keys(pair).sort()).toEqual(["precipitation", "reduction", "surfaceWetness"]);
    const result = op.run({
      ...grid, reduction: "annual", model: "periodic-cycle", weights: [0.5, 0.5],
      samples: [{ precipitation: pair.precipitation, surfaceWetness: pair.surfaceWetness, potentialDemand: [3, 7] }, sample(0.25, 0, 9)],
    }, config);
    if (result.reduction !== "annual") throw new Error("Wrong reduction branch");
    expect(result.precipitation).toEqual(new Float32Array([100.375, 450.25]));
    expect(result.surfaceWetness).toEqual(new Float32Array([0.25, 1]));
    expect(result.rainfallCodec).toEqual(new Uint8Array([100, 200]));
    expect(result.potentialDemand).toEqual(new Float32Array([6, 5.75]));
    expect(result.surfaceWetness[0]).not.toBe(Math.fround(result.precipitation[0]! / 200));
  });

  it("uses every integration phase for float amplitudes and calendar-weighted P/W/D means", () => {
    const samples = [sample(10.25, 0.2, 2), sample(400.5, 1, 10), sample(50.125, 0.4, 5)];
    const before = structuredClone(samples);
    const result = op.run({ ...grid, reduction: "annual", model: "periodic-cycle", weights: [0.25, 0.25, 0.5], samples }, config);
    if (result.reduction !== "annual") throw new Error("Wrong reduction branch");
    expect(result.precipitation[0]).toBe(Math.fround(10.25 / 4 + 400.5 / 4 + 50.125 / 2));
    expect(result.surfaceWetness[0]).toBe(Math.fround(samples[0]!.surfaceWetness[0]! / 4 + 1 / 4 + samples[2]!.surfaceWetness[0]! / 2));
    expect(result.potentialDemand).toEqual(new Float32Array([5.5, 2.75]));
    expect(result.precipitationAmplitude[0]).toBe(Math.fround((400.5 - 10.25) / 2));
    expect(result.surfaceWetnessAmplitude[0]).toBe(Math.fround((1 - samples[0]!.surfaceWetness[0]!) / 2));
    expect(samples).toEqual(before);
    expect(result.precipitation).not.toBe(samples[0]!.precipitation);
  });

  it("uses binary64 reduction and half-range before Float32 publication, then encodes published P once", () => {
    let seed = 981;
    const random = () => ((seed = Math.imul(seed, 1664525) + 1013904223 | 0) >>> 0) / 2 ** 32;
    for (let run = 0; run < 100; run++) {
      const samples = Array.from({ length: run % 2 ? 2 : 4 }, () => sample(random() * 900, random(), random() * 150));
      const n = samples.length;
      const result = op.run({ ...grid, reduction: "annual", model: "periodic-cycle", weights: samples.map(() => 1 / n), samples }, config);
      if (result.reduction !== "annual") throw new Error("Wrong reduction branch");
      for (let i = 0; i < 2; i++) {
        const rains = samples.map((s) => s.precipitation[i]!);
        const wetness = samples.map((s) => s.surfaceWetness[i]!);
        expect(result.precipitation[i]).toBe(Math.fround(rains.reduce((a, b) => a + b, 0) / n));
        expect(result.surfaceWetness[i]).toBe(Math.fround(wetness.reduce((a, b) => a + b, 0) / n));
        expect(result.rainfallCodec[i]).toBe(Math.min(200, Math.round(result.precipitation[i]!)));
        expect(result.potentialDemand[i]).toBe(Math.fround(samples.reduce((sum, s) => sum + s.potentialDemand[i]!, 0) / n));
        expect(result.precipitationAmplitude[i]).toBe(Math.fround((Math.max(...rains) - Math.min(...rains)) / 2));
        expect(result.surfaceWetnessAmplitude[i]).toBe(Math.fround((Math.max(...wetness) - Math.min(...wetness)) / 2));
      }
    }
  });

  it("refuses malformed P/W/demand instead of manufacturing missing forcing", () => {
    const base = { ...grid, reduction: "annual" as const, model: "periodic-cycle" as const, weights: [1], samples: [sample(10, 0.2, 4)] };
    for (const bad of [
      { model: "legacy-snapshots" }, { samples: [] }, { height: 2 }, { weights: [0.5] }, { weights: [Infinity] },
      { samples: [{ ...sample(10, 0.2, 4), potentialDemand: [NaN, 1] }] },
      { samples: [{ ...sample(10, 0.2, 4), potentialDemand: [-1, 1] }] },
      { samples: [{ ...sample(10, 0.2, 4), surfaceWetness: new Uint8Array(2) }] },
      { samples: [sample(-1, 0.2, 4)] }, { samples: [sample(Infinity, 0.2, 4)] },
      { samples: [sample(10, -0.1, 4)] }, { samples: [sample(10, 1.1, 4)] }, { samples: [sample(10, NaN, 4)] },
    ]) expect(() => op.run({ ...base, ...bad } as never, config)).toThrow();
  });

  it("schema-refuses retired annual model tags before the reducer executes", () => {
    for (const model of ["legacy-snapshots", "unknown-model"]) {
      expect(() => op.run({
        ...grid, reduction: "annual", model, weights: [0.5, 0.5], samples: [sample(10, 0.2, 4), sample(20, 0.4, 8)],
      } as never, config)).toThrow(OperationInputAdmissionError);
    }
  });
});
