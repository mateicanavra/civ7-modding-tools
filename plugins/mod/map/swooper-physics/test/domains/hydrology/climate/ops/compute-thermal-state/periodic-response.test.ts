import { describe, expect, it } from "bun:test";
import {
  normalizeOperationSelectionForTest,
  runAdmittedOperationForTest,
  validateSchemaValueForTest,
} from "@swooper/mapgen-core/testing";
import hydrologyContract from "../../../../../../src/domain/hydrology/index.js";
import hydrology from "../../../../../../src/domain/hydrology/router.js";

const { computeThermalState: operation } = hydrology.climate.ops;
const selection = {
  strategy: "periodic-response",
  config: { annualOffsetC: 0, lapseRateCPerElevationUnit: -0.15, minC: -40, maxC: 50 },
} as const;
const wide = { ...selection, config: { ...selection.config, minC: -120, maxC: 120 } };
// Pinned 2026-09-29 training-only summary, not a test-time refit or production policy import.
const fit = {
  a: -37.281717968360105,
  b: 206.8113096845454,
  g1: [87.41575475075993, -43.89492826435499],
  g2: [3.65785791897244, -68.66297422806831],
} as const;
const q = { meanQ: 0.25, cos1Q: 0.04, sin1Q: 0.08, cos2Q: -0.025, sin2Q: 0.01 };

function fixture() {
  return {
    model: "periodic-response" as const,
    width: 3,
    height: 1,
    solarByRow: [{ ...q }],
    phases: [0, 0.25, 0.5, 0.75],
    weights: [0.1, 0.2, 0.3, 0.4],
    elevation: new Int16Array([20, 120, -100]),
    seaLevel: 20,
    landMask: new Uint8Array([1, 1, 0]),
    sstC: new Float32Array([90, -90, 12]),
  };
}

function run(
  input = fixture(),
  config: {
    annualOffsetC: number;
    lapseRateCPerElevationUnit: number;
    minC: number;
    maxC: number;
  } = selection.config
) {
  const result = runAdmittedOperationForTest(operation, input, { ...selection, config });
  if (result.model !== "periodic-response") throw new Error("Expected periodic thermal result.");
  return result;
}

function rawAt(solar: typeof q, phase: number) {
  const angle = 2 * Math.PI * phase;
  return (
    fit.a +
    fit.b * solar.meanQ +
    (fit.g1[0] * solar.cos1Q + fit.g1[1] * solar.sin1Q) * Math.cos(angle) +
    (fit.g1[0] * solar.sin1Q - fit.g1[1] * solar.cos1Q) * Math.sin(angle) +
    (fit.g2[0] * solar.cos2Q + fit.g2[1] * solar.sin2Q) * Math.cos(2 * angle) +
    (fit.g2[0] * solar.sin2Q - fit.g2[1] * solar.cos2Q) * Math.sin(2 * angle)
  );
}

// Independently integrate the pinned fitted cycle at ground datum; no operation internals.
function annualGroundOracle(input: ReturnType<typeof fixture>, count: number) {
  return Float32Array.from(input.landMask, (land, cell) => {
    let sum = 0;
    const solar = input.solarByRow[Math.floor(cell / input.width)]!;
    const lapse =
      Math.max(0, input.elevation[cell]! - input.seaLevel) *
      selection.config.lapseRateCPerElevationUnit;
    for (let sample = 0; sample < count; sample++) {
      const raw = land
        ? rawAt(solar, (sample + 0.5) / count) + selection.config.annualOffsetC + lapse
        : input.sstC[cell]!;
      sum += Math.max(selection.config.minC, Math.min(selection.config.maxC, raw));
    }
    return sum / count;
  });
}

function forcingForTemperature(mean: number, cosine: number, sine: number, harmonic: 1 | 2) {
  const [real, imaginary] = harmonic === 1 ? fit.g1 : fit.g2;
  const norm = real * real + imaginary * imaginary;
  const cos = (cosine * real - sine * imaginary) / norm;
  const sin = (cosine * imaginary + sine * real) / norm;
  return {
    meanQ: (mean - fit.a) / fit.b,
    cos1Q: harmonic === 1 ? cos : 0,
    sin1Q: harmonic === 1 ? sin : 0,
    cos2Q: harmonic === 2 ? cos : 0,
    sin2Q: harmonic === 2 ? sin : 0,
  };
}

