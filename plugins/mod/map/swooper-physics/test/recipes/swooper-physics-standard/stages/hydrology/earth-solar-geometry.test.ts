import { describe, expect, it } from "bun:test";
import {
  dailyMeanSolar,
  declinationAtPhase,
  integrateDailySolar,
  integrateGlobalDailySolar,
  seasonalPhases,
  solarGeometrySource,
} from "../../fixtures/earth-thermal/solar-geometry.js";

describe("Earth daily-mean solar geometry reference (not production adoption)", () => {
  it("pins FAO provenance and qualifies equatorial, polar and equinox boundaries", () => {
    expect(solarGeometrySource.equations).toEqual([21, 25, 34]);
    expect(solarGeometrySource.sha256).toHaveLength(64);
    expect(seasonalPhases(4)).toEqual([0, 0.25, 0.5, 0.75]);
    expect(declinationAtPhase(0.25)).toBe(23.44);
    expect(declinationAtPhase(0.75)).toBe(-23.44);
    expect(dailyMeanSolar(0, 0)).toEqual({ fluxOverSolarConstant: 1 / Math.PI, daylightHours: 12 });
    for (const latitude of [-89.999, -66.56, -30, 0, 30, 66.56, 89.999]) {
      expect(dailyMeanSolar(latitude, 0).fluxOverSolarConstant).toBeCloseTo(Math.cos(latitude * Math.PI / 180) / Math.PI, 13);
      expect(dailyMeanSolar(latitude, 0).daylightHours).toBe(12);
    }
    for (const pole of [-90, 90]) {
      const summer = dailyMeanSolar(pole, Math.sign(pole) * 23.44);
      expect(summer.daylightHours).toBe(24);
      expect(summer.fluxOverSolarConstant).toBeCloseTo(Math.sin(23.44 * Math.PI / 180), 13);
      expect(dailyMeanSolar(pole, -Math.sign(pole) * 23.44)).toEqual({ fluxOverSolarConstant: 0, daylightHours: 0 });
      expect(dailyMeanSolar(pole, 0).fluxOverSolarConstant).toBeLessThan(1e-15);
    }
    for (const invalid of [NaN, Infinity, -Infinity, 90.001, -90.001]) {
      expect(() => dailyMeanSolar(invalid, 0)).toThrow(RangeError);
      expect(() => dailyMeanSolar(0, invalid)).toThrow(RangeError);
    }
  });

  it("agrees with independent hour-angle integration, including the polar-circle transitions", () => {
    for (const latitude of [-90, -89.999, -80, -66.560001, -66.56, -66.559999, -45, -15, 0, 15, 45, 66.559999, 66.56, 66.560001, 80, 89.999, 90]) {
      for (const declination of [-23.44, -11.72, 0, 11.72, 23.44]) {
        const value = dailyMeanSolar(latitude, declination);
        expect(Number.isFinite(value.fluxOverSolarConstant)).toBe(true);
        expect(value.fluxOverSolarConstant).toBeGreaterThanOrEqual(0);
        expect(value.daylightHours).toBeGreaterThanOrEqual(0);
        expect(value.daylightHours).toBeLessThanOrEqual(24);
        expect(Math.abs(value.fluxOverSolarConstant - integrateDailySolar(latitude, declination))).toBeLessThan(2e-9);
      }
    }
  });

  it("conserves global incident power at one quarter at every tested declination", () => {
    for (const declination of [-90, -70, -23.44, -8, 0, 8, 23.44, 70, 90]) {
      expect(Math.abs(integrateGlobalDailySolar(declination) - 0.25)).toBeLessThan(3e-8);
    }
  });

  it("preserves antipodal illumination and hemisphere/season symmetries", () => {
    for (const latitude of [-90, -80, -66.56, -45, -15, 0, 15, 45, 66.56, 80, 90]) {
      for (const declination of [-23.44, -9, 0, 9, 23.44]) {
        const north = dailyMeanSolar(latitude, declination);
        const south = dailyMeanSolar(-latitude, declination);
        const reflected = dailyMeanSolar(-latitude, -declination);
        expect(north.fluxOverSolarConstant).toBeCloseTo(reflected.fluxOverSolarConstant, 13);
        expect(north.daylightHours).toBeCloseTo(reflected.daylightHours, 10);
        expect(north.daylightHours + south.daylightHours).toBeCloseTo(24, 10);
        expect(north.fluxOverSolarConstant - south.fluxOverSolarConstant).toBeCloseTo(
          Math.sin(latitude * Math.PI / 180) * Math.sin(declination * Math.PI / 180), 13
        );
      }
    }
  });

  it("distinguishes equal noon zenith angles with different day lengths", () => {
    // Both have latitude minus declination zero; shifting the old curve conflates them.
    const equinox = dailyMeanSolar(0, 0);
    const solstice = dailyMeanSolar(23.44, 23.44);
    expect(solstice.daylightHours).toBeGreaterThan(equinox.daylightHours);
    expect(solstice.fluxOverSolarConstant).toBeGreaterThan(equinox.fluxOverSolarConstant);
    expect(dailyMeanSolar(80, -23.44).fluxOverSolarConstant).toBe(0);
  });
});
