import { dailyMeanSolar } from "./solar-geometry.js";

export type HarmonicCoefficients = readonly [number, number, number, number, number];
type MonthWindow = Readonly<{ month: number; startDay: number; endDay: number; yearDays: number; yearCount: number }>;

export const responseCalendar = {
  firstYear: 1991,
  lastYear: 2020,
  commonYears: 22,
  leapYears: 8,
  meanYearDays: 365 + 8 / 30,
  solarPhaseOffsetRadians: 1.39,
  axialTiltDegrees: 23.44,
  origin: "t=0 is January 1 00:00 of each Gregorian year; t is elapsed days",
  declination: "23.44*sin(2*pi*(t+0.5)/yearDays-1.39) degrees; Jan 1 noon has day number 1",
  alignment: "FAO day-number phase approximation, stretched over leap years; not a dated ephemeris or a fitted lag",
  averaging: "Each basis/forcing is integrated over actual monthly intervals, pooled by day over the 22 common and 8 leap years",
} as const;

function monthWindows(): MonthWindow[] {
  const windows: MonthWindow[] = [];
  for (const { yearDays, yearCount, february } of [
    { yearDays: 365, yearCount: 22, february: 28 },
    { yearDays: 366, yearCount: 8, february: 29 },
  ]) {
    let startDay = 0;
    for (const [month, days] of [31, february, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31].entries()) {
      windows.push({ month, startDay, endDay: startDay + days, yearDays, yearCount });
      startDay += days;
    }
  }
  return windows;
}

const windows = monthWindows();
export const responseMonthWeightsDays = Array.from({ length: 12 }, (_, month) =>
  windows.filter((window) => window.month === month)
    .reduce((sum, window) => sum + window.yearCount * (window.endDay - window.startDay), 0) / 30
);

/** Exact integral of the annual and semiannual basis over one monthly interval. */
export function integratedHarmonicBasis(startDay: number, endDay: number, yearDays: number): HarmonicCoefficients {
  if (![startDay, endDay, yearDays].every(Number.isFinite) || !(yearDays > 0) || !(endDay > startDay)) {
    throw new RangeError("A finite positive interval and year duration are required.");
  }
  const basis = [1];
  for (const harmonic of [1, 2]) {
    const angularFrequency = 2 * Math.PI * harmonic / yearDays;
    const normalization = angularFrequency * (endDay - startDay);
    basis.push((Math.sin(angularFrequency * endDay) - Math.sin(angularFrequency * startDay)) / normalization);
    basis.push((Math.cos(angularFrequency * startDay) - Math.cos(angularFrequency * endDay)) / normalization);
  }
  return basis as unknown as HarmonicCoefficients;
}

export const responseMonthlyBasis: readonly HarmonicCoefficients[] = Array.from({ length: 12 }, (_, month) => {
  const row = [0, 0, 0, 0, 0];
  for (const window of windows.filter((entry) => entry.month === month)) {
    const weight = window.yearCount * (window.endDay - window.startDay) / (30 * responseMonthWeightsDays[month]!);
    const basis = integratedHarmonicBasis(window.startDay, window.endDay, window.yearDays);
    for (let column = 0; column < 5; column++) row[column]! += weight * basis[column]!;
  }
  return row as unknown as HarmonicCoefficients;
});

/** Calendar-month means of daily-mean TOA q, integrated in seasonal time, not sampled at month centers. */
export function monthlySolarForcing(latitudeDegrees: number, subdivisionsPerDay = 4) {
  if (!Number.isInteger(subdivisionsPerDay) || subdivisionsPerDay < 1) throw new RangeError("Invalid quadrature subdivision count.");
  const result = new Array<number>(12).fill(0);
  for (const window of windows) {
    const count = (window.endDay - window.startDay) * subdivisionsPerDay;
    let total = 0;
    for (let index = 0; index < count; index++) {
      const time = window.startDay + (index + 0.5) / subdivisionsPerDay;
      const declination = responseCalendar.axialTiltDegrees * Math.sin(
        2 * Math.PI * (time + 0.5) / window.yearDays - responseCalendar.solarPhaseOffsetRadians
      );
      total += dailyMeanSolar(latitudeDegrees, declination).fluxOverSolarConstant;
    }
    result[window.month]! += total * window.yearCount / (subdivisionsPerDay * 30 * responseMonthWeightsDays[window.month]!);
  }
  return result;
}

export function weightedMonthlyMean(values: readonly number[]) {
  if (values.length !== 12 || !values.every(Number.isFinite)) throw new Error("Twelve finite monthly values are required.");
  return values.reduce((sum, value, month) => sum + value * responseMonthWeightsDays[month]!, 0) / responseCalendar.meanYearDays;
}

