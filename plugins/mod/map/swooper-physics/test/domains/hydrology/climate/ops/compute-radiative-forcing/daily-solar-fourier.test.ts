import { describe, expect, it } from "bun:test";
import { runAdmittedOperationForTest } from "@swooper/mapgen-core/testing";
import hydrology from "../../../../../../src/domain/hydrology/router.js";

const { computeRadiativeForcing: operation } = hydrology.climate.ops;
const periodic = { strategy: "daily-solar-fourier", config: {} } as const;

// Test-owned sunset-angle oracle, independent of the operation's sunrise branch implementation.
function dailySolarOracle(latitude: number, declination: number) {
  const lat = (latitude * Math.PI) / 180;
  const dec = (declination * Math.PI) / 180;
  if (Math.abs(latitude) === 90) return Math.max(0, Math.sign(latitude) * Math.sin(dec));
  if (Math.abs(declination) === 90) return Math.max(0, Math.sin(lat) * Math.sign(declination));
  const sunset = Math.acos(Math.max(-1, Math.min(1, -Math.tan(lat) * Math.tan(dec))));
  return Math.max(
    0,
    (sunset * Math.sin(lat) * Math.sin(dec) + Math.cos(lat) * Math.cos(dec) * Math.sin(sunset)) /
      Math.PI
  );
}

function hourlySolarOracle(latitude: number, declination: number) {
  const lat = (latitude * Math.PI) / 180;
  const dec = (declination * Math.PI) / 180;
  let sum = 0;
  for (let hour = 0; hour < 2048; hour++) {
    sum += Math.max(
      0,
      Math.sin(lat) * Math.sin(dec) +
        Math.cos(lat) * Math.cos(dec) * Math.cos((2 * Math.PI * (hour + 0.5)) / 2048)
    );
  }
  return sum / 2048;
}

function solarOracle(latitude: number, tilt: number, count: number, daily = dailySolarOracle) {
  const sums = [0, 0, 0, 0, 0];
  for (let sample = 0; sample < count; sample++) {
    const angle = (2 * Math.PI * (sample + 0.5)) / count;
    const value = daily(latitude, tilt * Math.sin(angle));
    const basis = [
      1,
      2 * Math.cos(angle),
      2 * Math.sin(angle),
      2 * Math.cos(2 * angle),
      2 * Math.sin(2 * angle),
    ];
    for (let field = 0; field < sums.length; field++)
      sums[field]! += (value * basis[field]!) / count;
  }
  return sums;
}

function run(latitudes: readonly number[], axialTiltDeg: number) {
  const input = {
    model: "daily-solar-fourier" as const,
    width: 3,
    height: latitudes.length,
    latitudeByRow: Float32Array.from(latitudes),
    axialTiltDeg,
  };
  const before = input.latitudeByRow.slice();
  const result = runAdmittedOperationForTest(operation, input, periodic);
  expect(input.latitudeByRow).toEqual(before);
  if (result.model !== "daily-solar-fourier") throw new Error("Expected daily solar result.");
  return result;
}

