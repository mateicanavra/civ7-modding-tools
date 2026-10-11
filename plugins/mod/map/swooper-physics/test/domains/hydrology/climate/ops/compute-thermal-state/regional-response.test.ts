import { describe, expect, it } from "bun:test";
import { runAdmittedOperationForTest } from "@swooper/mapgen-core/testing";
import hydrology from "../../../../../../src/domain/hydrology/router.js";

const operation = hydrology.climate.ops.computeThermalState;
const config = { annualOffsetC: 0, lapseRateCPerElevationUnit: -0.15, minC: -40, maxC: 50 };
const selection = { strategy: "periodic-response", config } as const;
// Same pinned incumbent coefficients as the existing thermal owner test; no fit or observations.
const fit = { a: -37.281717968360105, b: 206.8113096845454,
  g1: [87.41575475075993, -43.89492826435499],
  g2: [3.65785791897244, -68.66297422806831] } as const;

function forcing(mean: number, cosine = 0, sine = 0) {
  const [real, imaginary] = fit.g1;
  const norm = real * real + imaginary * imaginary;
  return { meanQ: (mean - fit.a) / fit.b,
    cos1Q: (cosine * real - sine * imaginary) / norm,
    sin1Q: (cosine * imaginary + sine * real) / norm, cos2Q: 0, sin2Q: 0 };
}

function fixture() {
  return { model: "periodic-response" as const, width: 4, height: 1,
    solarByRow: [forcing(30)], phases: [0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875],
    weights: new Array<number>(8).fill(1 / 8), elevation: new Int16Array([0, 40, 201, 0]),
    seaLevel: 0, landMask: new Uint8Array([1, 1, 1, 0]), sstC: new Float32Array([80, -80, 40, 12]),
    regionalResponse: { gainC: 20, phases: [0, 0.25, 0.5, 0.75],
      precipitationByPhase: Array.from({ length: 4 }, () => new Float32Array([0, 5, 10, 0])),
      demandByPhase: Array.from({ length: 4 }, () => [10, 10, 10, 0]),
      latitudeByRow: new Float32Array([30]), axialTiltDeg: 23.44, tMinC: 0, tMaxC: 35 } };
}
type Fixture = Omit<ReturnType<typeof fixture>, "regionalResponse"> & {
  regionalResponse?: ReturnType<typeof fixture>["regionalResponse"];
};

function run(input: Fixture, options = config) {
  return runAdmittedOperationForTest(operation, input, { ...selection, config: options });
}
function incumbent(input: Fixture, options = config) {
  const { regionalResponse: _regionalResponse, ...original } = input;
  return run(original, options);
}
function rawAt(input: Fixture, row: number, phase: number, options = config) {
  const q = input.solarByRow[row]!;
  const angle = 2 * Math.PI * phase;
  return fit.a + fit.b * q.meanQ + options.annualOffsetC +
    (fit.g1[0] * q.cos1Q + fit.g1[1] * q.sin1Q) * Math.cos(angle) +
    (fit.g1[0] * q.sin1Q - fit.g1[1] * q.cos1Q) * Math.sin(angle) +
    (fit.g2[0] * q.cos2Q + fit.g2[1] * q.sin2Q) * Math.cos(2 * angle) +
    (fit.g2[0] * q.sin2Q - fit.g2[1] * q.cos2Q) * Math.sin(2 * angle);
}
function bounded(value: number, low: number, high: number) {
  return Math.max(low, Math.min(high, value));
}
// Independent sunset-angle oracle, with explicit pole limits instead of production sunrise branches.
function solarOracle(latitude: number, declination: number) {
  const lat = latitude * Math.PI / 180, dec = declination * Math.PI / 180;
  if (Math.abs(latitude) === 90) return Math.max(0, Math.sign(latitude) * Math.sin(dec));
  const sunset = Math.acos(bounded(-Math.tan(lat) * Math.tan(dec), -1, 1));
  return Math.max(0, (sunset * Math.sin(lat) * Math.sin(dec) +
    Math.cos(lat) * Math.cos(dec) * Math.sin(sunset)) / Math.PI);
}