/** Five-column weighted QR: intercept plus annual and semiannual harmonic, with no physical model fit. */
export function fitMonthlyHarmonics(values: readonly number[]) {
  weightedMonthlyMean(values);
  const q: number[][] = [];
  const r = Array.from({ length: 5 }, () => new Array<number>(5).fill(0));
  for (let column = 0; column < 5; column++) {
    const vector = responseMonthlyBasis.map((row, month) => row[column]! * Math.sqrt(responseMonthWeightsDays[month]!));
    for (let previous = 0; previous < column; previous++) {
      const projection = vector.reduce((sum, value, month) => sum + value * q[previous]![month]!, 0);
      r[previous]![column] = projection;
      for (let month = 0; month < 12; month++) vector[month]! -= projection * q[previous]![month]!;
    }
    const norm = Math.hypot(...vector);
    if (!(norm > 1e-12)) throw new Error("Harmonic basis is rank deficient.");
    r[column]![column] = norm;
    q.push(vector.map((value) => value / norm));
  }
  const coefficients = q.map((column) => column.reduce((sum, value, month) =>
    sum + value * values[month]! * Math.sqrt(responseMonthWeightsDays[month]!), 0
  ));
  for (let row = 4; row >= 0; row--) {
    for (let column = row + 1; column < 5; column++) coefficients[row]! -= r[row]![column]! * coefficients[column]!;
    coefficients[row]! /= r[row]![row]!;
  }
  const fittedMonthly = responseMonthlyBasis.map((row) => row.reduce((sum, value, column) => sum + value * coefficients[column]!, 0));
  const residualRmse = Math.sqrt(weightedMonthlyMean(values.map((value, month) => (value - fittedMonthly[month]!) ** 2)));
  return { coefficients: coefficients as unknown as HarmonicCoefficients, fittedMonthly, residualRmse };
}

/** Complex transfer of tau*dT'/dt + T' = b*q', with tau in years and unit DC gain. */
export function storageOnlyTransfer(relaxationYears: number, harmonic: 1 | 2) {
  if (!Number.isFinite(relaxationYears) || relaxationYears < 0) throw new RangeError("Relaxation time must be finite and nonnegative.");
  const frequencyTime = 2 * Math.PI * harmonic * relaxationYears;
  const denominator = 1 + frequencyTime * frequencyTime;
  return {
    real: 1 / denominator,
    imaginary: -frequencyTime / denominator,
    gainRatio: 1 / Math.sqrt(denominator),
    lagRadians: Math.atan(frequencyTime),
  };
}

export const responseInterpretability = {
  minTemperatureAmplitudeC: 0.1,
  minSolarAmplitudeQ: 0.0001,
  meaning: "Declared lag-display guards, not uncertainty estimates or climate-acceptance targets; excluded amplitudes remain reported",
} as const;

export function harmonicResponse(
  temperature: HarmonicCoefficients,
  forcing: HarmonicCoefficients,
  geographicGainCPerQ: number,
  harmonic: 1 | 2
) {
  if (!(geographicGainCPerQ > 0) || !Number.isFinite(geographicGainCPerQ)) throw new RangeError("Positive finite geographic gain required.");
  const column = harmonic * 2 - 1;
  const tc = temperature[column]!;
  const ts = temperature[column + 1]!;
  const qc = forcing[column]!;
  const qs = forcing[column + 1]!;
  const temperatureAmplitudeC = Math.hypot(tc, ts);
  const solarAmplitudeQ = Math.hypot(qc, qs);
  const exclusions = [
    ...(temperatureAmplitudeC < responseInterpretability.minTemperatureAmplitudeC ? ["temperature-amplitude-below-guard"] : []),
    ...(solarAmplitudeQ < responseInterpretability.minSolarAmplitudeQ ? ["solar-amplitude-below-guard"] : []),
  ];
  const amplitudes = { harmonic, temperatureAmplitudeC, solarAmplitudeQ, exclusions };
  if (exclusions.length > 0) return { ...amplitudes, transfer: null };
  // Fourier convention: alpha*cos + beta*sin is the real part of (alpha-i*beta)*exp(i*omega*t).
  const denominator = geographicGainCPerQ * (qc * qc + qs * qs);
  const real = (tc * qc + ts * qs) / denominator;
  const imaginary = (tc * qs - ts * qc) / denominator;
  const gainRatio = Math.hypot(real, imaginary);
  const lagRadians = -Math.atan2(imaginary, real);
  return { ...amplitudes, transfer: {
    real, imaginary, gainRatio, lagRadians,
    lagDays: lagRadians * responseCalendar.meanYearDays / (2 * Math.PI * harmonic),
    storageOnlyGainAtObservedLag: Math.cos(lagRadians),
    gainMinusStoragePrediction: gainRatio - Math.cos(lagRadians),
    complexCircleResidual: real - gainRatio * gainRatio,
    passiveStoragePhase: lagRadians >= 0 && lagRadians < Math.PI / 2,
  } };
}
