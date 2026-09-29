import { describe, expect, it } from "bun:test";
import { earthMonthlyThermalReference as reference } from "../../fixtures/earth-thermal/monthly-reference.js";
import {
  fitMonthlyHarmonics,
  harmonicResponse,
  integratedHarmonicBasis,
  monthlySolarForcing,
  responseCalendar,
  responseMonthlyBasis,
  responseMonthWeightsDays,
  storageOnlyTransfer,
  weightedMonthlyMean,
  type HarmonicCoefficients,
} from "../../fixtures/earth-thermal/response-harmonics.js";
import {
  fitResponseModels,
  prepareResponseSamples,
  runResponseStudy,
} from "../../fixtures/earth-thermal/response-study.js";

const samples = prepareResponseSamples();
const study = runResponseStudy(samples);

describe("Earth calendar-month harmonic response reference", () => {
  it("retains Gregorian source month weights without interpreting synthetic source years as solar dates", () => {
    expect(responseMonthWeightsDays).toEqual(reference.period.monthWeightsDays);
    expect(responseMonthWeightsDays.reduce((sum, days) => sum + days, 0)).toBeCloseTo(responseCalendar.meanYearDays, 12);
    expect(responseCalendar.commonYears + responseCalendar.leapYears).toBe(30);
    for (let column = 1; column < 5; column++) {
      expect(Math.abs(weightedMonthlyMean(responseMonthlyBasis.map((basis) => basis[column]!)))).toBeLessThan(1e-15);
    }
  });

  it("qualifies exact monthly harmonic integrals against independent dense midpoint quadrature", () => {
    for (const [start, end, year] of [[0, 31, 365], [31, 60, 366], [334, 365, 365]]) {
      const actual = integratedHarmonicBasis(start!, end!, year!);
      for (const harmonic of [1, 2]) {
        let cosine = 0;
        let sine = 0;
        const points = 32768;
        for (let index = 0; index < points; index++) {
          const phase = 2 * Math.PI * harmonic * (start! + (index + 0.5) * (end! - start!) / points) / year!;
          cosine += Math.cos(phase) / points;
          sine += Math.sin(phase) / points;
        }
        expect(actual[2 * harmonic - 1]!).toBeCloseTo(cosine, 9);
        expect(actual[2 * harmonic]!).toBeCloseTo(sine, 9);
      }
    }
    // Monthly averaging attenuates a harmonic; a month-center sample is not the same oracle.
    expect(integratedHarmonicBasis(0, 31, 365)[3]).not.toBeCloseTo(Math.cos(4 * Math.PI * 15.5 / 365), 3);
  });

  it("recovers annual and semiannual coefficients from monthly averages with no aliasing between them", () => {
    const coefficients: HarmonicCoefficients = [-12, 10, -2, 3, 4];
    const months = responseMonthlyBasis.map((basis) => basis.reduce((sum, value, column) => sum + value * coefficients[column]!, 0));
    const fitted = fitMonthlyHarmonics(months);
    fitted.coefficients.forEach((value, index) => expect(value).toBeCloseTo(coefficients[index]!, 11));
    expect(fitted.residualRmse).toBeLessThan(1e-12);
    expect(weightedMonthlyMean(months)).toBeCloseTo(coefficients[0], 12);
    const constant = fitMonthlyHarmonics(new Array<number>(12).fill(18));
    expect(constant.coefficients[0]).toBeCloseTo(18, 12);
    expect(Math.hypot(...constant.coefficients.slice(1))).toBeLessThan(1e-12);
    expect(() => fitMonthlyHarmonics([1, 2, 3])).toThrow(/Twelve/);
    expect(() => fitMonthlyHarmonics(new Array<number>(12).fill(NaN))).toThrow(/Twelve/);
  });

  it("converges the monthly solar quadrature independently of any temperature acceptance threshold", () => {
    const latitudes = [...new Set(reference.samples.map((sample) => sample.latitudeDegrees))];
    for (const latitude of latitudes) {
      const coarse = monthlySolarForcing(latitude, 4);
      const fine = monthlySolarForcing(latitude, 8);
      // This q-space integration budget is under 0.0001 C at the diagnostic geographic gain.
      coarse.forEach((value, month) => expect(Math.abs(value - fine[month]!)).toBeLessThan(3e-7));
    }
    const equator = fitMonthlyHarmonics(monthlySolarForcing(0));
    expect(Math.hypot(equator.coefficients[1], equator.coefficients[2])).toBeLessThan(0.0001);
    expect(Math.hypot(equator.coefficients[3], equator.coefficients[4])).toBeGreaterThan(0.01);
  });
});

