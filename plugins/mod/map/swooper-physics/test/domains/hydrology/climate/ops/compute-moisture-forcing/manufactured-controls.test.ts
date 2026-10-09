import { describe, expect, it } from "bun:test";
import { runAdmittedOperationForTest } from "@swooper/mapgen-core/testing";
import hydrology from "../../../../../../src/domain/hydrology/router.js";

const { computeMoistureForcing } = hydrology.climate.ops;
type Input = Parameters<typeof computeMoistureForcing.run>[0];
type Config = Parameters<typeof computeMoistureForcing.run>[1]["config"];
const PARAMETERS = {
  marineSourceRate: 300,
  backgroundExtractionRate: 1.2,
  ascentExtractionRate: 4,
  transportSpeed: 20,
  terrainGradientReference: 300,
  wetnessScale: 1,
} satisfies Config;

function fixture(width = 84, height = 6) {
  const size = width * height;
  return {
    width,
    height,
    landMask: new Uint8Array(size).fill(1),
    externalWaterMask: new Uint8Array(size),
    elevation: new Int16Array(size),
    seaLevel: 0,
    windU: new Int8Array(size),
    windV: new Int8Array(size),
    sstC: new Float32Array(size).fill(32),
    seaIceMask: new Uint8Array(size),
  } satisfies Input;
}

function run(input: Input, config: Config = PARAMETERS) {
  return runAdmittedOperationForTest(computeMoistureForcing, input, {
    strategy: "source-limited", config,
  });
}

function sum(values: ArrayLike<number>) {
  let result = 0;
  for (let i = 0; i < values.length; i++) result += values[i]!;
  return result;
}

function guard(q: number, passes: number, size: number) {
  const ku = (64 * passes + 4 * size + 16) * 2 ** -53;
  return ku / (1 - ku) * q;
}

function halfUlp32(value: number) {
  return Math.abs(value) < 2 ** -126
    ? 2 ** -150
    : 2 ** (Math.floor(Math.log2(Math.abs(value))) - 24);
}

// Whole-interval series is independent of the implementation's piecewise psi evaluation.
function sourceRainFraction(extraction: number) {
  let result = 0;
  let term = extraction / 2;
  for (let n = 1; n <= 48; n++) {
    result += term;
    term *= -extraction / (n + 2);
  }
  return result;
}

const EVEN = [[1, 0], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1]] as const;
const ODD = [[1, 0], [1, 1], [0, 1], [-1, 0], [0, -1], [1, -1]] as const;

// Independent angular construction, without an implementation or SDK geometry import.
function oracleShares(input: Input, index: number) {
  const u = input.windU[index]!;
  const v = input.windV[index]!;
  const magnitude = Math.hypot(u, v);
  if (magnitude === 0) return [];
  const angle = (Math.atan2(v, u) + 2 * Math.PI) % (2 * Math.PI);
  const sector = Math.min(5, Math.floor(angle / (Math.PI / 3)));
  const offset = angle - sector * Math.PI / 3;
  const a = Math.sin(Math.PI / 3 - offset);
  const b = Math.sin(offset);
  const weights = [a / (a + b), b / (a + b)];
  const bx = weights[0]! * Math.cos(sector * Math.PI / 3)
    + weights[1]! * Math.cos((sector + 1) * Math.PI / 3);
  const by = weights[0]! * Math.sin(sector * Math.PI / 3)
    + weights[1]! * Math.sin((sector + 1) * Math.PI / 3);
  const rate = 20 * Math.min(1, magnitude / 127)
    / ((84 / input.width) * Math.hypot(bx, by));
  const y = Math.floor(index / input.width);
  const x = index % input.width;
  const offsets = y % 2 === 0 ? EVEN : ODD;
  return weights.map((weight, k) => {
    const [dx, dy] = offsets[(sector + k) % 6]!;
    const ny = y + dy;
    const neighbor = ny < 0 || ny >= input.height
      ? index
      : ny * input.width + ((x + dx + input.width) % input.width);
    return { neighbor, rate: rate * weight };
  });
}

