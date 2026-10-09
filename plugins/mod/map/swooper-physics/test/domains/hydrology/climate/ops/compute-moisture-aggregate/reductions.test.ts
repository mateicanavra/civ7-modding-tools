import { describe, expect, it } from "bun:test";
import { runAdmittedOperationForTest, validateSchemaValueForTest } from "@swooper/mapgen-core/testing";
import { Value } from "typebox/value";
import hydrology from "../../../../../../src/domain/hydrology/router.js";

const { computeMoistureAggregate: op, computePotentialDemand } = hydrology.climate.ops;
const config = { strategy: "phase-reduction", config: {} } as const;
const grid = { width: 2, height: 1 };
const sample = (rain: number, wetness: number, pet: number) => ({
  precipitation: new Float32Array([rain, 401.25]),
  surfaceWetness: new Float32Array([wetness, 1]),
  potentialDemand: [pet, pet / 2],
});

describe("hydrology/compute-moisture-aggregate", () => {
  it("averages member-clamped wetness independently of unclipped physical precipitation before demand", () => {
    const members = [sample(0, 0, 0), sample(401, 1, 0)].map(({ precipitation, surfaceWetness }) => ({ precipitation, surfaceWetness }));
    const pair = runAdmittedOperationForTest(op, { ...grid, reduction: "weather-members", samples: members }, config);
    expect(pair.precipitation).toEqual(new Float32Array([200.5, 401.25]));
    expect(pair.surfaceWetness).toEqual(new Float32Array([0.5, 1]));
    expect(pair.surfaceWetness[0]).not.toBe(Math.min(1, pair.precipitation[0]! / 200));
    const parameters = Value.Create(computePotentialDemand.input.properties.parameters);
    const phaseDemand = runAdmittedOperationForTest(computePotentialDemand, {
      ...grid, surfaceTemperatureC: new Float32Array([35, 35]), surfaceWetness: pair.surfaceWetness, parameters,
    }, computePotentialDemand.defaultConfig).pet;
    const demandReference = (parameters.petBase + parameters.petTemperatureWeight) * (1 - parameters.wetnessDampening * 0.5);
    expect(phaseDemand[0]).toBe(demandReference);
    const coolDemand = runAdmittedOperationForTest(computePotentialDemand, {
      ...grid, surfaceTemperatureC: new Float32Array([-35, -35]), surfaceWetness: pair.surfaceWetness, parameters,
    }, computePotentialDemand.defaultConfig).pet;
    const annual = runAdmittedOperationForTest(op, {
      ...grid, reduction: "annual", model: "periodic-cycle", weights: [0.5, 0.5],
      samples: [
        { precipitation: pair.precipitation, surfaceWetness: pair.surfaceWetness, potentialDemand: phaseDemand },
        { precipitation: pair.precipitation, surfaceWetness: pair.surfaceWetness, potentialDemand: coolDemand },
      ],
    }, config);
    if (annual.reduction !== "annual") throw new Error("Wrong reduction branch");
    expect(annual.potentialDemand[0]).toBe(Math.fround((phaseDemand[0]! + coolDemand[0]!) / 2));
    expect(annual.potentialDemand[0]).not.toBe(Math.fround(parameters.petBase * (1 - parameters.wetnessDampening * 0.5)));
    expect(annual.precipitation).toEqual(pair.precipitation);
    expect(annual.rainfallCodec).toEqual(new Uint8Array([200, 200]));
  });

  it("uses all integration phases for unrounded amplitudes and weighted annual means, then encodes once", () => {
    const samples = [sample(10.25, 0.1, 2), sample(400.75, 0.9, 10), sample(50.75, 0.4, 5)];
    const before = structuredClone(samples);
    const weights = [0.25, 0.25, 0.5];
    const result = runAdmittedOperationForTest(op, { ...grid, reduction: "annual", model: "periodic-cycle", weights, samples }, config);
    if (result.reduction !== "annual") throw new Error("Wrong reduction branch");
    expect(result.precipitation[0]).toBe(Math.fround(10.25 * 0.25 + 400.75 * 0.25 + 50.75 * 0.5));
    expect(result.surfaceWetness[0]).toBe(Math.fround(samples.reduce((sum, s, phase) => sum + s.surfaceWetness[0]! * weights[phase]!, 0)));
    expect(result.potentialDemand).toEqual(new Float32Array([5.5, 2.75]));
    expect(result.precipitationAmplitude[0]).toBe(Math.fround((400.75 - 10.25) / 2));
    expect(result.surfaceWetnessAmplitude[0]).toBe(Math.fround((samples[1]!.surfaceWetness[0]! - samples[0]!.surfaceWetness[0]!) / 2));
    expect(result.precipitation[1]).toBe(401.25);
    expect(result.rainfallCodec).toEqual(new Uint8Array([128, 200]));
    expect(result.rainfallCodec[0]! - result.precipitation[0]!).toBe(-0.125);
    expect(result.rainfallCodec[1]! - result.precipitation[1]!).toBe(-201.25);
    expect(samples).toEqual(before);
    expect(result.precipitation).not.toBe(samples[0]!.precipitation);
  });

  it("reduces independently in binary64 and narrows means and half-ranges only at publication", () => {
    let seed = 981;
    const random = () => ((seed = Math.imul(seed, 1664525) + 1013904223 | 0) >>> 0) / 2 ** 32;
    for (let run = 0; run < 100; run++) {
      const samples = Array.from({ length: run % 2 ? 2 : 4 }, () => sample(random() * 500, random(), random() * 150));
      const n = samples.length;
      const result = runAdmittedOperationForTest(op, { ...grid, reduction: "annual", model: "periodic-cycle", weights: samples.map(() => 1 / n), samples }, config);
      if (result.reduction !== "annual") throw new Error("Wrong reduction branch");
      for (let i = 0; i < 2; i++) {
        const rains = samples.map((s) => s.precipitation[i]!);
        const wetness = samples.map((s) => s.surfaceWetness[i]!);
        expect(result.precipitation[i]).toBe(Math.fround(rains.reduce((a, b) => a + b, 0) / n));
        expect(result.surfaceWetness[i]).toBe(Math.fround(wetness.reduce((a, b) => a + b, 0) / n));
        expect(result.potentialDemand[i]).toBe(Math.fround(samples.reduce((sum, s) => sum + s.potentialDemand[i]!, 0) / n));
        expect(result.precipitationAmplitude[i]).toBe(Math.fround((Math.max(...rains) - Math.min(...rains)) / 2));
        expect(result.surfaceWetnessAmplitude[i]).toBe(Math.fround((Math.max(...wetness) - Math.min(...wetness)) / 2));
        expect(result.rainfallCodec[i]).toBe(Math.round(Math.min(200, result.precipitation[i]!)));
      }
    }
  });

  it("refuses malformed evidence rather than manufacturing missing precipitation, wetness or demand", () => {
    const base = { ...grid, reduction: "annual", model: "periodic-cycle", weights: [1], samples: [sample(10, 0.2, 4)] } as const;
    for (const bad of [
      { model: "legacy-snapshots" }, { samples: [] }, { height: 2 }, { weights: [0.5] }, { weights: [Infinity] },
      { samples: [{ ...sample(10, 0.2, 4), potentialDemand: [NaN, 1] }] },
      { samples: [{ ...sample(10, 0.2, 4), potentialDemand: [-1, 1] }] },
      { samples: [{ ...sample(10, 0.2, 4), surfaceWetness: new Uint8Array(2) }] },
      { samples: [{ ...sample(10, 0.2, 4), precipitation: new Float32Array([NaN, 1]) }] },
      { samples: [{ ...sample(10, 0.2, 4), precipitation: new Float32Array([-0.25, 1]) }] },
      { samples: [{ ...sample(10, 0.2, 4), surfaceWetness: new Float32Array([1.01, 1]) }] },
    ]) expect(() => runAdmittedOperationForTest(op, validateSchemaValueForTest(op.input, { ...base, ...bad }, "/input"), config)).toThrow();
  });
});