describe("Storage-only conditional null versus identifiable periodic proxy", () => {
  it("enforces the amplitude-lag relation for both harmonics in independently constructed storage responses", () => {
    for (const tau of [0, 0.02, 0.1, 0.5, 2]) {
      for (const harmonic of [1, 2] as const) {
        const transfer = storageOnlyTransfer(tau, harmonic);
        expect(transfer.gainRatio).toBeCloseTo(Math.cos(transfer.lagRadians), 13);
        expect(transfer.real - transfer.real ** 2 - transfer.imaginary ** 2).toBeCloseTo(0, 13);
        const q = [0.25, 0, 0, 0, 0];
        const t = [15, 0, 0, 0, 0];
        q[2 * harmonic - 1] = 0.15;
        q[2 * harmonic] = 0.08;
        t[2 * harmonic - 1] = 200 * (0.15 * transfer.real + 0.08 * transfer.imaginary);
        t[2 * harmonic] = 200 * (0.08 * transfer.real - 0.15 * transfer.imaginary);
        const observed = harmonicResponse(t as unknown as HarmonicCoefficients, q as unknown as HarmonicCoefficients, 200, harmonic);
        expect(observed.transfer!.gainRatio).toBeCloseTo(transfer.gainRatio, 12);
        expect(observed.transfer!.lagRadians).toBeCloseTo(transfer.lagRadians, 12);
        expect(observed.transfer!.gainMinusStoragePrediction).toBeCloseTo(0, 12);
      }
    }
  });

  it("does not manufacture lag from near-zero harmonics or conflate amplitude-only damping with storage", () => {
    const q: HarmonicCoefficients = [0.25, 0, 0, 0.02, 0];
    const t: HarmonicCoefficients = [20, 0, 0, 2, 0];
    expect(harmonicResponse(t, q, 200, 1).transfer).toBeNull();
    expect(harmonicResponse(t, q, 200, 1).exclusions).toHaveLength(2);
    const damped = harmonicResponse(t, q, 200, 2).transfer!;
    expect(damped.gainRatio).toBe(0.5);
    expect(damped.lagRadians).toBeCloseTo(0, 12);
    expect(damped.gainMinusStoragePrediction).toBe(-0.5);
  });

  it("recovers known complex responses and never fits held-out responses", () => {
    const known = samples.map((sample) => ({
      ...sample,
      annualAirTemperatureC: -25 + 150 * sample.forcingAnnual,
      temperature: { ...sample.temperature, coefficients: [
        12,
        80 * sample.forcing.coefficients[1] - 30 * sample.forcing.coefficients[2],
        80 * sample.forcing.coefficients[2] + 30 * sample.forcing.coefficients[1],
        20 * sample.forcing.coefficients[3] - 40 * sample.forcing.coefficients[4],
        20 * sample.forcing.coefficients[4] + 40 * sample.forcing.coefficients[3],
      ] as HarmonicCoefficients },
    }));
    const fit = fitResponseModels(known);
    expect(fit.geographic.interceptC).toBeCloseTo(-25, 10);
    expect(fit.geographic.gainCPerQ).toBeCloseTo(150, 10);
    expect(fit.periodic[0]!.real).toBeCloseTo(80, 10);
    expect(fit.periodic[0]!.imaginary).toBeCloseTo(-30, 10);
    expect(fit.periodic[1]!.real).toBeCloseTo(20, 10);
    expect(fit.periodic[1]!.imaginary).toBeCloseTo(-40, 10);
    const changed = known.map((sample) => sample.split === "train" ? sample : ({
      ...sample, annualAirTemperatureC: 9999,
      temperature: { ...sample.temperature, coefficients: [999, 999, 999, 999, 999] as HarmonicCoefficients },
    }));
    expect(fitResponseModels(changed)).toEqual(fit);
  });

  it("recovers an independently constructed shared storage timescale using both harmonics", () => {
    const tauYears = 0.08;
    const known = samples.map((sample) => {
      const coefficients = [12];
      for (const harmonic of [1, 2] as const) {
        const frequencyTime = 2 * Math.PI * harmonic * tauYears;
        const real = 1 / (1 + frequencyTime ** 2);
        const imaginary = -frequencyTime / (1 + frequencyTime ** 2);
        const cosine = sample.forcing.coefficients[2 * harmonic - 1]!;
        const sine = sample.forcing.coefficients[2 * harmonic]!;
        coefficients.push(150 * (real * cosine + imaginary * sine));
        coefficients.push(150 * (real * sine - imaginary * cosine));
      }
      return { ...sample, annualAirTemperatureC: -25 + 150 * sample.forcingAnnual,
        temperature: { ...sample.temperature, coefficients: coefficients as unknown as HarmonicCoefficients } };
    });
    const fitted = fitResponseModels(known);
    expect(fitted.storageOnly.relaxationYears).toBeCloseTo(tauYears, 10);
    expect(fitted.storageOnly.trainingHarmonicSquaredErrorC2).toBeLessThan(1e-16);
    expect(fitted.storageOnly.atInfiniteRelaxationLimit).toBe(false);
  });

  it("replays frozen source results as numerical evidence, not empirical acceptance quotas", () => {
    expect(study.cohortErrors.map(({ count }) => count)).toEqual([196, 215, 411]);
    expect(study.models.geographic.gainCPerQ).toBeCloseTo(206.8113096845454, 8);
    expect(study.models.periodic[0]!.real).toBeCloseTo(87.41575475075993, 8);
    expect(study.models.periodic[0]!.imaginary).toBeCloseTo(-43.89492826435499, 8);
    const holdout = study.cohortErrors.find(({ split }) => split === "holdout")!;
    expect(holdout.modelErrors.map(({ monthlyRmseC }) => Number(monthlyRmseC.toFixed(6))))
      .toEqual([13.251331, 7.063439, 3.57295]);
    const band = study.harmonicBands.find(({ absoluteLatitudeBand, harmonic }) => absoluteLatitudeBand[0] === 45 && harmonic === 1)!;
    expect(band.meanGainRatio!).toBeCloseTo(0.5018710808403226, 8);
    expect(band.meanStorageGainAtObservedLag!).toBeCloseTo(0.899422490405823, 8);
    expect(band.circularMeanLagDays!).toBeCloseTo(26.15999052040141, 8);
    expect(study.harmonicBands.filter(({ harmonic }) => harmonic === 2).reduce((sum, band) => sum + band.excludedCount, 0)).toBe(14);
    const holdoutBands = study.monthlyBandErrors.filter(({ split }) => split === "holdout");
    expect(holdoutBands.map(({ count }) => count)).toEqual([0, 33, 0, 182, 0]);
    for (const band of holdoutBands.filter(({ count }) => count === 0)) {
      expect(band.modelErrors.every(({ monthlyRmseC }) => monthlyRmseC === null)).toBe(true);
    }
  });

  it("preserves the independently fitted annual mean across all temporal response hypotheses", () => {
    for (const cohort of study.cohortErrors) {
      const annual = cohort.modelErrors[0]!.annualRmseC;
      for (const model of cohort.modelErrors) expect(model.annualRmseC).toBeCloseTo(annual, 12);
    }
    for (const sample of study.samples) {
      for (const months of Object.values(sample.predictions)) {
        expect(months.every(Number.isFinite)).toBe(true);
        expect(weightedMonthlyMean(months)).toBeCloseTo(
          study.models.geographic.interceptC + study.models.geographic.gainCPerQ * sample.forcingAnnual, 10
        );
      }
    }
  });
});
