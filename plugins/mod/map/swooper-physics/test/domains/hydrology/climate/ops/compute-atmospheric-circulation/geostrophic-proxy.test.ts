import { describe, expect, it } from "bun:test";

import hydrologyOpsPublic from "../../../../../../src/domain/hydrology/router.js";
import {
  deriveTestOperationSeed,
  TEST_MAP_LATITUDE_BOUNDS,
  TEST_MAP_SIZE,
} from "../../../../../setup.js";

const { computeAtmosphericCirculation } = hydrologyOpsPublic.climate.ops;
const { width: WIDTH, height: HEIGHT } = TEST_MAP_SIZE.dimensions;
const OPERATION_SEED = deriveTestOperationSeed("test:hydrology:atmospheric-circulation");
const PRESSURE_PHASES = [0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2] as const;
const MIGRATED_LATITUDE_OFFSETS_DEG = [0, 10, 0, -10] as const;
const HIGH_PRESSURE_RESPONSE_CONFIG = {
  maxSpeed: 115,
  zonalStrength: 120,
  meridionalStrength: 15,
  pressureDrivenRms: 95 * 1.25,
  smoothIters: 5,
  equatorialTaperDeg: 18,
} as const;

const BACKBONE_ONLY = {
  maxSpeed: 130,
  zonalStrength: 100,
  meridionalStrength: 15,
  pressureDrivenRms: 0,
  smoothIters: 0,
  equatorialTaperDeg: 18,
} as const;

type GeostrophicConfig = {
  maxSpeed: number;
  zonalStrength: number;
  meridionalStrength: number;
  pressureDrivenRms: number;
  smoothIters: number;
  equatorialTaperDeg: number;
};

function latitudeRamp(
  top: number = TEST_MAP_LATITUDE_BOUNDS.topLatitude,
  bottom: number = TEST_MAP_LATITUDE_BOUNDS.bottomLatitude
): Float32Array {
  const latitudeByRow = new Float32Array(HEIGHT);
  for (let y = 0; y < HEIGHT; y++) {
    latitudeByRow[y] = top + (bottom - top) * (y / Math.max(1, HEIGHT - 1));
  }
  return latitudeByRow;
}

function runWind(
  latitudeByRow: Float32Array,
  config: GeostrophicConfig,
  input: Readonly<{ pressureField?: Float32Array; rngSeed?: number }> = {}
): { windU: Int8Array; windV: Int8Array } {
  return computeAtmosphericCirculation.run(
    {
      width: WIDTH,
      height: HEIGHT,
      latitudeByRow,
      ...input,
      rngSeed: input.rngSeed ?? OPERATION_SEED,
      pressureField: input.pressureField ?? new Float32Array(WIDTH * HEIGHT),
    },
    { strategy: "geostrophic-proxy", config }
  );
}

function rowMean(values: Int8Array, y: number): number {
  let sum = 0;
  for (let x = 0; x < WIDTH; x++) sum += values[y * WIDTH + x] ?? 0;
  return sum / WIDTH;
}

function rowVariance(values: Int8Array, y: number): number {
  const mean = rowMean(values, y);
  let squareSum = 0;
  for (let x = 0; x < WIDTH; x++) {
    const delta = (values[y * WIDTH + x] ?? 0) - mean;
    squareSum += delta * delta;
  }
  return squareSum / WIDTH;
}

function rowsWhere(
  latitudeByRow: Float32Array,
  predicate: (latitudeDeg: number) => boolean
): number[] {
  const rows: number[] = [];
  for (let y = 0; y < HEIGHT; y++) {
    if (predicate(latitudeByRow[y] ?? 0)) rows.push(y);
  }
  return rows;
}

function bandMean(values: Int8Array, rows: readonly number[]): number {
  expect(rows.length).toBeGreaterThan(0);
  return rows.reduce((sum, y) => sum + rowMean(values, y), 0) / rows.length;
}

function rowForLatitude(latitudeByRow: Float32Array, target: number): number {
  let nearest = 0;
  for (let y = 1; y < HEIGHT; y++) {
    if (
      Math.abs((latitudeByRow[y] ?? 0) - target) <
      Math.abs((latitudeByRow[nearest] ?? 0) - target)
    ) {
      nearest = y;
    }
  }
  return nearest;
}

