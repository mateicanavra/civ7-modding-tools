import { responseCalendar, responseMonthWeightsDays } from "./response-harmonics.js";

export const productionReplayPhases = Array.from({ length: 8 }, (_, index) => index / 8);

/** Recover annual/semiannual coefficients from eight actual unclipped operation samples. */
export function recoverProductionHarmonics(values: readonly number[]) {
  if (values.length !== productionReplayPhases.length || !values.every(Number.isFinite)) {
    throw new Error("Eight finite equinox-origin thermal samples are required.");
  }
  const fitted = [values.reduce((sum, value) => sum + value, 0) / values.length];
  for (const harmonic of [1, 2]) {
    fitted.push(values.reduce((sum, value, index) => sum + value * Math.cos(2 * Math.PI * harmonic * productionReplayPhases[index]!), 0) * 2 / values.length);
    fitted.push(values.reduce((sum, value, index) => sum + value * Math.sin(2 * Math.PI * harmonic * productionReplayPhases[index]!), 0) * 2 / values.length);
  }
  return fitted;
}

/** Integrate an equinox-origin response over the frozen Gregorian source-month windows. */
export function equinoxCalendarBasis() {
  const result = Array.from({ length: 12 }, () => [0, 0, 0, 0, 0]);
  for (const [yearDays, yearCount, february] of [[365, 22, 28], [366, 8, 29]] as const) {
    const origin = 2 * Math.PI * 0.5 / yearDays - responseCalendar.solarPhaseOffsetRadians;
    let start = 0;
    for (const [month, days] of [31, february, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31].entries()) {
      const end = start + days;
      const weight = yearCount * days / (30 * responseMonthWeightsDays[month]!);
      result[month]![0]! += weight;
      for (const harmonic of [1, 2]) {
        const omega = 2 * Math.PI * harmonic / yearDays;
        const angle = harmonic * origin;
        result[month]![2 * harmonic - 1]! += weight * (Math.sin(omega * end + angle) - Math.sin(omega * start + angle)) / (omega * days);
        result[month]![2 * harmonic]! += weight * (Math.cos(omega * start + angle) - Math.cos(omega * end + angle)) / (omega * days);
      }
      start = end;
    }
  }
  return result;
}