describe("daily solar geometry and Fourier forcing", () => {
  it("retains the declared legacy default and exact latitude arithmetic", () => {
    expect(operation.defaultConfig.strategy).toBe("latitude-insolation");
    const latitudeByRow = new Float32Array([0, 30, -60, 90]);
    const result = runAdmittedOperationForTest(
      operation,
      { model: "latitude-insolation", width: 2, height: 4, latitudeByRow },
      operation.defaultConfig
    );
    if (result.model !== "latitude-insolation") throw new Error("Expected legacy forcing.");
    const config = operation.defaultConfig.config;
    const expected = Float32Array.from(
      Array.from(latitudeByRow).flatMap((latitude) => {
        const curve = Math.pow(
          Math.max(0, Math.min(1, Math.abs(latitude) / 90)),
          Math.max(0.0001, config.latitudeExponent)
        );
        const value = config.equatorInsolation * (1 - curve) + config.poleInsolation * curve;
        return [value, value];
      })
    );
    expect(result.insolation).toEqual(expected);
    expect(() =>
      operation.run({ model: "latitude-insolation", width: 2, height: 4, latitudeByRow }, periodic)
    ).toThrow(/matching input model/);
    expect(() =>
      operation.run(
        { model: "daily-solar-fourier", width: 2, height: 4, latitudeByRow, axialTiltDeg: 23.44 },
        operation.defaultConfig
      )
    ).toThrow(/matching input model/);
  });

  it("handles equinox and polar day/night against an independent hourly integral", () => {
    const latitudes = [-90, -30, 0, 30, 90];
    const equinox = run(latitudes, 0);
    for (const [row, latitude] of latitudes.entries()) {
      expect(equinox.solarByRow[row]!.meanQ).toBeCloseTo(
        Math.cos((latitude * Math.PI) / 180) / Math.PI,
        14
      );
    }
    for (const tilt of [23.44, 90]) {
      const actual = run(latitudes, tilt);
      for (const [row, latitude] of latitudes.entries()) {
        const reference = solarOracle(latitude, tilt, 384, hourlySolarOracle);
        for (const [field, value] of Object.values(actual.solarByRow[row]!).entries()) {
          expect(Math.abs(value - reference[field]!)).toBeLessThan(3e-7);
        }
      }
    }
  });

  it("has a global equal-area annual mean of one quarter at Earth and non-Earth tilt", () => {
    const latitudes = Array.from(
      { length: 8192 },
      (_, row) => (Math.asin(-1 + (2 * (row + 0.5)) / 8192) * 180) / Math.PI
    );
    for (const tilt of [0, 23.44, 45, 90]) {
      const actual = run(latitudes, tilt);
      const globalMean =
        actual.solarByRow.reduce((sum, row) => sum + row.meanQ, 0) / latitudes.length;
      expect(Math.abs(globalMean - 0.25)).toBeLessThan(3e-7);
    }
  });

  it("preserves phase signs, hemispheric reversal, exact zero tilt and repeatability", () => {
    const first = run([-90, -60, 0, 60, 90], 23.44);
    expect(run([-90, -60, 0, 60, 90], 23.44)).toEqual(first);
    expect(first.phaseOrigin).toBe("northward-equinox");
    const north = first.solarByRow[3]!,
      south = first.solarByRow[1]!;
    expect(north.sin1Q).toBeGreaterThan(0);
    expect(north.meanQ).toBeCloseTo(south.meanQ, 13);
    expect(north.sin1Q).toBeCloseTo(-south.sin1Q, 13);
    expect(north.cos2Q).toBeCloseTo(south.cos2Q, 13);
    expect(Math.abs(north.cos1Q)).toBeLessThan(1e-15);
    expect(Math.abs(north.sin2Q)).toBeLessThan(1e-15);
    for (const [index, coefficients] of run([-90, -60, 0, 60, 90], 0).solarByRow.entries()) {
      expect(coefficients.meanQ).toBeCloseTo(
        dailySolarOracle([-90, -60, 0, 60, 90][index]!, 0),
        14
      );
      expect({ ...coefficients, meanQ: 0 }).toEqual({
        meanQ: 0,
        cos1Q: 0,
        sin1Q: 0,
        cos2Q: 0,
        sin2Q: 0,
      });
    }
  });

  it("qualifies the public 384-point result against independent 192/768/dense quadrature", () => {
    const errors = new Map([192, 384, 768].map((count) => [count, 0]));
    for (const tilt of [0, 23.44, 60, 90]) {
      const latitudes = [-90, -75, -60, -30, 0, 30, 60, 75, 90];
      const actual = run(latitudes, tilt);
      for (const [row, latitude] of latitudes.entries()) {
        const reference = solarOracle(latitude, tilt, 12288);
        const actualValues = Object.values(actual.solarByRow[row]!);
        const expected384 = solarOracle(latitude, tilt, 384);
        for (const [field, value] of actualValues.entries()) {
          expect(value).toBeCloseTo(expected384[field]!, 13);
        }
        for (const count of [192, 384, 768]) {
          // Only 384 is production output; the other resolutions are test-owned convergence witnesses.
          const values = count === 384 ? actualValues : solarOracle(latitude, tilt, count);
          errors.set(
            count,
            Math.max(
              errors.get(count)!,
              ...values.map((value, field) => Math.abs(value - reference[field]!))
            )
          );
        }
      }
    }
    expect(errors.get(384)!).toBeLessThan(0.00004);
    expect(errors.get(768)!).toBeLessThan(errors.get(384)!);
    expect(errors.get(384)!).toBeLessThan(errors.get(192)!);
  });

  it("refuses invalid true latitude and malformed grid registration", () => {
    expect(() => run([91], 23.44)).toThrow(/Latitude/);
    expect(() => run([Number.NaN], 23.44)).toThrow();
    expect(() => run([45], 91)).toThrow();
    expect(() =>
      operation.run(
        {
          model: "daily-solar-fourier",
          width: 1,
          height: 2,
          latitudeByRow: new Float32Array([0]),
          axialTiltDeg: 23.44,
        },
        periodic
      )
    ).toThrow(/input admission/);
  });
});