function pressureWithBlobs(centers: readonly { x: number; y: number }[]): Float32Array {
  const pressureField = new Float32Array(WIDTH * HEIGHT);
  for (const center of centers) {
    for (let y = 0; y < HEIGHT; y++) {
      for (let x = 0; x < WIDTH; x++) {
        const rawDx = x - center.x;
        const dx =
          Math.abs(rawDx) <= WIDTH / 2 ? rawDx : rawDx - Math.sign(rawDx) * WIDTH;
        const dy = y - center.y;
        const distance = Math.hypot(dx, dy);
        if (distance > 6) continue;
        const pressure = 20 * Math.exp(-(distance * distance) / 12);
        const index = y * WIDTH + x;
        if (pressure > (pressureField[index] ?? 0)) pressureField[index] = pressure;
      }
    }
  }
  return pressureField;
}

function pressureWave(phase: number, amplitude = 30): Float32Array {
  const pressureField = new Float32Array(WIDTH * HEIGHT);
  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      const longitude = (x / WIDTH) * Math.PI * 2;
      const latitude = (y / Math.max(1, HEIGHT - 1)) * Math.PI * 2;
      pressureField[y * WIDTH + x] =
        amplitude *
        (Math.sin(longitude + phase) + 0.6 * Math.cos(longitude * 2 + latitude + phase));
    }
  }
  return pressureField;
}

function circulationSense(
  field: Readonly<{ windU: Int8Array; windV: Int8Array }>,
  center: Readonly<{ x: number; y: number }>
): number {
  let sum = 0;
  let count = 0;
  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      const rawDx = x - center.x;
      const dx = Math.abs(rawDx) <= WIDTH / 2 ? rawDx : rawDx - Math.sign(rawDx) * WIDTH;
      const dy = y - center.y;
      const distance = Math.hypot(dx, dy);
      if (distance < 2 || distance > 6) continue;
      const index = y * WIDTH + x;
      sum +=
        (dx * (field.windV[index] ?? 0) - dy * (field.windU[index] ?? 0)) / distance;
      count += 1;
    }
  }
  return count > 0 ? sum / count : 0;
}

function meanFields(
  fields: readonly Readonly<{ windU: Int8Array; windV: Int8Array }>[]
): { windU: Int8Array; windV: Int8Array } {
  const windU = new Int8Array(WIDTH * HEIGHT);
  const windV = new Int8Array(WIDTH * HEIGHT);
  for (let i = 0; i < windU.length; i++) {
    let sumU = 0;
    let sumV = 0;
    for (const field of fields) {
      sumU += field.windU[i] ?? 0;
      sumV += field.windV[i] ?? 0;
    }
    windU[i] = Math.round(sumU / fields.length);
    windV[i] = Math.round(sumV / fields.length);
  }
  return { windU, windV };
}

function magnitudeCeilingShare(field: Readonly<{ windU: Int8Array; windV: Int8Array }>): number {
  let ceilingCount = 0;
  for (let i = 0; i < WIDTH * HEIGHT; i++) {
    if (Math.hypot(field.windU[i] ?? 0, field.windV[i] ?? 0) >= 126.5) ceilingCount += 1;
  }
  return ceilingCount / (WIDTH * HEIGHT);
}

function vectorRms(field: Readonly<{ windU: Int8Array; windV: Int8Array }>): number {
  let squareSum = 0;
  for (let index = 0; index < WIDTH * HEIGHT; index++) {
    const u = field.windU[index] ?? 0;
    const v = field.windV[index] ?? 0;
    squareSum += u * u + v * v;
  }
  return Math.sqrt(squareSum / (WIDTH * HEIGHT));
}

function vectorDifferenceRms(
  a: Readonly<{ windU: Int8Array; windV: Int8Array }>,
  b: Readonly<{ windU: Int8Array; windV: Int8Array }>
): number {
  let squareSum = 0;
  for (let index = 0; index < WIDTH * HEIGHT; index++) {
    const du = (a.windU[index] ?? 0) - (b.windU[index] ?? 0);
    const dv = (a.windV[index] ?? 0) - (b.windV[index] ?? 0);
    squareSum += du * du + dv * dv;
  }
  return Math.sqrt(squareSum / (WIDTH * HEIGHT));
}

function zonalDeviationRatio(field: Readonly<{ windU: Int8Array }>): number {
  let banded = 0;
  let deviation = 0;
  for (let y = 0; y < HEIGHT; y++) {
    banded += Math.abs(rowMean(field.windU, y));
    deviation += Math.sqrt(rowVariance(field.windU, y));
  }
  return deviation / Math.max(1e-6, banded);
}

