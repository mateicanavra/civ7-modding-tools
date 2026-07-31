import { describe, expect, it } from "bun:test";

import hydrology from "../../../../../../src/domain/hydrology/router.js";
import {
  deriveTestOperationSeed,
  TEST_MAP_LATITUDE_BOUNDS,
  TEST_MAP_SIZE,
} from "../../../../../setup.js";

const { computePressureField } = hydrology.climate.ops;
const { width: WIDTH, height: HEIGHT } = TEST_MAP_SIZE.dimensions;
const SIZE = WIDTH * HEIGHT;
const OPERATION_SEED = deriveTestOperationSeed("test:hydrology:pressure-field");
const SEASON_SALTS = [0, 1].map((seasonIndex) =>
  deriveTestOperationSeed(`test:hydrology:pressure-field:season-${seasonIndex}`)
);
type PressureConfig = {
  scaffoldStrength: number;
  thermalAnomalyHpaPerC: number;
  stationaryThermalHpaPerC: number;
  transientScaleTiles: number;
  transientAmplitudeHpa: number;
  smoothIters: number;
};
const CONFIG = {
  scaffoldStrength: 1,
  thermalAnomalyHpaPerC: 0.55,
  stationaryThermalHpaPerC: 1.2,
  transientScaleTiles: 18,
  transientAmplitudeHpa: 0,
  smoothIters: 2,
} satisfies PressureConfig;

function latitudeRamp(
  topLatitude: number = TEST_MAP_LATITUDE_BOUNDS.topLatitude,
  bottomLatitude: number = TEST_MAP_LATITUDE_BOUNDS.bottomLatitude
): Float32Array {
  const latitudeByRow = new Float32Array(HEIGHT);
  for (let y = 0; y < HEIGHT; y++) {
    latitudeByRow[y] =
      topLatitude +
      (bottomLatitude - topLatitude) * (y / Math.max(1, HEIGHT - 1));
  }
  return latitudeByRow;
}

function uniformTemperature(value: number): Float32Array {
  return new Float32Array(SIZE).fill(value);
}

function runPressure(
  input: Readonly<{
    latitudeByRow: Float32Array;
    surfaceTemperatureC: Float32Array;
    meanSurfaceTemperatureC: Float32Array;
    landMask: Uint8Array;
    rngSeed?: number;
    seasonSalt?: number;
    transientPolarity?: -1 | 1;
  }>,
  config: PressureConfig = CONFIG
): Float32Array {
  return computePressureField.run(
    {
      width: WIDTH,
      height: HEIGHT,
      ...input,
      rngSeed: input.rngSeed ?? OPERATION_SEED,
    },
    { strategy: "thermal-continental", config }
  ).pressure;
}

function nearestRow(latitudeByRow: Float32Array, targetLatitudeDeg: number): number {
  let nearest = 0;
  for (let y = 1; y < HEIGHT; y++) {
    if (
      Math.abs((latitudeByRow[y] ?? 0) - targetLatitudeDeg) <
      Math.abs((latitudeByRow[nearest] ?? 0) - targetLatitudeDeg)
    ) {
      nearest = y;
    }
  }
  return nearest;
}

function rowMean(field: Float32Array, y: number): number {
  let sum = 0;
  for (let x = 0; x < WIDTH; x++) sum += field[y * WIDTH + x] ?? 0;
  return sum / Math.max(1, WIDTH);
}

function scaffoldInput(latitudeByRow: Float32Array) {
  return {
    latitudeByRow,
    surfaceTemperatureC: uniformTemperature(15),
    meanSurfaceTemperatureC: uniformTemperature(15),
    landMask: new Uint8Array(SIZE),
  };
}