function sourceRates(input: Input, scale = 1) {
  return Float64Array.from({ length: input.width * input.height }, (_, i) =>
    input.landMask[i] !== 1 && input.externalWaterMask[i] === 1
      ? 300 * scale * Math.max(0, Math.min(1, (input.sstC[i]! + 10) / 42))
        * (input.seaIceMask[i] === 1 ? 0.08 : 1)
        * (0.65 + 0.35 * Math.min(1, Math.hypot(input.windU[i]!, input.windV[i]!) / 127))
      : 0
  );
}

function nominalOracle(input: Input) {
  const size = input.width * input.height;
  const passes = Math.max(64, Math.ceil(40 / ((84 / input.width) * Math.sqrt(3) / 2)));
  const dt = 1 / passes;
  const shares = Array.from({ length: size }, (_, i) => oracleShares(input, i));
  const source = sourceRates(input);
  const ascent = new Float64Array(size);
  for (let donor = 0; donor < size; donor++) {
    const z = input.landMask[donor] === 1
      ? input.elevation[donor]! - input.seaLevel
      : input.externalWaterMask[donor] === 1 ? 0 : undefined;
    if (z === undefined) continue;
    for (const { neighbor, rate } of shares[donor]!) {
      if (input.landMask[neighbor] === 1) {
        ascent[neighbor] += rate * (input.elevation[neighbor]! - input.seaLevel - z);
      }
    }
  }
  const extraction = Float64Array.from(ascent, (rise, i) =>
    1.2 + (input.landMask[i] === 1 ? 4 * Math.max(0, Math.min(1, rise / 6000)) : 0)
  );
  const p = new Float64Array(size);
  let stock = new Float64Array(size);
  let next = new Float64Array(size);
  for (let pass = 0; pass < passes; pass++) {
    next.fill(0);
    for (let donor = 0; donor < size; donor++) {
      const z = extraction[donor]! * dt;
      const rain = stock[donor]! * -Math.expm1(-z)
        + source[donor]! * dt * sourceRainFraction(z);
      const remaining = stock[donor]! * Math.exp(-z)
        + source[donor]! * dt * (1 - sourceRainFraction(z));
      p[donor] += rain;
      next[donor] += remaining;
      for (const { neighbor, rate } of shares[donor]!) {
        const transfer = rate * dt * remaining;
        next[donor] -= transfer;
        next[neighbor] += transfer;
      }
    }
    const swap = stock;
    stock = next;
    next = swap;
  }
  const q = sum(source);
  const tolerance = guard(q, passes, size);
  // This validates the reference's own account, not the unexposed production stock/ledger.
  expect(Math.abs(q - sum(p) - sum(stock))).toBeLessThanOrEqual(tolerance);
  return { p, q, tolerance };
}

function expectReferenceAgreement(input: Input) {
  const before = structuredClone(input);
  const actual = run(input);
  const reference = nominalOracle(input);
  for (let i = 0; i < reference.p.length; i++) {
    expect(Math.abs(actual.precipitation[i]! - reference.p[i]!)).toBeLessThanOrEqual(
      reference.tolerance + halfUlp32(actual.precipitation[i]!)
    );
  }
  expect(actual.precipitation.every((p) => Number.isFinite(p) && p >= 0)).toBe(true);
  expect(actual.surfaceWetness).toEqual(Float32Array.from(actual.precipitation, (p) => Math.min(1, p / 200)));
  expect(input).toEqual(before);
  return actual;
}

