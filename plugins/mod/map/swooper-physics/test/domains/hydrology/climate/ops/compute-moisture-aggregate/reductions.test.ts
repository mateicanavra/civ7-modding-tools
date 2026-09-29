import { describe, expect, it } from "bun:test";
import hydrology from "../../../../../../src/domain/hydrology/router.js";

const op = hydrology.climate.ops.computeMoistureAggregate;
const config = { strategy: "phase-reduction", config: {} } as const;
const grid = { width: 2, height: 1 };
const sample = (rain: number, humid: number, pet: number) => ({
  rainfall: new Uint8Array([rain, 255]), humidity: new Uint8Array([humid, 255]), potentialDemand: [pet, pet / 2],
});

describe("hydrology/compute-moisture-aggregate", () => {
  it("keeps member rounding before PET and the distinct 255/200 rainfall bounds", () => {
    const memberSamples = [sample(0, 0, 0), sample(1, 1, 0)].map(({ rainfall, humidity }) => ({ rainfall, humidity }));
    const pair = op.run({ ...grid, reduction: "weather-members", samples: memberSamples }, config);
    expect(pair.rainfall).toEqual(new Uint8Array([1, 255]));
    expect(pair.humidity).toEqual(new Uint8Array([1, 255]));
    const result = op.run({
      ...grid, reduction: "annual", model: "legacy-snapshots", weights: [0.5, 0.5],
      samples: [{ rainfall: pair.rainfall, humidity: pair.humidity, potentialDemand: [3, 7] }, sample(0, 0, 9)],
    }, config);
    if (result.reduction !== "annual") throw new Error("Wrong reduction branch");
    expect(result.rainfall).toEqual(new Uint8Array([1, 200]));
    expect(result.potentialDemand).toEqual(new Float32Array([6, 5.75]));
  });

  it("uses all integration phases for amplitudes and weighted annual means", () => {
    const samples = [sample(10, 20, 2), sample(100, 220, 10), sample(50, 80, 5)];
    const before = structuredClone(samples);
    const result = op.run({ ...grid, reduction: "annual", model: "periodic-cycle", weights: [0.25, 0.25, 0.5], samples }, config);
    if (result.reduction !== "annual") throw new Error("Wrong reduction branch");
    expect(result.rainfall[0]).toBe(53);
    expect(result.humidity[0]).toBe(100);
    expect(result.potentialDemand).toEqual(new Float32Array([5.5, 2.75]));
    expect(result.rainfallAmplitude[0]).toBe(45);
    expect(result.humidityAmplitude[0]).toBe(100);
    expect(samples).toEqual(before);
    expect(result.rainfall).not.toBe(samples[0]!.rainfall);
  });

  it("matches legacy double-sum annual rounding, demand and half-range exactly", () => {
    let seed = 981;
    const random = () => ((seed = Math.imul(seed, 1664525) + 1013904223 | 0) >>> 0) / 2 ** 32;
    for (let run = 0; run < 100; run++) {
      const samples = Array.from({ length: run % 2 ? 2 : 4 }, () => sample(Math.floor(random() * 256), Math.floor(random() * 256), random() * 150));
      const n = samples.length;
      const result = op.run({ ...grid, reduction: "annual", model: "legacy-snapshots", weights: samples.map(() => 1 / n), samples }, config);
      if (result.reduction !== "annual") throw new Error("Wrong reduction branch");
      for (let i = 0; i < 2; i++) {
        const rains = samples.map((s) => s.rainfall[i]!);
        const humids = samples.map((s) => s.humidity[i]!);
        expect(result.rainfall[i]).toBe(Math.min(200, Math.round(rains.reduce((a, b) => a + b, 0) / n)));
        expect(result.humidity[i]).toBe(Math.round(humids.reduce((a, b) => a + b, 0) / n));
        expect(result.potentialDemand[i]).toBe(Math.fround(samples.reduce((sum, s) => sum + s.potentialDemand[i]!, 0) / n));
        expect(result.rainfallAmplitude[i]).toBe(Math.round((Math.max(...rains) - Math.min(...rains)) / 2));
        expect(result.humidityAmplitude[i]).toBe(Math.round((Math.max(...humids) - Math.min(...humids)) / 2));
      }
    }
  });

  it("refuses malformed evidence rather than manufacturing missing rainfall or demand", () => {
    const base = { ...grid, reduction: "annual" as const, model: "periodic-cycle" as const, weights: [1], samples: [sample(10, 20, 4)] };
    for (const bad of [
      { samples: [] }, { height: 2 }, { weights: [0.5] }, { weights: [Infinity] },
      { samples: [{ ...sample(10, 20, 4), potentialDemand: [NaN, 1] }] },
      { samples: [{ ...sample(10, 20, 4), potentialDemand: [-1, 1] }] },
      { samples: [{ ...sample(10, 20, 4), humidity: new Float32Array(2) }] },
    ]) expect(() => op.run({ ...base, ...bad } as never, config)).toThrow();
  });
});