describe("hydrology/compute-atmospheric-circulation (geostrophic-proxy)", () => {
  it("is deterministic from explicit pressure and ignores rngSeed", () => {
    const latitudeByRow = latitudeRamp();
    const config = {
      ...BACKBONE_ONLY,
      pressureDrivenRms: 35,
      smoothIters: 4,
    };
    const pressureField = pressureWave(0);

    const a = runWind(latitudeByRow, config, { pressureField, rngSeed: 1 });
    const b = runWind(latitudeByRow, config, { pressureField, rngSeed: 2 });

    expect(a).toEqual(b);
    const midlatitudeRow = rowForLatitude(latitudeByRow, 45);
    expect(rowVariance(a.windU, midlatitudeRow)).toBeGreaterThan(0);
    expect(rowVariance(a.windV, midlatitudeRow)).toBeGreaterThan(0);
  });

  it("keeps non-stagnant zonal bands across the three meridional circulation cells", () => {
    const latitudeByRow = latitudeRamp();
    const { windU, windV } = runWind(latitudeByRow, BACKBONE_ONLY);

    const northTrades = rowsWhere(
      latitudeByRow,
      (latitude) => latitude > 8 && latitude < 22
    );
    const southTrades = rowsWhere(
      latitudeByRow,
      (latitude) => latitude < -8 && latitude > -22
    );
    const northWesterlies = rowsWhere(
      latitudeByRow,
      (latitude) => latitude > 38 && latitude < 52
    );
    const southWesterlies = rowsWhere(
      latitudeByRow,
      (latitude) => latitude < -38 && latitude > -52
    );
    expect(bandMean(windU, [...northTrades, ...southTrades])).toBeLessThan(-10);
    expect(bandMean(windU, [...northWesterlies, ...southWesterlies])).toBeGreaterThan(10);
    expect(bandMean(windV, northTrades)).toBeGreaterThan(2);
    expect(bandMean(windV, southTrades)).toBeLessThan(-2);
    expect(bandMean(windV, northWesterlies)).toBeLessThan(-1);
    expect(bandMean(windV, southWesterlies)).toBeGreaterThan(1);

    let peakAbsU = 0;
    let peakAbsV = 0;
    for (let y = 0; y < HEIGHT; y++) {
      peakAbsU = Math.max(peakAbsU, Math.abs(rowMean(windU, y)));
      peakAbsV = Math.max(peakAbsV, Math.abs(rowMean(windV, y)));
    }
    for (const y of rowsWhere(latitudeByRow, (latitude) => Math.abs(latitude) < 3)) {
      expect(Math.abs(rowMean(windV, y))).toBeLessThanOrEqual(0.25 * peakAbsV);
    }
    for (const y of rowsWhere(
      latitudeByRow,
      (latitude) =>
        Math.abs(Math.abs(latitude) - 30) < 3 || Math.abs(Math.abs(latitude) - 60) < 3
    )) {
      expect(Math.abs(rowMean(windU, y))).toBeGreaterThanOrEqual(0.5 * peakAbsU);
    }

    const northHadleyRows = rowsWhere(
      latitudeByRow,
      (latitude) => latitude > 3 && latitude < 29
    );
    const peakMeridionalRow = northHadleyRows.reduce((best, y) =>
      rowMean(windV, y) > rowMean(windV, best) ? y : best
    );
    expect(latitudeByRow[peakMeridionalRow] ?? 0).toBeGreaterThan(9);
    expect(latitudeByRow[peakMeridionalRow] ?? 0).toBeLessThan(21);

    let sumAbsU = 0;
    let sumAbsV = 0;
    for (let y = 0; y < HEIGHT; y++) {
      sumAbsU += Math.abs(rowMean(windU, y));
      sumAbsV += Math.abs(rowMean(windV, y));
    }
    expect(sumAbsU).toBeGreaterThan(4 * sumAbsV);
  });

  it("derives meridional orientation from either latitude-ramp direction", () => {
    const northUp = latitudeRamp();
    const northUpWind = runWind(northUp, BACKBONE_ONLY);
    const northUpTrades = rowsWhere(northUp, (latitude) => latitude > 8 && latitude < 22);
    expect(bandMean(northUpWind.windV, northUpTrades)).toBeGreaterThan(2);

    const southUp = latitudeRamp(
      TEST_MAP_LATITUDE_BOUNDS.bottomLatitude,
      TEST_MAP_LATITUDE_BOUNDS.topLatitude
    );
    const southUpWind = runWind(southUp, BACKBONE_ONLY);
    const southUpTrades = rowsWhere(southUp, (latitude) => latitude > 8 && latitude < 22);
    expect(bandMean(southUpWind.windV, southUpTrades)).toBeLessThan(-2);
    expect(bandMean(southUpWind.windU, southUpTrades)).toBeLessThan(-10);
  });

  it("structurally clamps the meridional backbone to 0.35 times zonal strength", () => {
    const latitudeByRow = latitudeRamp();
    const atCeiling = runWind(latitudeByRow, {
      ...BACKBONE_ONLY,
      meridionalStrength: 35,
    });
    const overdriven = runWind(latitudeByRow, {
      ...BACKBONE_ONLY,
      meridionalStrength: 200,
    });
    expect(overdriven).toEqual(atCeiling);
  });

  it("uses hemisphere and ramp orientation to set geostrophic chirality", () => {
    const latitudeByRow = latitudeRamp();
    const north = { x: Math.round(WIDTH / 3), y: rowForLatitude(latitudeByRow, 45) };
    const south = { x: Math.round((WIDTH * 2) / 3), y: rowForLatitude(latitudeByRow, -45) };
    const pressureField = pressureWithBlobs([north, south]);
    const pressureOnly = {
      ...BACKBONE_ONLY,
      zonalStrength: 0,
      meridionalStrength: 0,
      pressureDrivenRms: 60,
      smoothIters: 2,
    };
    const field = runWind(latitudeByRow, pressureOnly, { pressureField });

    const northSense = circulationSense(field, north);
    const southSense = circulationSense(field, south);
    expect(northSense).toBeGreaterThan(1);
    expect(southSense).toBeLessThan(-1);

    const reversedRamp = latitudeRamp(
      TEST_MAP_LATITUDE_BOUNDS.bottomLatitude,
      TEST_MAP_LATITUDE_BOUNDS.topLatitude
    );
    const reversedNorth = {
      x: north.x,
      y: rowForLatitude(reversedRamp, 45),
    };
    const reversed = runWind(reversedRamp, pressureOnly, {
      pressureField: pressureWithBlobs([reversedNorth]),
    });
    expect(circulationSense(reversed, reversedNorth)).toBeLessThan(-1);
  });

  it("blends to down-gradient flow at the equator", () => {
    const latitudeByRow = latitudeRamp();
    const center = { x: Math.round(WIDTH / 2), y: rowForLatitude(latitudeByRow, 0) };
    const pressureOnly = {
      ...BACKBONE_ONLY,
      zonalStrength: 0,
      meridionalStrength: 0,
      pressureDrivenRms: 60,
      smoothIters: 1,
    };
    const field = runWind(latitudeByRow, pressureOnly, {
      pressureField: pressureWithBlobs([center]),
    });

    let radial = 0;
    let tangential = 0;
    let count = 0;
    for (let y = 0; y < HEIGHT; y++) {
      if (Math.abs(latitudeByRow[y] ?? 0) > 5) continue;
      for (let x = 0; x < WIDTH; x++) {
        const rawDx = x - center.x;
        const dx =
          Math.abs(rawDx) <= WIDTH / 2 ? rawDx : rawDx - Math.sign(rawDx) * WIDTH;
        const dy = y - center.y;
        const distance = Math.hypot(dx, dy);
        if (distance < 2 || distance > 6) continue;
        const index = y * WIDTH + x;
        const u = field.windU[index] ?? 0;
        const v = field.windV[index] ?? 0;
        radial += Math.abs((dx * u + dy * v) / distance);
        tangential += Math.abs((dx * v - dy * u) / distance);
        count += 1;
      }
    }
    expect(count).toBeGreaterThan(0);
    expect(radial).toBeGreaterThan(tangential);
  });

  it("keeps supplied pressure anomalies from rewriting tropical row-mean circulation", () => {
    const latitudeByRow = latitudeRamp();
    const northTrades = rowsWhere(
      latitudeByRow,
      (latitude) => latitude > 8 && latitude < 22
    );
    const southTrades = rowsWhere(
      latitudeByRow,
      (latitude) => latitude < -8 && latitude > -22
    );

    for (const pressurePhase of PRESSURE_PHASES) {
      const field = runWind(latitudeByRow, HIGH_PRESSURE_RESPONSE_CONFIG, {
        pressureField: pressureWave(pressurePhase),
      });
      expect(bandMean(field.windV, northTrades)).toBeGreaterThan(1);
      expect(bandMean(field.windV, southTrades)).toBeLessThan(-1);
      expect(rowVariance(field.windV, rowForLatitude(latitudeByRow, 15))).toBeGreaterThan(0);
    }
  });

  it("suppresses complementary pressure anomalies under sample averaging while the backbone survives", () => {
    const latitudeByRow = latitudeRamp();
    const pressureResponsive = {
      ...BACKBONE_ONLY,
      pressureDrivenRms: 90,
      smoothIters: 3,
    };
    const samples = PRESSURE_PHASES.map((pressurePhase) =>
      runWind(latitudeByRow, pressureResponsive, {
        pressureField: pressureWave(pressurePhase, 60),
      })
    );
    const mean = meanFields(samples);

    expect(zonalDeviationRatio(mean)).toBeLessThan(
      zonalDeviationRatio(samples[0] ?? mean) * 0.75
    );
  });

  it("keeps the default analytic backbone inside its quantization envelope", () => {
    const field = runWind(latitudeRamp(), BACKBONE_ONLY);

    expect(magnitudeCeilingShare(field)).toBe(0);
  });

  it("bounds a controlled migrated-pressure stress average", () => {
    const samples = MIGRATED_LATITUDE_OFFSETS_DEG.map((latitudeOffsetDeg, sampleIndex) => {
      return runWind(
        latitudeRamp(
          TEST_MAP_LATITUDE_BOUNDS.topLatitude - latitudeOffsetDeg,
          TEST_MAP_LATITUDE_BOUNDS.bottomLatitude - latitudeOffsetDeg
        ),
        HIGH_PRESSURE_RESPONSE_CONFIG,
        { pressureField: pressureWave(PRESSURE_PHASES[sampleIndex]!, 60) }
      );
    });
    const mean = meanFields(samples);

    expect(magnitudeCeilingShare(mean)).toBeLessThanOrEqual(0.02);
  });

  it("caps an overdriven pressure perturbation against the backbone RMS", () => {
    const latitudeByRow = latitudeRamp();
    const pressureField = pressureWave(0, 400);
    const config = {
      ...BACKBONE_ONLY,
      maxSpeed: 127,
      zonalStrength: 80,
      meridionalStrength: 12,
      pressureDrivenRms: 400,
      smoothIters: 4,
    };
    const backbone = runWind(
      latitudeByRow,
      { ...config, pressureDrivenRms: 0 },
      { pressureField }
    );
    const overdriven = runWind(latitudeByRow, config, { pressureField });

    expect(vectorDifferenceRms(overdriven, backbone)).toBeLessThanOrEqual(vectorRms(backbone));
  });

  it("retains the three zonal band signs across migrated fields", () => {
    const polarSamplingOffsets = MIGRATED_LATITUDE_OFFSETS_DEG.filter(
      (latitudeOffsetDeg) => latitudeOffsetDeg !== 0
    );
    for (const [sampleIndex, latitudeOffsetDeg] of polarSamplingOffsets.entries()) {
      const latitudeByRow = latitudeRamp(
        TEST_MAP_LATITUDE_BOUNDS.topLatitude - latitudeOffsetDeg,
        TEST_MAP_LATITUDE_BOUNDS.bottomLatitude - latitudeOffsetDeg
      );
      const { windU } = runWind(latitudeByRow, HIGH_PRESSURE_RESPONSE_CONFIG, {
        pressureField: pressureWave(PRESSURE_PHASES[sampleIndex]!, 60),
      });
      const midBandRows = rowsWhere(
        latitudeByRow,
        (latitude) =>
          (Math.abs(latitude) > 8 && Math.abs(latitude) < 22) ||
          (Math.abs(latitude) > 38 && Math.abs(latitude) < 52) ||
          (Math.abs(latitude) > 63 && Math.abs(latitude) < 70)
      );

      for (const y of midBandRows) {
        const absoluteLatitude = Math.abs(latitudeByRow[y] ?? 0);
        const expectedSign = absoluteLatitude < 30 || absoluteLatitude >= 60 ? -1 : 1;
        expect(Math.sign(rowMean(windU, y))).toBe(expectedSign);
      }
    }
  });
});