describe("source-limited moisture: public nominal controls", () => {
  it("keeps warm dry land, ridges and finite inland water exactly source-free", () => {
    const input = fixture(23, 8);
    for (let i = 0; i < input.landMask.length; i++) {
      input.landMask[i] = i % 7 === 0 ? 0 : 1;
      input.elevation[i] = i % 7 === 0 ? -500 : (i * 173) % 2400;
      input.windU[i] = (i * 29) % 255 - 127;
      input.windV[i] = (i * 47) % 255 - 127;
    }
    const actual = expectReferenceAgreement(input);
    expect(actual.precipitation).toEqual(new Float32Array(input.width * input.height));
    expect(actual.surfaceWetness).toEqual(new Float32Array(input.width * input.height));
  });

  it("matches exact calm reaction, marine eligibility, supply scaling and float publication", () => {
    const input = fixture(7, 2);
    input.landMask.fill(0);
    input.externalWaterMask.fill(1);
    input.externalWaterMask[0] = 0;
    input.sstC[1] = -10;
    input.sstC[2] = 11;
    input.seaIceMask[3] = 1;
    const actual = run(input);
    const scaled = run(input, { ...PARAMETERS, wetnessScale: 0.5 });
    const source = sourceRates(input);
    const tolerance = guard(sum(source), 64, source.length);
    let fractionalPublishedValues = 0;
    for (let i = 0; i < source.length; i++) {
      const p = source[i]! * sourceRainFraction(1.2);
      expect(Math.abs(actual.precipitation[i]! - p)).toBeLessThanOrEqual(tolerance + halfUlp32(actual.precipitation[i]!));
      expect(scaled.precipitation[i]).toBe(Math.fround(actual.precipitation[i]! / 2));
      if (actual.precipitation[i] !== Math.round(actual.precipitation[i]!)) fractionalPublishedValues++;
    }
    expect(fractionalPublishedValues).toBeGreaterThan(0);
    expect(actual.surfaceWetness).toEqual(Float32Array.from(actual.precipitation, (p) => Math.min(1, p / 200)));
    expect(scaled.surfaceWetness).toEqual(Float32Array.from(scaled.precipitation, (p) => Math.min(1, p / 200)));
    expect(Object.keys(actual).sort()).toEqual(["precipitation", "surfaceWetness"]);
  });

  it("requires prescribed thermal inputs and cardinality while refusing private controls", () => {
    const input = fixture(3, 2);
    const { sstC: _sst, ...withoutSst } = input;
    const { seaIceMask: _ice, ...withoutIce } = input;
    // @ts-expect-error Required prescribed SST is deliberately absent.
    expect(() => run(withoutSst)).toThrow();
    // @ts-expect-error Required prescribed ice identity is deliberately absent.
    expect(() => run(withoutIce)).toThrow();
    const factories = {
      landMask: (length: number) => new Uint8Array(length),
      externalWaterMask: (length: number) => new Uint8Array(length),
      elevation: (length: number) => new Int16Array(length),
      windU: (length: number) => new Int8Array(length),
      windV: (length: number) => new Int8Array(length),
      sstC: (length: number) => new Float32Array(length),
      seaIceMask: (length: number) => new Uint8Array(length),
    };
    for (const [field, allocate] of Object.entries(factories)) {
      for (const length of [5, 7]) expect(() => run({ ...input, [field]: allocate(length) })).toThrow();
    }
    for (const controls of [{ initialStock: new Float64Array(6) }, { passCount: 128 }]) {
      expect(() => run({ ...input, ...controls })).toThrow();
    }
    const unsupportedConfig = { ...PARAMETERS, passCount: 128 };
    expect(() => run(input, unsupportedConfig)).toThrow();
  });

  it("reverses windward rainfall and downstream depletion when ridge winds reverse", () => {
    for (const direction of [-1, 1]) {
      const flat = fixture();
      flat.windU.fill(direction * 127);
      for (let y = 0; y < flat.height; y++) {
        for (let x = 0; x < flat.width; x++) {
          const i = y * flat.width + x;
          if (direction === 1 ? x < 16 : x >= 68) {
            flat.landMask[i] = 0;
            flat.externalWaterMask[i] = 1;
            flat.elevation[i] = -1000;
          }
        }
      }
      const ridge = structuredClone(flat);
      for (let y = 0; y < ridge.height; y++) {
        for (let x = 30; x <= 54; x++) {
          ridge.elevation[y * ridge.width + x] = Math.max(0, 600 - Math.abs(x - 42) * 100);
        }
      }
      const a = expectReferenceAgreement(flat);
      const b = expectReferenceAgreement(ridge);
      const row = 3 * flat.width;
      const windward = row + (direction === 1 ? 40 : 44);
      const downstream = row + (direction === 1 ? 52 : 32);
      expect(b.precipitation[windward]!).toBeGreaterThan(a.precipitation[windward]!);
      expect(b.precipitation[downstream]!).toBeLessThan(a.precipitation[downstream]!);
    }
  });

  it("uses coastal surface ascent and signed contour inflow without datum or marine-bed dependence", () => {
    const plateau = fixture();
    plateau.windU.fill(127);
    plateau.elevation.fill(200);
    for (let y = 0; y < plateau.height; y++) {
      for (let x = 0; x < 20; x++) {
        const i = y * plateau.width + x;
        plateau.landMask[i] = 0;
        plateau.externalWaterMask[i] = 1;
        plateau.elevation[i] = -1000;
      }
    }
    const actual = expectReferenceAgreement(plateau);
    const flat = structuredClone(plateau);
    for (let i = 0; i < flat.elevation.length; i++) {
      if (flat.landMask[i] === 1) flat.elevation[i] = 0;
    }
    const flatResult = expectReferenceAgreement(flat);
    expect(actual.precipitation[3 * plateau.width + 20]!).toBeGreaterThan(flatResult.precipitation[3 * plateau.width + 20]!);
    const shifted = structuredClone(plateau);
    shifted.seaLevel = 500;
    for (let i = 0; i < shifted.elevation.length; i++) {
      shifted.elevation[i] = shifted.landMask[i] === 1 ? shifted.elevation[i]! + 500 : -12000;
    }
    expect(expectReferenceAgreement(shifted)).toEqual(actual);
    const contour = fixture(23, 30);
    contour.windV.fill(127);
    for (let i = 0; i < contour.elevation.length; i++) {
      const row = Math.floor(i / contour.width);
      contour.elevation[i] = 100 * (i % contour.width) + 50 * (row % 2);
      if (row < 5) {
        contour.landMask[i] = 0;
        contour.externalWaterMask[i] = 1;
        contour.elevation[i] = -1000;
      }
    }
    const contourResult = expectReferenceAgreement(contour);
    expect(contourResult.precipitation[10 * contour.width + 10]!).toBeGreaterThan(0);
  });

  it("matches independent nominal transport across X, bounded Y, narrow aliases and variable wind", () => {
    for (const width of [1, 2, 7, 106]) {
      const input = fixture(width, width === 106 ? 2 : 6);
      for (let i = 0; i < input.windU.length; i++) {
        input.landMask[i] = i % 5 < 2 ? 0 : 1;
        input.externalWaterMask[i] = i % 5 === 0 ? 1 : 0;
        input.elevation[i] = (i * 137) % 1200;
        input.windU[i] = (i * 53) % 255 - 127;
        input.windV[i] = (i * 71) % 255 - 127;
        input.seaIceMask[i] = i % 3 === 0 ? 1 : 0;
      }
      expectReferenceAgreement(input);
    }
    for (const [u, v] of [[127, 0], [0, 127], [0, -127]]) {
      const input = fixture();
      input.landMask.fill(0);
      input.externalWaterMask.fill(1);
      input.windU.fill(u!);
      input.windV.fill(v!);
      const result = expectReferenceAgreement(input);
      if (v !== 0) {
        expect(result.precipitation.some((p) => p > 255)).toBe(true);
        expect(result.surfaceWetness.some((wetness) => wetness === 1)).toBe(true);
      }
    }
  });
});