describe("empirical periodic thermal response", () => {
  it("keeps the declared legacy default, explicit branch tags and strict new config", () => {
    expect(operation.defaultConfig.strategy).toBe("insolation-lapse-rate");
    expect(() => operation.run(fixture(), operation.defaultConfig)).toThrow(/matching input model/);
    expect(() =>
      operation.run(
        {
          model: "insolation-lapse-rate",
          width: 1,
          height: 1,
          insolation: new Float32Array([0.5]),
          elevation: new Int16Array(1),
          seaLevel: 0,
          landMask: new Uint8Array([1]),
        },
        selection
      )
    ).toThrow(/matching input model/);
    for (const key of [
      "landCoolingC",
      "baseTemperatureC",
      "insolationScaleC",
      "geographicGainCPerQ",
    ]) {
      expect(() =>
        normalizeOperationSelectionForTest(operation, {
          ...selection,
          config: { ...selection.config, [key]: 1 },
        })
      ).toThrow();
    }
  });

  it("evaluates the complex signs once, applies one ground lapse, and preserves inputs", () => {
    const input = fixture(),
      snapshot = structuredClone(input);
    const actual = run(input, wide.config);
    for (const [phaseIndex, phase] of input.phases.entries()) {
      const sample = actual.samples[phaseIndex]!;
      expect(sample.seaLevelTemperatureC[0]).toBe(Math.fround(rawAt(q, phase)));
      expect(sample.surfaceTemperatureC[0]).toBe(sample.seaLevelTemperatureC[0]);
      expect(sample.surfaceTemperatureC[1]).toBe(Math.fround(rawAt(q, phase) - 15));
      expect(sample.seaLevelTemperatureC[2]).toBe(12);
      expect(sample.surfaceTemperatureC[2]).toBe(12);
    }
    expect(input).toEqual(snapshot);
    expect(run(input, wide.config)).toEqual(actual);
    const shifted = {
      ...input,
      elevation: input.elevation.map((value) => value + 237),
      seaLevel: input.seaLevel + 237,
    };
    expect(run(shifted, wide.config)).toEqual(actual);
  });

  it("centers pressure with the exact weighted sea-level samples, not ground or unweighted means", () => {
    const input = fixture(),
      actual = run(input, wide.config);
    for (let cell = 0; cell < input.width; cell++) {
      const weighted = actual.samples.reduce(
        (sum, sample, phase) => sum + sample.seaLevelTemperatureC[cell]! * input.weights[phase]!,
        0
      );
      expect(actual.meanSeaLevelTemperatureC[cell]).toBe(Math.fround(weighted));
    }
    expect(actual.meanSeaLevelTemperatureC[1]).toBe(actual.meanSeaLevelTemperatureC[0]);
    expect(
      Math.abs(actual.meanSeaLevelTemperatureC[0]! - actual.annualSurfaceTemperatureC[0]!)
    ).toBeGreaterThan(0.1);
    const two = run({ ...input, phases: [0.25, 0.75], weights: [0.5, 0.5] }, wide.config);
    const many = run(
      {
        ...input,
        phases: Array.from({ length: 24 }, (_, i) => i / 24),
        weights: new Array(24).fill(1 / 24),
      },
      wide.config
    );
    expect(two.annualSurfaceTemperatureC).toEqual(actual.annualSurfaceTemperatureC);
    expect(many.annualSurfaceTemperatureC).toEqual(actual.annualSurfaceTemperatureC);
    expect(many.annualClippingDeltaC).toEqual(actual.annualClippingDeltaC);
  });

  it("clips sea-level and ground independently instead of applying lapse to a clipped datum", () => {
    const input = {
      ...fixture(),
      solarByRow: [forcingForTemperature(100, 0, 0, 1)],
      elevation: new Int16Array([420, 20, -300]),
      sstC: new Float32Array([0, 0, 80]),
    };
    const actual = run(input);
    for (const sample of actual.samples) {
      expect(Array.from(sample.seaLevelTemperatureC)).toEqual([50, 50, 50]);
      expect(Array.from(sample.surfaceTemperatureC)).toEqual([40, 50, 50]);
    }
    expect(Array.from(actual.annualSurfaceTemperatureC)).toEqual([40, 50, 50]);
    expect(Array.from(actual.annualUnclippedSurfaceTemperatureC)).toEqual([40, 100, 80]);
    expect(Array.from(actual.annualClippingDeltaC)).toEqual([0, -50, -30]);
  });

  it("finds annual clipping missed by both two and four observation phases", () => {
    const solar = forcingForTemperature(-10, 0, 40, 2);
    const input = {
      ...fixture(),
      solarByRow: [solar],
      elevation: new Int16Array([20, 20, -100]),
      weights: [0.25, 0.25, 0.25, 0.25],
    };
    const actual = run(input);
    for (const sample of actual.samples) expect(sample.surfaceTemperatureC[0]).toBeCloseTo(-10, 5);
    const extremum = run({ ...input, phases: [0.375], weights: [1] });
    expect(extremum.samples[0]!.surfaceTemperatureC[0]).toBe(-40);
    expect(actual.annualClippingDeltaC[0]!).toBeGreaterThan(1);
    expect(actual.annualSurfaceTemperatureC[0]!).toBeGreaterThan(-10);
    expect(extremum.annualSurfaceTemperatureC).toEqual(actual.annualSurfaceTemperatureC);
    let reference = 0;
    for (let sample = 0; sample < 24576; sample++)
      reference += Math.max(-40, Math.min(50, rawAt(solar, (sample + 0.5) / 24576)));
    // One millikelvin budget for this nonsmooth clipped semiannual cycle, not f32 exactness.
    expect(Math.abs(actual.annualSurfaceTemperatureC[0]! - reference / 24576)).toBeLessThan(0.001);
  });

  it("qualifies public annual clipping against independent 192/768/dense quadrature", () => {
    const errors = new Map([192, 384, 768].map((count) => [count, 0]));
    for (const mean of [-35, -10, 20, 45]) {
      const input = { ...fixture(), solarByRow: [forcingForTemperature(mean, 40, 35, 2)] };
      const reference = annualGroundOracle(input, 24576);
      const actual = run(input);
      expect(actual.annualSurfaceTemperatureC).toEqual(annualGroundOracle(input, 384));
      for (const count of [192, 384, 768]) {
        // The public operation fixes 384 points; alternative resolutions belong only to this oracle.
        const values =
          count === 384 ? actual.annualSurfaceTemperatureC : annualGroundOracle(input, count);
        for (let cell = 0; cell < input.width; cell++)
          errors.set(
            count,
            Math.max(errors.get(count)!, Math.abs(values[cell]! - reference[cell]!))
          );
      }
    }
    expect(errors.get(384)!).toBeLessThan(0.003);
    expect(errors.get(768)!).toBeLessThan(errors.get(192)!);
  });

  it("changes only the annual offset and keeps prescribed ocean anomalies zero", () => {
    const input = fixture(),
      original = run(input, wide.config);
    const offset = run(input, { ...wide.config, annualOffsetC: 5 });
    for (let sample = 0; sample < input.phases.length; sample++) {
      expect(
        offset.samples[sample]!.surfaceTemperatureC[0]! -
          original.samples[sample]!.surfaceTemperatureC[0]!
      ).toBeCloseTo(5, 5);
      expect(offset.samples[sample]!.surfaceTemperatureC[2]).toBe(12);
    }
    expect(
      offset.annualSurfaceTemperatureC[0]! - original.annualSurfaceTemperatureC[0]!
    ).toBeCloseTo(5, 5);
    expect(offset.annualSurfaceTemperatureC[2]).toBe(12);
  });

  it("refuses missing SST, nonfinite coefficients, mismatched dimensions and invalid weights/bounds", () => {
    const { sstC: _sstC, ...missingSst } = fixture();
    expect(() =>
      validateSchemaValueForTest(
        hydrologyContract.climate.ops.computeThermalState.input,
        missingSst,
        "/thermal"
      )
    ).toThrow(/sstC/);
    expect(() => run({ ...fixture(), weights: [0.25, 0.25, 0.25, 0.24] })).toThrow(/normalized/);
    expect(() => run({ ...fixture(), weights: [0, 0, 0, 1] })).toThrow();
    expect(() => run({ ...fixture(), phases: [0] })).toThrow(/aligned/);
    expect(() => run({ ...fixture(), solarByRow: [{ ...q, sin1Q: Number.NaN }] })).toThrow();
    expect(() => run({ ...fixture(), sstC: new Float32Array([12]) })).toThrow();
    expect(() => run({ ...fixture(), landMask: new Uint8Array([1, 2, 0]) })).toThrow(/binary/);
    expect(() => run(fixture(), { ...selection.config, minC: 40, maxC: 30 })).toThrow(
      /ordered bounds/
    );
  });
});
