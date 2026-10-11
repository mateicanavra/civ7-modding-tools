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
    regionalResponse: { gainC: 20, phases: [0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875],
      precipitationByPhase: Array.from({ length: 8 }, () => new Float32Array([0, 5, 10, 0])),
      demandByPhase: Array.from({ length: 8 }, () => [10, 10, 10, 0]),
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

function anomalyOracle(input: Fixture, row: number, phase: number, options = config) {
  const response = input.regionalResponse!;
  const source = response.phases.indexOf(phase);
  if (source < 0) throw new Error("Oracle requires an exact original producer phase.");
  const q = solarOracle(response.latitudeByRow[row]!, response.axialTiltDeg * Math.sin(2 * Math.PI * phase));
  const raw = rawAt(input, row, phase, options);
  const activity: number[] = [], limitation: number[] = [];
  for (let column = 0; column < input.width; column++) {
    const cell = row * input.width + column;
    const demand = response.demandByPhase[source]![cell]!;
    const precipitation = response.precipitationByPhase[source]![cell]!;
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
      const ground = land ? rawAt(input, row, phase, options) + lapse + anomaly[column]! : input.sstC[cell]!;
      surfaceTemperatureC[cell] = bounded(ground, options.minC, options.maxC);
    }
  }
  return { seaLevelTemperatureC, surfaceTemperatureC };
}

// Scalar reference: dense incumbent baseline plus a finite producer-phase departure.
// No corrected continuous curve, production response helper or sample Float32 values enter this sum.
function annualOracle(input: Fixture, count = 384, options = config) {
  const size = input.width * input.height;
  const raw = new Float64Array(size), clipped = raw.slice(), delta = raw.slice();
  const denseRaw = raw.slice(), denseClipped = raw.slice(), departure = raw.slice();
  const unbounded = raw.slice();
  for (let cell = 0; cell < size; cell++) {
    const row = Math.floor(cell / input.width), column = cell % input.width;
    const land = input.landMask[cell] === 1;
    const lapse = land ? Math.max(0, input.elevation[cell]! - input.seaLevel) * options.lapseRateCPerElevationUnit : 0;
    let rawSum = 0, clippedSum = 0;
    for (let sample = 0; sample < count; sample++) {
      const ground = land ? rawAt(input, row, (sample + 0.5) / count, options) + lapse : input.sstC[cell]!;
      rawSum += ground;
      clippedSum += bounded(ground, options.minC, options.maxC);
    }
    denseRaw[cell] = rawSum / count;
    denseClipped[cell] = clippedSum / count;
    let rawDeparture = 0, clippedDeparture = 0, changed = false;
    for (let source = 0; source < input.phases.length; source++) {
      const phase = input.phases[source]!;
      const anomaly = land ? anomalyOracle(input, row, phase, options)[column]! : 0;
      changed ||= anomaly !== 0;
      const ground = land ? rawAt(input, row, phase, options) + lapse : input.sstC[cell]!;
      rawDeparture += input.weights[source]! * anomaly;
      clippedDeparture += input.weights[source]! *
        (bounded(ground + anomaly, options.minC, options.maxC) - bounded(ground, options.minC, options.maxC));
    }
    departure[cell] = clippedDeparture;
    unbounded[cell] = denseClipped[cell]! + clippedDeparture;
    raw[cell] = changed ? denseRaw[cell]! + rawDeparture : denseRaw[cell]!;
    clipped[cell] = changed ? bounded(unbounded[cell]!, options.minC, options.maxC) : denseClipped[cell]!;
    delta[cell] = clipped[cell]! - raw[cell]!;
  }
  return { raw, clipped, delta, denseRaw, denseClipped, departure, unbounded };
}