function interpolate(phases: readonly number[], values: readonly ArrayLike<number>[], cell: number, t: number) {
  if (phases.length === 1) return values[0]![cell]!;
  // Search explicit wrap-extended intervals, independent of the production lower-knot search.
  for (let knot = 0; knot < phases.length; knot++) {
    const next = (knot + 1) % phases.length;
    const start = phases[knot]!, end = phases[next]! + (next === 0 ? 1 : 0);
    const phase = t < start ? t + 1 : t;
    if (phase >= start && phase < end) {
      const fraction = (phase - start) / (end - start);
      return (1 - fraction) * values[knot]![cell]! + fraction * values[next]![cell]!;
    }
  }
  throw new Error("Oracle calendar interval missing.");
}

function anomalyOracle(input: Fixture, row: number, phase: number, options = config) {
  const response = input.regionalResponse!;
  const q = solarOracle(response.latitudeByRow[row]!, response.axialTiltDeg * Math.sin(2 * Math.PI * phase));
  const raw = rawAt(input, row, phase, options);
  const activity: number[] = [], limitation: number[] = [];
  for (let column = 0; column < input.width; column++) {
    const cell = row * input.width + column;
    const demand = interpolate(response.phases, response.demandByPhase, cell, phase);
    const precipitation = interpolate(response.phases, response.precipitationByPhase, cell, phase);
    limitation.push(demand <= 0 || precipitation >= demand ? 0 : 1 - precipitation / demand);
    const lapse = Math.max(0, input.elevation[cell]! - input.seaLevel) * options.lapseRateCPerElevationUnit;
    const ground = bounded(raw + lapse, options.minC, options.maxC);
    activity.push(input.landMask[cell] === 1 && demand > 0
      ? q * bounded((ground - response.tMinC) / (response.tMaxC - response.tMinC), 0, 1) : 0);
  }
  const sum = activity.reduce((total, value) => total + value, 0);
  const reference = sum > 0 ? activity.reduce((total, value, cell) => total + value * limitation[cell]!, 0) / sum : 0;
  return activity.map((value, cell) => value === 0 ? 0 : response.gainC * value * (limitation[cell]! - reference));
}

function sampleOracle(input: Fixture, phase: number, options = config) {
  const seaLevelTemperatureC = new Float32Array(input.width * input.height);
  const surfaceTemperatureC = seaLevelTemperatureC.slice();
  for (let row = 0; row < input.height; row++) {
    const anomaly = anomalyOracle(input, row, phase, options);
    for (let column = 0; column < input.width; column++) {
      const cell = row * input.width + column, land = input.landMask[cell] === 1;
      const raw = land ? rawAt(input, row, phase, options) + anomaly[column]! : input.sstC[cell]!;
      const lapse = land ? Math.max(0, input.elevation[cell]! - input.seaLevel) * options.lapseRateCPerElevationUnit : 0;
      seaLevelTemperatureC[cell] = bounded(raw, options.minC, options.maxC);
      surfaceTemperatureC[cell] = bounded(raw + lapse, options.minC, options.maxC);
    }
  }
  return { seaLevelTemperatureC, surfaceTemperatureC };
}

function annualOracle(input: Fixture, count: number, options = config) {
  const raw = new Float64Array(input.width * input.height), clipped = raw.slice();
  for (let phase = 0; phase < count; phase++) {
    const t = (phase + 0.5) / count;
    for (let row = 0; row < input.height; row++) {
      const anomaly = anomalyOracle(input, row, t, options);
      for (let column = 0; column < input.width; column++) {
        const cell = row * input.width + column;
        const lapse = Math.max(0, input.elevation[cell]! - input.seaLevel) * options.lapseRateCPerElevationUnit;
        const ground = input.landMask[cell] === 1
          ? rawAt(input, row, t, options) + anomaly[column]! + lapse : input.sstC[cell]!;
        raw[cell]! += ground;
        clipped[cell]! += bounded(ground, options.minC, options.maxC);
      }
    }
  }
  const delta = raw.slice();
  for (let cell = 0; cell < raw.length; cell++) {
    raw[cell]! /= count;
    clipped[cell]! /= count;
    delta[cell] = clipped[cell]! - raw[cell]!;
  }
  return { raw, clipped, delta };
}