describe("thermal-continental pressure", () => {
  it("orders the equatorial trough, subtropical ridge, subpolar low, and polar high", () => {
    // The polar-extrema contract needs a synthetic ramp beyond the shared +/-60 test frame.
    const latitudeByRow = latitudeRamp(80, -80);
    const pressure = runPressure(scaffoldInput(latitudeByRow));

    for (const sign of [1, -1] as const) {
      const trough = rowMean(pressure, nearestRow(latitudeByRow, 0));
      const ridge = rowMean(pressure, nearestRow(latitudeByRow, sign * 30));
      const subpolar = rowMean(pressure, nearestRow(latitudeByRow, sign * 60));
      const polar = rowMean(pressure, nearestRow(latitudeByRow, sign * 80));
      expect(ridge).toBeGreaterThan(trough);
      expect(ridge).toBeGreaterThan(subpolar);
      expect(polar).toBeGreaterThan(subpolar);
    }
  });

  it("mirrors the zonal scaffold across hemispheres", () => {
    const latitudeByRow = latitudeRamp(80, -80);
    const pressure = runPressure(scaffoldInput(latitudeByRow));

    for (const latitudeAbs of [15, 30, 45, 60, 75]) {
      const north = rowMean(pressure, nearestRow(latitudeByRow, latitudeAbs));
      const south = rowMean(pressure, nearestRow(latitudeByRow, -latitudeAbs));
      expect(north).toBeCloseTo(south, 4);
    }
  });

  it("makes warm-season land a low, cold-season land a high, and cancels both in phase mean", () => {
    const latitudeByRow = latitudeRamp();
    const landMask = new Uint8Array(SIZE).fill(1);
    const meanTemperature = uniformTemperature(15);
    const base = runPressure({
      latitudeByRow,
      surfaceTemperatureC: meanTemperature,
      meanSurfaceTemperatureC: meanTemperature,
      landMask,
    });
    const warm = runPressure({
      latitudeByRow,
      surfaceTemperatureC: uniformTemperature(25),
      meanSurfaceTemperatureC: meanTemperature,
      landMask,
    });
    const cold = runPressure({
      latitudeByRow,
      surfaceTemperatureC: uniformTemperature(5),
      meanSurfaceTemperatureC: meanTemperature,
      landMask,
    });
    const index = Math.floor(HEIGHT / 3) * WIDTH + Math.floor(WIDTH / 2);

    expect(warm[index]).toBeLessThan(base[index] ?? 0);
    expect(cold[index]).toBeGreaterThan(base[index] ?? 0);
    expect(((warm[index] ?? 0) + (cold[index] ?? 0)) / 2).toBeCloseTo(base[index] ?? 0, 5);
  });

  it("excludes seasonal ocean temperature from the land-anomaly term", () => {
    const latitudeByRow = latitudeRamp();
    const meanTemperature = uniformTemperature(15);
    const input = {
      latitudeByRow,
      meanSurfaceTemperatureC: meanTemperature,
      landMask: new Uint8Array(SIZE),
    };
    const base = runPressure({ ...input, surfaceTemperatureC: meanTemperature });
    const warmOcean = runPressure({
      ...input,
      surfaceTemperatureC: uniformTemperature(25),
    });

    expect(Array.from(warmOcean)).toEqual(Array.from(base));
  });

  it("places a stationary high over a cold zonal thermal anomaly", () => {
    const latitudeByRow = latitudeRamp();
    const meanTemperature = uniformTemperature(15);
    const landMask = new Uint8Array(SIZE).fill(1);
    const sampleRow = nearestRow(latitudeByRow, 45);
    for (let y = 0; y < HEIGHT; y++) {
      for (let x = 0; x < WIDTH / 2; x++) meanTemperature[y * WIDTH + x] = 10;
      for (let x = Math.ceil(WIDTH / 2); x < WIDTH; x++) {
        meanTemperature[y * WIDTH + x] = 20;
      }
    }
    const pressure = runPressure({
      latitudeByRow,
      surfaceTemperatureC: meanTemperature,
      meanSurfaceTemperatureC: meanTemperature,
      landMask,
    });
    const coldInterior = pressure[sampleRow * WIDTH + Math.floor(WIDTH / 4)] ?? 0;
    const warmInterior = pressure[sampleRow * WIDTH + Math.floor((WIDTH * 3) / 4)] ?? 0;

    expect(coldInterior).toBeGreaterThan(warmInterior);
  });

  it("produces deterministic transient pressure for the same seed and salt", () => {
    const latitudeByRow = latitudeRamp();
    const transientConfig = { ...CONFIG, transientAmplitudeHpa: 14 };
    const input = {
      ...scaffoldInput(latitudeByRow),
      rngSeed: OPERATION_SEED,
      seasonSalt: SEASON_SALTS[0],
    };

    expect(runPressure(input, transientConfig)).toEqual(runPressure(input, transientConfig));
  });

  it("produces an exact zero-mean pressure pair from one salt and opposite polarities", () => {
    const latitudeByRow = latitudeRamp();
    const transientConfig = {
      ...CONFIG,
      scaffoldStrength: 0,
      thermalAnomalyHpaPerC: 0,
      stationaryThermalHpaPerC: 0,
      transientAmplitudeHpa: 14,
      smoothIters: 0,
    };
    const input = {
      ...scaffoldInput(latitudeByRow),
      rngSeed: OPERATION_SEED,
      seasonSalt: SEASON_SALTS[0],
    };
    const positive = runPressure({ ...input, transientPolarity: 1 }, transientConfig);
    const negative = runPressure({ ...input, transientPolarity: -1 }, transientConfig);
    const implicitPositive = runPressure(input, transientConfig);
    const pairMean = new Float32Array(SIZE);

    expect(implicitPositive).toEqual(positive);
    expect(Array.from(positive).some((value) => value !== 0)).toBeTrue();
    for (let index = 0; index < SIZE; index++) {
      pairMean[index] = ((positive[index] ?? 0) + (negative[index] ?? 0)) / 2;
    }
    expect(pairMean).toEqual(new Float32Array(SIZE));
  });

  it("preserves seed entropy above the low byte in transient pressure", () => {
    const latitudeByRow = latitudeRamp();
    const transientConfig = { ...CONFIG, transientAmplitudeHpa: 14 };
    const seed = 10_000;
    const first = runPressure(
      { ...scaffoldInput(latitudeByRow), rngSeed: seed, seasonSalt: SEASON_SALTS[0] },
      transientConfig
    );
    const upperBitVariant = runPressure(
      { ...scaffoldInput(latitudeByRow), rngSeed: seed + 0x100, seasonSalt: SEASON_SALTS[0] },
      transientConfig
    );

    expect(upperBitVariant).not.toEqual(first);
  });

  it("decorrelates transient pressure by season salt", () => {
    const latitudeByRow = latitudeRamp();
    const transientConfig = { ...CONFIG, transientAmplitudeHpa: 14 };
    const first = runPressure(
      {
        ...scaffoldInput(latitudeByRow),
        rngSeed: OPERATION_SEED,
        seasonSalt: SEASON_SALTS[0],
      },
      transientConfig
    );
    const second = runPressure(
      {
        ...scaffoldInput(latitudeByRow),
        rngSeed: OPERATION_SEED,
        seasonSalt: SEASON_SALTS[1],
      },
      transientConfig
    );

    expect(second).not.toEqual(first);
  });
});