describe("frozen producer-phase regional thermal response", () => {
  it("preserves every incumbent output at omitted/zero gain, including zero-demand data and input identity", () => {
    const input = fixture();
    input.regionalResponse.gainC = 0;
    input.regionalResponse.demandByPhase = input.regionalResponse.demandByPhase.map(() => [0, 0, 0, 0]);
    input.phases = [0.01, 0.33, 0.999]; input.weights = [0.2, 0.3, 0.5];
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
    expect(mutate((input) => {
      input.regionalResponse.phases[2] = 0.51; input.phases = input.regionalResponse.phases.slice();
    })).toThrow(/uniform/);
    expect(mutate((input) => {
      input.regionalResponse.phases.reverse(); input.phases = input.regionalResponse.phases.slice();
    })).toThrow(/uniform/);
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

  it("distinguishes warm illuminated limitation from cold dark limitation with identical annual P/D summaries", () => {
    const warm = fixture(); warm.elevation.fill(0); warm.solarByRow = [forcing(10, 0, 20)];
    warm.regionalResponse.latitudeByRow[0] = 90;
    warm.regionalResponse.phases = [0.125, 0.375, 0.625, 0.875];
    warm.phases = warm.regionalResponse.phases.slice(); warm.weights = [0.25, 0.25, 0.25, 0.25];
    warm.regionalResponse.demandByPhase = warm.phases.map(() => [10, 10, 10, 0]);
    warm.regionalResponse.precipitationByPhase = warm.phases.map((_, phase) =>
      new Float32Array([phase < 2 ? 0 : 10, 10, 10, 0]));
    const cold = structuredClone(warm);
    cold.regionalResponse.precipitationByPhase.reverse();
    for (const field of ["precipitationByPhase", "demandByPhase"] as const) {
      for (let cell = 0; cell < warm.width; cell++) {
        const summary = (input: typeof warm) => input.weights.reduce(
          (sum, weight, phase) => sum + weight * input.regionalResponse[field][phase]![cell]!, 0);
        expect(summary(warm)).toBe(summary(cold));
      }
    }
    const active = run(warm), inactive = run(cold), baseline = incumbent(warm);
    expect(inactive).toEqual(baseline);
    for (const phase of [0, 1]) {
      expect(active.samples[phase]).toEqual(sampleOracle(warm, warm.phases[phase]!));
      expect(active.samples[phase]!.surfaceTemperatureC[0]!).toBeGreaterThan(baseline.samples[phase]!.surfaceTemperatureC[0]!);
      expect(active.samples[phase]!.surfaceTemperatureC[1]!).toBeLessThan(baseline.samples[phase]!.surfaceTemperatureC[1]!);
    }
    for (const phase of [2, 3]) expect(active.samples[phase]).toEqual(baseline.samples[phase]);
    expect(active.annualSurfaceTemperatureC[0]!).toBeGreaterThan(inactive.annualSurfaceTemperatureC[0]!);
    expect(active.annualSurfaceTemperatureC[1]!).toBeLessThan(inactive.annualSurfaceTemperatureC[1]!);
    expect(active.annualSurfaceTemperatureC).toEqual(Float32Array.from(annualOracle(warm).clipped));
  });

  it("cannot carry warm producer-phase corrections into another admitted cold ground phase", () => {
    const input = fixture(); input.elevation.fill(0);
    const [real, imaginary] = fit.g2, norm = real * real + imaginary * imaginary;
    input.solarByRow = [{ ...forcing(0), cos2Q: 20 * real / norm, sin2Q: 20 * imaginary / norm }];
    input.regionalResponse.phases = [0, 0.25, 0.5, 0.75];
    input.regionalResponse.precipitationByPhase = input.regionalResponse.precipitationByPhase.slice(0, 4);
    input.regionalResponse.demandByPhase = input.regionalResponse.demandByPhase.slice(0, 4);
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

  it("preserves exact inert and original-water diagnostics when dense clipping drifts beyond a nonbinary bound", () => {
    const options = { ...config, minC: -0.1, maxC: 0.3 };
    const water = fixture(); water.landMask.fill(0); water.sstC.fill(-0.1);
    water.regionalResponse.demandByPhase.forEach((field) => field.fill(0));
    const oracle = annualOracle(water, 384, options), baseline = incumbent(water, options);
    expect(oracle.denseClipped[0]!).toBeLessThan(options.minC);
    expect(Math.fround(options.minC - oracle.raw[0]!)).not.toBe(Math.fround(oracle.delta[0]!));
    expect(run(water, options)).toEqual(baseline);
    expect(baseline.annualClippingDeltaC).toEqual(Float32Array.from(oracle.delta));
    const land = fixture(); land.solarByRow = [forcing(-0.100000001)]; land.elevation.fill(0);
    expect(run(land, options)).toEqual(incumbent(land, options));
  });

  it("refuses unsupported zero-demand knots and preserves the response for strictly positive near-zero demand", () => {
    const input = fixture(); input.elevation.fill(0);
    input.regionalResponse.axialTiltDeg = 0;
    input.regionalResponse.phases = [0, 0.5];
    input.phases = [0, 0.5]; input.weights = [0.5, 0.5];
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

  it("uses actual P/D at each shifted producer knot and retains its known signed row anomaly", () => {
    const input = fixture(); input.elevation.fill(0); input.solarByRow = [forcing(35)];
    input.regionalResponse.latitudeByRow[0] = 0; input.regionalResponse.axialTiltDeg = 0;
    input.regionalResponse.phases = [0.125, 0.375, 0.625, 0.875];
    input.regionalResponse.precipitationByPhase = [0, 3, 8, 1].map((value) => new Float32Array([value, 10, 5, 0]));
    input.regionalResponse.demandByPhase = [2, 12, 9, 4].map((value) => [value, 10, 10, 0]);
    input.phases = input.regionalResponse.phases.slice(); input.weights = [0.1, 0.2, 0.3, 0.4];
    const knownLimitation = [1, 3 / 4, 1 / 9, 3 / 4];
    const actual = run(input);
    for (const [phaseIndex, phase] of input.phases.entries()) {
      const limitation = knownLimitation[phaseIndex]!, reference = (limitation + 0.5) / 3;
      const expected = [limitation - reference, -reference, 0.5 - reference].map((value) => 20 / Math.PI * value);
      expect(expected.reduce((sum, value) => sum + value, 0)).toBeCloseTo(0, 14);
      for (let cell = 0; cell < input.width - 1; cell++) {
        expect(actual.samples[phaseIndex]!.surfaceTemperatureC[cell]).toBe(Math.fround(rawAt(input, 0, phase) + expected[cell]!));
      }
    }
    expect(actual.samples[0]!.surfaceTemperatureC[0]).not.toBe(actual.samples[2]!.surfaceTemperatureC[0]);
    expect(actual.annualSurfaceTemperatureC).toEqual(Float32Array.from(annualOracle(input).clipped));
  });

  it("refuses every enabled calendar mismatch instead of interpolating, snapping or falling back", () => {
    const input = fixture();
    for (const phases of [[0, 0.25, 0.5, 0.75], input.phases.slice().reverse(),
      input.phases.map((phase, index) => index === 1 ? phase + Number.EPSILON : phase)]) {
      const requested = { ...input, phases, weights: new Array<number>(phases.length).fill(1 / phases.length) };
      expect(() => run(requested)).toThrow(/calendar|producer|source phases/i);
      expect(run({ ...requested, regionalResponse: { ...input.regionalResponse, gainC: 0 } })).toEqual(incumbent(requested));
    }
    const shifted = fixture();
    shifted.regionalResponse.phases = shifted.regionalResponse.phases.map((phase) => phase + 1 / 32);
    expect(() => run(shifted)).toThrow(/calendar|producer|source phases/i);
    shifted.phases = shifted.regionalResponse.phases.slice();
    expect(run(shifted).samples[0]).toEqual(sampleOracle(shifted, shifted.phases[0]!));
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

  it("uses each qualified 12/24/48/96 matching calendar with direct phase arithmetic and exact cold gates", () => {
    for (const count of [12, 24, 48, 96]) {
      const input = fixture(); input.solarByRow = [forcing(10, 25, 0)];
      input.regionalResponse.phases = Array.from({ length: count }, (_, phase) => phase / count);
      input.regionalResponse.precipitationByPhase = input.regionalResponse.phases.map((phase) =>
        new Float32Array([6 + 6 * Math.sin(2 * Math.PI * phase), 12, 2, 0]));
      input.regionalResponse.demandByPhase = input.regionalResponse.phases.map((phase) =>
        [18 + 4 * Math.cos(2 * Math.PI * phase), 12, 12, 0]);
      input.phases = input.regionalResponse.phases.slice();
      input.weights = new Array<number>(input.phases.length).fill(1 / input.phases.length);
      const actual = run(input), baseline = incumbent(input);
      for (const [phaseIndex, phase] of input.phases.entries()) expect(actual.samples[phaseIndex]).toEqual(sampleOracle(input, phase));
      expect(actual.samples[count / 2]).toEqual(baseline.samples[count / 2]);
    }
  });

  it("adds the anomaly to raw sea level before independent clipping and one lapse, and recomputes the pressure mean", () => {
    const input = fixture(); input.solarByRow = [forcing(100)];
    input.elevation = new Int16Array([400, 200, 0, 0]);
    input.regionalResponse.gainC = 200;
    input.weights = input.phases.map((_, phase) => (phase + 1) / 36);
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

  it("refuses unrepresentable maximum finite gain without inventing dense corrected accumulation overflow", () => {
    const input = fixture(); input.regionalResponse.gainC = Number.MAX_VALUE;
    expect(anomalyOracle(input, 0, 0.25).every(Number.isFinite)).toBe(true);
    const oracle = annualOracle(input);
    expect(oracle.clipped.every(Number.isFinite)).toBe(true);
    expect(oracle.raw.every(Number.isFinite)).toBe(true);
    expect(oracle.delta.every(Number.isFinite)).toBe(true);
    expect(Float32Array.from(oracle.raw).some((value) => !Number.isFinite(value))).toBe(true);
    expect(() => run(input)).toThrow(/regional annual diagnostics.*finite Float32/);
  });

  it("publishes the independently reduced bounded annual proxy at nonuniform producer weights, not a phase mean", () => {
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
    input.phases = input.regionalResponse.phases.slice();
    input.weights = input.phases.map((_, phase) => (phase + 1) / 300);
    const options = { ...config, minC: -10, maxC: 30 };
    const snapshot = structuredClone(input), actual = run(input, options);
    const oracle = annualOracle(input, 384, options), baseline = incumbent(input, options);
    expect(baseline.annualSurfaceTemperatureC).toEqual(Float32Array.from(oracle.denseClipped));
    expect(baseline.annualUnclippedSurfaceTemperatureC).toEqual(Float32Array.from(oracle.denseRaw));
    expect(actual.annualSurfaceTemperatureC).toEqual(Float32Array.from(oracle.clipped));
    expect(actual.annualUnclippedSurfaceTemperatureC).toEqual(Float32Array.from(oracle.raw));
    expect(actual.annualClippingDeltaC).toEqual(Float32Array.from(oracle.delta));
    const phaseMean = input.weights.reduce((sum, weight, phase) =>
      sum + weight * actual.samples[phase]!.surfaceTemperatureC[0]!, 0);
    expect(Math.abs(actual.annualSurfaceTemperatureC[0]! - phaseMean)).toBeGreaterThan(0.1);
    expect(actual.annualSurfaceTemperatureC[3]).toBe(12);
    expect(actual.annualSurfaceTemperatureC[7]).toBe(30);
    expect(actual.annualUnclippedSurfaceTemperatureC[7]).toBe(80);
    expect(actual.annualClippingDeltaC[7]).toBe(-50);
    expect(run(input, options)).toEqual(actual);
    expect(input).toEqual(snapshot);
  });

  it("saturates the aggregate proxy when dense and producer baselines differ at either thermal bound", () => {
    for (const upper of [true, false]) {
      const input = fixture(); input.elevation.fill(0);
      input.solarByRow = [forcing(upper ? 20 : -20, 20)];
      input.phases = [upper ? 0.5 : 0]; input.weights = [1];
      input.regionalResponse.phases = input.phases.slice();
      input.regionalResponse.precipitationByPhase = [new Float32Array([0, 10, 10, 0])];
      input.regionalResponse.demandByPhase = [[10, 10, 10, 0]];
      input.regionalResponse.latitudeByRow[0] = 0; input.regionalResponse.axialTiltDeg = 0;
      input.regionalResponse.tMinC = -10; input.regionalResponse.tMaxC = 0;
      input.regionalResponse.gainC = 600;
      const oracle = annualOracle(input), actual = run(input), cell = upper ? 0 : 1;
      if (upper) expect(oracle.unbounded[cell]!).toBeGreaterThan(config.maxC);
      else expect(oracle.unbounded[cell]!).toBeLessThan(config.minC);
      expect(actual.samples[0]!.surfaceTemperatureC[cell]).toBe(upper ? config.maxC : config.minC);
      expect(actual.annualSurfaceTemperatureC[cell]).toBe(upper ? config.maxC : config.minC);
      expect(actual.annualSurfaceTemperatureC).toEqual(Float32Array.from(oracle.clipped));
      expect(actual.annualUnclippedSurfaceTemperatureC).toEqual(Float32Array.from(oracle.raw));
      expect(actual.annualClippingDeltaC).toEqual(Float32Array.from(oracle.delta));
    }
  });

  it("reduces clipped departures before Float32 sample rounding and computes the diagnostic before output rounding", () => {
    const input = fixture(); input.elevation.fill(0); input.solarByRow = [forcing(30.0000005)];
    input.regionalResponse.latitudeByRow[0] = 0; input.regionalResponse.axialTiltDeg = 0;
    input.regionalResponse.gainC = 1e-5;
    input.weights = input.phases.map((_, phase) => (phase + 1) / 36);
    const options = { ...config, maxC: 30 }, oracle = annualOracle(input, 384, options);
    const actual = run(input, options), baseline = incumbent(input, options);
    const roundedDeparture = input.weights.reduce((sum, weight, phase) => sum + weight *
      (actual.samples[phase]!.surfaceTemperatureC[2]! - baseline.samples[phase]!.surfaceTemperatureC[2]!), 0);
    expect(roundedDeparture).toBe(0);
    expect(oracle.departure[2]!).toBeLessThan(-1e-7);
    const roundedProxy = bounded(oracle.denseClipped[2]! + roundedDeparture, options.minC, options.maxC);
    expect(Math.fround(roundedProxy - oracle.raw[2]!)).not.toBe(Math.fround(oracle.delta[2]!));
    expect(actual.annualSurfaceTemperatureC).toEqual(Float32Array.from(oracle.clipped));
    expect(actual.annualUnclippedSurfaceTemperatureC).toEqual(Float32Array.from(oracle.raw));
    expect(actual.annualClippingDeltaC).toEqual(Float32Array.from(oracle.delta));
    expect(actual.annualSurfaceTemperatureC[0]! - actual.annualUnclippedSurfaceTemperatureC[0]!).not.toBe(actual.annualClippingDeltaC[0]);
  });
});