describe("frozen seasonal regional thermal response", () => {
  it("preserves every incumbent output at omitted/zero gain, including zero-demand data and input identity", () => {
    const input = fixture();
    input.regionalResponse.gainC = 0;
    input.regionalResponse.demandByPhase = input.regionalResponse.demandByPhase.map(() => [0, 0, 0, 0]);
    const snapshot = structuredClone(input);
    expect(run(input)).toEqual(incumbent(input));
    expect(input).toEqual(snapshot);
    expect(run(input)).toEqual(run(input));
  });

  it("keeps the extracted solar arithmetic bit-identical to the former private implementation", () => {
    // Frozen former arithmetic is test-only custody, not another production solar owner.
    const oldQ = (latitudeDegrees: number, declinationDegrees: number) => {
      const latitude = latitudeDegrees * (Math.PI / 180), declination = declinationDegrees * (Math.PI / 180);
      const offset = Math.sin(latitude) * Math.sin(declination), amplitude = Math.cos(latitude) * Math.cos(declination);
      if (offset + amplitude <= 0) return 0;
      if (offset - amplitude >= 0) return offset;
      const sunset = Math.acos(Math.max(-1, Math.min(1, -offset / amplitude)));
      return Math.max(0, (sunset * offset + amplitude * Math.sin(sunset)) / Math.PI);
    };
    for (const latitude of [-90, -60, 0, 30, 90]) for (const tilt of [0, 23.44, 90]) {
      const sums = [0, 0, 0, 0, 0];
      for (let index = 0; index < 384; index++) {
        const phase = 2 * Math.PI * (index + 0.5) / 384;
        const q = oldQ(latitude, tilt * Math.sin(phase));
        const basis = [1, Math.cos(phase), Math.sin(phase), Math.cos(2 * phase), Math.sin(2 * phase)];
        for (let field = 0; field < 5; field++) sums[field]! += q * basis[field]!;
      }
      const expected = tilt === 0 ? [oldQ(latitude, 0), 0, 0, 0, 0]
        : sums.map((sum, field) => (field === 0 ? sum : 2 * sum) / 384);
      const actual = runAdmittedOperationForTest(hydrology.climate.ops.computeRadiativeForcing, {
        model: "daily-solar-fourier", width: 1, height: 1,
        latitudeByRow: new Float32Array([latitude]), axialTiltDeg: tilt,
      }, { strategy: "daily-solar-fourier", config: {} });
      expect(Object.values(actual.solarByRow[0]!)).toEqual(expected);
    }
  });

  it("admits only aligned finite nonnegative evidence and refuses enabled original-land zero demand", () => {
    const mutate = (change: (input: ReturnType<typeof fixture>) => void) => {
      const input = fixture(); change(input); return () => run(input);
    };
    expect(mutate((input) => { input.regionalResponse.demandByPhase[0]![0] = 0; })).toThrow(/strictly positive/);
    expect(mutate((input) => { input.regionalResponse.gainC = -1; })).toThrow();
    expect(mutate((input) => { input.regionalResponse.tMaxC = 0; })).toThrow(/activity bounds/);
    expect(mutate((input) => { input.regionalResponse.latitudeByRow[0] = 91; })).toThrow(/latitude/);
    expect(mutate((input) => { input.regionalResponse.axialTiltDeg = 91; })).toThrow();
    expect(mutate((input) => { input.regionalResponse.phases[2] = 0.51; })).toThrow(/uniform/);
    expect(mutate((input) => { input.regionalResponse.phases.reverse(); })).toThrow(/uniform/);
    expect(mutate((input) => { input.regionalResponse.demandByPhase.pop(); })).toThrow(/calendar/);
    expect(mutate((input) => { input.regionalResponse.demandByPhase[0]!.pop(); })).toThrow(/cardinality/);
    expect(mutate((input) => { input.regionalResponse.precipitationByPhase[0]![0] = -1; })).toThrow(/nonnegative/);
    expect(mutate((input) => { input.regionalResponse.precipitationByPhase[0]![0] = Number.NaN; })).toThrow(/nonnegative/);
    expect(mutate((input) => { input.regionalResponse.demandByPhase[0]![0] = Number.POSITIVE_INFINITY; })).toThrow();
    expect(mutate((input) => { input.regionalResponse.precipitationByPhase[0] = new Float32Array(1); })).toThrow(/input admission/);
    expect(() => runAdmittedOperationForTest(operation, { ...fixture(), regionalResponse: {
      ...fixture().regionalResponse, precipitationByPhase: [new Float64Array(4)] } } as never, selection)).toThrow(/input admission/);
    expect(() => runAdmittedOperationForTest(operation, { ...fixture(), regionalResponse: {
      ...fixture().regionalResponse, demandByPhase: [new Float64Array(4)] } } as never, selection)).toThrow(/input admission/);
    expect(run(fixture()).samples[0]!.surfaceTemperatureC[3]).toBe(12);
  });

  it("publishes the activity-weighted response, cools a warm wet receiver, and cannot activate cold ground or original water", () => {
    const input = fixture(), baseline = incumbent(input), actual = run(input);
    input.regionalResponse.precipitationByPhase = input.regionalResponse.precipitationByPhase.map(() => new Float32Array([0, 10, 0, 0]));
    const wet = run(input);
    expect(wet.samples[2]!.surfaceTemperatureC[0]!).toBeGreaterThan(baseline.samples[2]!.surfaceTemperatureC[0]!);
    expect(wet.samples[2]!.surfaceTemperatureC[1]!).toBeLessThan(baseline.samples[2]!.surfaceTemperatureC[1]!);
    for (const [phase, t] of input.phases.entries()) {
      expect(wet.samples[phase]).toEqual(sampleOracle(input, t));
      expect(actual.samples[phase]!.surfaceTemperatureC[2]).toBe(baseline.samples[phase]!.surfaceTemperatureC[2]);
      expect(actual.samples[phase]!.seaLevelTemperatureC[2]).toBe(baseline.samples[phase]!.seaLevelTemperatureC[2]);
      expect(actual.samples[phase]!.surfaceTemperatureC[3]).toBe(12);
    }
    input.regionalResponse.precipitationByPhase.forEach((field) => { field[1] = 1000; });
    expect(run(input)).toEqual(wet);
  });

  it("gates on bounded incumbent ground before Float32 rounding, not warm sea-level publication", () => {
    const input = fixture();
    input.solarByRow = [forcing(30.0000005)];
    input.elevation = new Int16Array([100, 0, 200, 0]);
    input.regionalResponse.tMinC = 15.0000007;
    input.regionalResponse.gainC = 1e8;
    const baseline = incumbent(input), actual = run(input);
    expect(baseline.samples[0]!.surfaceTemperatureC[0]!).toBeGreaterThan(input.regionalResponse.tMinC);
    expect(actual.samples[0]!.surfaceTemperatureC[0]).toBe(baseline.samples[0]!.surfaceTemperatureC[0]);
    expect(actual.samples[0]!.seaLevelTemperatureC[0]).toBe(baseline.samples[0]!.seaLevelTemperatureC[0]);
    const boundedInput = fixture();
    boundedInput.solarByRow = [forcing(100)];
    boundedInput.regionalResponse.tMinC = 55;
    boundedInput.regionalResponse.tMaxC = 70;
    expect(run(boundedInput)).toEqual(incumbent(boundedInput));
  });

  it("keeps polar darkness inactive at actual evaluation phases rather than interpolating gated knot corrections", () => {
    const input = fixture();
    input.regionalResponse.latitudeByRow[0] = 90;
    input.regionalResponse.phases = [0.125, 0.375, 0.625, 0.875];
    input.phases = [0.25, 0.75, 0.99]; input.weights = [1 / 3, 1 / 3, 1 / 3];
    const actual = run(input), baseline = incumbent(input);
    expect(actual.samples[0]!.surfaceTemperatureC[0]!).toBeGreaterThan(baseline.samples[0]!.surfaceTemperatureC[0]!);
    for (const phase of [1, 2]) expect(actual.samples[phase]).toEqual(baseline.samples[phase]);
  });

  it("cannot carry warm source-knot corrections through an intervening cold ground phase", () => {
    const input = fixture(); input.elevation.fill(0);
    const [real, imaginary] = fit.g2, norm = real * real + imaginary * imaginary;
    input.solarByRow = [{ ...forcing(0), cos2Q: 20 * real / norm, sin2Q: 20 * imaginary / norm }];
    input.regionalResponse.phases = [0, 0.5];
    input.regionalResponse.precipitationByPhase = input.regionalResponse.precipitationByPhase.slice(0, 2);
    input.regionalResponse.demandByPhase = input.regionalResponse.demandByPhase.slice(0, 2);
    input.phases = [0, 0.25, 0.5, 0.75]; input.weights = [0.25, 0.25, 0.25, 0.25];
    const actual = run(input), baseline = incumbent(input);
    for (const phase of [0, 2]) expect(actual.samples[phase]!.surfaceTemperatureC[0]!)
      .toBeGreaterThan(baseline.samples[phase]!.surfaceTemperatureC[0]!);
    for (const phase of [1, 3]) expect(actual.samples[phase]).toEqual(baseline.samples[phase]);
  });

  it("preserves incumbent publications for empty activity, a single active land cell, all-wet and uniform-limitation rows", () => {
    const empty = fixture(); empty.regionalResponse.tMinC = 35; empty.regionalResponse.tMaxC = 40;
    expect(run(empty)).toEqual(incumbent(empty));
    const singleton = fixture(); singleton.landMask = new Uint8Array([1, 0, 0, 0]);
    expect(run(singleton)).toEqual(incumbent(singleton));
    const oneCell = fixture(); oneCell.width = 1;
    oneCell.elevation = new Int16Array([0]); oneCell.landMask = new Uint8Array([1]); oneCell.sstC = new Float32Array([80]);
    oneCell.regionalResponse.precipitationByPhase = oneCell.regionalResponse.precipitationByPhase.map(() => new Float32Array([0]));
    oneCell.regionalResponse.demandByPhase = oneCell.regionalResponse.demandByPhase.map(() => [10]);
    expect(run(oneCell)).toEqual(incumbent(oneCell));
    const allWet = fixture(); allWet.regionalResponse.precipitationByPhase.forEach((field) => field.fill(20));
    expect(run(allWet)).toEqual(incumbent(allWet));
    const uniform = fixture(); uniform.regionalResponse.precipitationByPhase.forEach((field) => field.fill(4));
    expect(run(uniform)).toEqual(incumbent(uniform));
    const water = fixture(); water.landMask.fill(0); water.regionalResponse.demandByPhase.forEach((field) => field.fill(0));
    expect(run(water)).toEqual(incumbent(water));
  });

  it("refuses unsupported zero-demand knots and preserves the response for strictly positive near-zero demand", () => {
    const input = fixture(); input.elevation.fill(0);
    input.regionalResponse.axialTiltDeg = 0;
    input.regionalResponse.phases = [0, 0.5];
    input.regionalResponse.precipitationByPhase = [new Float32Array([0, 10, 0, 0]), new Float32Array([0, 10, 0, 0])];
    input.regionalResponse.demandByPhase = [[0, 10, 0, 0], [1, 10, 0, 0]];
    expect(() => run(input)).toThrow(/strictly positive/);
    input.regionalResponse.demandByPhase = [[Number.MIN_VALUE, 10, Number.MIN_VALUE, 0], [Number.MIN_VALUE, 10, Number.MIN_VALUE, 0]];
    const positive = run(input);
    expect(positive.samples[0]!.surfaceTemperatureC[0]!).toBeGreaterThan(incumbent(input).samples[0]!.surfaceTemperatureC[0]!);
    const ordinary = { ...input, regionalResponse: { ...input.regionalResponse,
      demandByPhase: [[10, 10, 10, 0], [10, 10, 10, 0]] } };
    expect(positive).toEqual(run(ordinary));
    input.regionalResponse.precipitationByPhase.forEach((field) => field.fill(1));
    expect(run(input).samples[0]).toEqual(sampleOracle(input, 0));
  });

  it("interpolates continuous P and D before their ratio, at exact knots and across a shifted wrap", () => {
    const input = fixture(); input.elevation.fill(0);
    input.regionalResponse.phases = [0.125, 0.375, 0.625, 0.875];
    input.regionalResponse.precipitationByPhase = [0, 3, 8, 1].map((value) => new Float32Array([value, 10, 5, 0]));
    input.regionalResponse.demandByPhase = [2, 12, 9, 4].map((value) => [value, 10, 10, 0]);
    input.phases = [0, 1e-10, 0.125, 0.25, 0.375, 0.625, 0.875, 1 - 1e-10];
    input.weights = new Array<number>(input.phases.length).fill(1 / input.phases.length);
    const actual = run(input);
    for (const [phaseIndex, phase] of input.phases.entries()) {
      const oracle = anomalyOracle(input, 0, phase);
      for (let cell = 0; cell < input.width - 1; cell++) {
        expect(actual.samples[phaseIndex]!.surfaceTemperatureC[cell]).toBe(Math.fround(rawAt(input, 0, phase) + oracle[cell]!));
      }
    }
    expect(actual.samples[1]!.surfaceTemperatureC[0]).toBe(actual.samples[7]!.surfaceTemperatureC[0]);
    const singleton = fixture(); singleton.regionalResponse.phases = [0.125];
    singleton.regionalResponse.precipitationByPhase = [singleton.regionalResponse.precipitationByPhase[0]!];
    singleton.regionalResponse.demandByPhase = [singleton.regionalResponse.demandByPhase[0]!];
    expect(run(singleton)).toEqual(run(fixture()));
  });

  it("applies one shot from the incumbent gate even when corrected active ground crosses tMin", () => {
    const input = fixture(); input.elevation.fill(0); input.solarByRow = [forcing(5)];
    input.regionalResponse.gainC = 300;
    input.regionalResponse.tMaxC = 10;
    input.regionalResponse.precipitationByPhase.forEach((field) => { field[0] = 0; field[1] = 10; field[2] = 10; });
    const actual = run(input), oracle = anomalyOracle(input, 0, 0.25);
    expect(incumbent(input).samples[2]!.surfaceTemperatureC[1]!).toBeGreaterThan(input.regionalResponse.tMinC);
    expect(actual.samples[2]!.surfaceTemperatureC[1]!).toBeLessThan(input.regionalResponse.tMinC);
    expect(actual.samples[2]!.surfaceTemperatureC[1]).toBe(Math.fround(rawAt(input, 0, 0.25) + oracle[1]!));
    expect(oracle[1]!).toBeLessThan(0);
  });

  it("uses each qualified 12/24/48/96 source calendar without changing shared knots, exact gates or periodic wrap", () => {
    for (const count of [12, 24, 48, 96]) {
      const input = fixture(); input.solarByRow = [forcing(10, 25, 0)];
      input.regionalResponse.phases = Array.from({ length: count }, (_, phase) => phase / count);
      input.regionalResponse.precipitationByPhase = input.regionalResponse.phases.map((phase) =>
        new Float32Array([6 + 6 * Math.sin(2 * Math.PI * phase), 12, 2, 0]));
      input.regionalResponse.demandByPhase = input.regionalResponse.phases.map((phase) =>
        [18 + 4 * Math.cos(2 * Math.PI * phase), 12, 12, 0]);
      input.phases = [0, 0.25, 0.5, 0.75, 1 - 1e-10, 1e-10];
      input.weights = new Array<number>(input.phases.length).fill(1 / input.phases.length);
      const actual = run(input), baseline = incumbent(input);
      for (const [phaseIndex, phase] of input.phases.entries()) expect(actual.samples[phaseIndex]).toEqual(sampleOracle(input, phase));
      expect(actual.samples[2]).toEqual(baseline.samples[2]);
      expect(actual.samples[4]!.surfaceTemperatureC[0]).toBe(actual.samples[5]!.surfaceTemperatureC[0]);
    }
  });

  it("adds the anomaly to raw sea level before independent clipping and one lapse, and recomputes the pressure mean", () => {
    const input = fixture(); input.solarByRow = [forcing(100)];
    input.elevation = new Int16Array([400, 200, 0, 0]);
    input.regionalResponse.gainC = 200;
    const actual = run(input);
    for (const [phaseIndex, phase] of input.phases.entries()) {
      const anomaly = anomalyOracle(input, 0, phase);
      for (let cell = 0; cell < 3; cell++) {
        const raw = rawAt(input, 0, phase) + anomaly[cell]!;
        expect(actual.samples[phaseIndex]!.seaLevelTemperatureC[cell]).toBe(Math.fround(bounded(raw, -40, 50)));
        expect(actual.samples[phaseIndex]!.surfaceTemperatureC[cell]).toBe(Math.fround(bounded(raw - input.elevation[cell]! * 0.15, -40, 50)));
      }
    }
    for (let cell = 0; cell < input.width; cell++) {
      expect(actual.meanSeaLevelTemperatureC[cell]).toBe(Math.fround(actual.samples.reduce(
        (sum, sample, phase) => sum + input.weights[phase]! * sample.seaLevelTemperatureC[cell]!, 0)));
    }
  });

  it("refuses finite gain when raw annual diagnostics overflow Float32 despite finite clipped temperatures", () => {
    const input = fixture(); input.regionalResponse.gainC = 1e41;
    const snapshot = structuredClone(input), oracle = annualOracle(input, 384);
    expect(oracle.raw.every(Number.isFinite)).toBe(true);
    expect(oracle.clipped.every(Number.isFinite)).toBe(true);
    expect(Float32Array.from(oracle.raw).some((value) => !Number.isFinite(value))).toBe(true);
    expect(Float32Array.from(oracle.delta).some((value) => !Number.isFinite(value))).toBe(true);
    expect(() => run(input)).toThrow(/regional annual diagnostics.*finite Float32/);
    expect(input).toEqual(snapshot);
  });

  it("uses the same representability refusal for binary64 annual accumulation overflow", () => {
    const input = fixture(); input.regionalResponse.gainC = Number.MAX_VALUE;
    expect(anomalyOracle(input, 0, 0.25).every(Number.isFinite)).toBe(true);
    const oracle = annualOracle(input, 384);
    expect(oracle.clipped.every(Number.isFinite)).toBe(true);
    expect(oracle.raw.some((value) => !Number.isFinite(value))).toBe(true);
    expect(() => run(input)).toThrow(/regional annual diagnostics.*finite Float32/);
  });

  it("independently qualifies one frozen crossing/wrap curve at 384/768/1536, unaffected by requested sampling form", () => {
    const input = fixture(); input.height = 2;
    input.solarByRow = [forcing(12, 25, 9), forcing(40, 22, 17)];
    input.elevation = new Int16Array([0, 80, 200, -100, 0, 40, 250, 0]);
    input.landMask = new Uint8Array([1, 1, 1, 0, 1, 1, 1, 0]);
    input.sstC = new Float32Array([0, 0, 0, 12, 0, 0, 0, 80]);
    input.regionalResponse.latitudeByRow = new Float32Array([45, 80]);
    input.regionalResponse.gainC = 12;
    input.regionalResponse.phases = Array.from({ length: 24 }, (_, phase) => phase / 24);
    input.regionalResponse.precipitationByPhase = input.regionalResponse.phases.map((phase) => Float32Array.from(
      [2, 15, 30, 0, 8, 20, 4, 0], (base, cell) => Math.max(0, base + (cell % 4 === 3 ? 0 : 8 * Math.sin(2 * Math.PI * phase + cell)))));
    input.regionalResponse.demandByPhase = input.regionalResponse.phases.map((phase) => Array.from(
      { length: 8 }, (_, cell) => cell % 4 === 3 ? 0 : 18 + 8 * Math.cos(2 * Math.PI * phase - cell)));
    const snapshot = structuredClone(input), actual = run(input);
    const reference = annualOracle(input, 24576);
    const errors = new Map<number, number>();
    for (const count of [384, 768, 1536]) {
      const oracle = annualOracle(input, count);
      errors.set(count, Math.max(...Array.from(oracle.clipped, (value, cell) => Math.abs(value - reference.clipped[cell]!))));
      if (count === 384) {
        expect(actual.annualSurfaceTemperatureC).toEqual(Float32Array.from(oracle.clipped));
        expect(actual.annualUnclippedSurfaceTemperatureC).toEqual(Float32Array.from(oracle.raw));
        for (let cell = 0; cell < 8; cell++) expect(actual.annualClippingDeltaC[cell]!).toBeCloseTo(oracle.delta[cell]!, 5);
      }
    }
    // Existing owner budget for independently integrated nonsmooth clipped periodic curves, not a new gain fit.
    expect(errors.get(384)!).toBeLessThan(0.003);
    expect(errors.get(768)!).toBeLessThan(errors.get(384)!);
    expect(errors.get(1536)!).toBeLessThan(errors.get(768)!);
    for (const count of [2, 4, 12, 24, 48, 96]) {
      const sampled = run({ ...input, phases: Array.from({ length: count }, (_, phase) => phase / count),
        weights: new Array<number>(count).fill(1 / count) });
      expect(sampled.annualSurfaceTemperatureC).toEqual(actual.annualSurfaceTemperatureC);
      expect(sampled.annualUnclippedSurfaceTemperatureC).toEqual(actual.annualUnclippedSurfaceTemperatureC);
      expect(sampled.annualClippingDeltaC).toEqual(actual.annualClippingDeltaC);
    }
    expect(input).toEqual(snapshot);
  });
});
