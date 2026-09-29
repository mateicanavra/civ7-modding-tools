import { describe, expect, it } from "bun:test";
import { earthThermalReference as reference } from "../../fixtures/earth-thermal/reference.js";
import {
  dailyMeanSolar,
  declinationAtPhase,
  integrateDailySolar,
  integrateGlobalDailySolar,
  seasonalPhases,
  solarGeometrySource,
} from "../../fixtures/earth-thermal/solar-geometry.js";
import {
  buildSolarForcing,
  evaluateSolarCase,
  fitSolarAnnual,
  runSolarStudy,
} from "../../fixtures/earth-thermal/solar-study.js";

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

describe("Earth annual calibration versus seasonal geometry discriminator", () => {
  it("does not fit holdout responses or a seasonal amplitude", () => {
    const forcing = buildSolarForcing("daily-mean-toa", 48);
    const fitted = fitSolarAnnual(forcing);
    const changedHoldout = reference.samples.map((sample) => sample.split === "holdout"
      ? { ...sample, annualAirTemperatureC: sample.annualAirTemperatureC + 1000,
        monthlyAirTemperatureRangeC: sample.monthlyAirTemperatureRangeC + 1000 }
      : { ...sample, monthlyAirTemperatureRangeC: sample.monthlyAirTemperatureRangeC + 1000 });
    expect(fitSolarAnnual(forcing, changedHoldout)).toEqual(fitted);
    const scaledWeights = reference.samples.map((sample) => ({ ...sample, areaWeight: sample.areaWeight * 7 }));
    const scaled = fitSolarAnnual(forcing, scaledWeights);
    expect(scaled.interceptC).toBeCloseTo(fitted.interceptC, 10);
    expect(scaled.gainC).toBeCloseTo(fitted.gainC, 10);
    const constant = [new Float64Array(reference.samples.length).fill(1)];
    expect(() => fitSolarAnnual(constant)).toThrow(/variance/);
  });

  it("recovers a known affine law using the frozen training cohort", () => {
    const forcing = buildSolarForcing("daily-mean-toa", 4);
    const known = reference.samples.map((sample, index) => ({
      ...sample,
      annualAirTemperatureC: -25 + 140 * forcing.reduce((sum, field) => sum + field[index]!, 0) / forcing.length,
    }));
    const fit = fitSolarAnnual(forcing, known);
    expect(fit.interceptC).toBeCloseTo(-25, 11);
    expect(fit.gainC).toBeCloseTo(140, 10);
  });

  it("replays original forcing/clipping and all fits through the admitted production operations", () => {
    for (const result of runSolarStudy()) {
      expect(result.cohorts.train!.unclipped.count).toBe(196);
      expect(result.cohorts.holdout!.unclipped.count).toBe(215);
      expect(result.numericalParity.forcingMaxAbsoluteError).toBeLessThan(2e-7);
      expect(result.numericalParity.thermalMaxAbsoluteErrorC).toBeLessThan(0.00002);
      if (result.fitted) expect(Math.abs(result.cohorts.train!.unclipped.biasC)).toBeLessThan(1e-10);
      if (!result.fitted) {
        expect(result.cohorts.all!.clipped.rmseC).toBeCloseTo(16.769517771418894, 4);
        expect(result.cohorts.all!.clipping.highPhaseAreaFraction).toBeGreaterThan(0);
        expect(result.cohorts.all!.unclipped.rmseC).toBeGreaterThan(result.cohorts.all!.clipped.rmseC);
      }
      expect(result.samples.every((sample) => sample.phaseClippedC.every((value) => value >= -40 && value <= 50))).toBe(true);
    }
  });

  it("exposes phase-density sensitivity without disguising it as monthly climatology", () => {
    const shifted = evaluateSolarCase("shifted-curve", 4);
    const daily4 = evaluateSolarCase("daily-mean-toa", 4);
    const daily48 = evaluateSolarCase("daily-mean-toa", 48);
    const daily384 = evaluateSolarCase("daily-mean-toa", 384);
    expect(shifted.bands[0]!.clippedPhaseRangeC).toBeCloseTo(12.272106190929465, 4);
    expect(daily4.bands[0]!.clippedPhaseRangeC).toBeLessThan(shifted.bands[0]!.clippedPhaseRangeC);
    expect(daily384.bands[0]!.referenceMonthlyRangeC).toBeCloseTo(3.2777380996719816, 8);
    expect(daily384.bands[0]!.clippedPhaseRangeC).toBeGreaterThan(daily384.bands[0]!.referenceMonthlyRangeC);
    // Frozen diagnostic values are reproducibility evidence, not climate acceptance targets.
    expect(daily384.cohorts.train!.unclipped.rmseC).toBeCloseTo(2.5137835145323186, 8);
    expect(daily384.cohorts.holdout!.unclipped.rmseC).toBeCloseTo(2.971039240208174, 8);
    expect(daily384.bands[0]!.unclippedPhaseRangeC).toBeCloseTo(11.14201778924753, 8);
    expect(daily384.bands[4]!.unclippedPhaseRangeC).toBeCloseTo(74.43300372665131, 8);
    expect(Math.abs(daily48.fit.gainC - daily384.fit.gainC)).toBeLessThan(0.01);
    expect(Math.abs(daily48.cohorts.holdout!.unclipped.rmseC - daily384.cohorts.holdout!.unclipped.rmseC)).toBeLessThan(0.001);
  });
});
