import { runAdmittedOperationForTest } from "@swooper/mapgen-core/testing";
import hydrology from "../../../../../src/domain/hydrology/router.js";
import { responseCalendar, responseMonthlyBasis, weightedMonthlyMean } from "./response-harmonics.js";
import { equinoxCalendarBasis, productionReplayPhases as phases, recoverProductionHarmonics } from "./production-harmonics.js";
import { fitResponseModels, predictResponseMonths, prepareResponseSamples } from "./response-study.js";

type Harmonics = Readonly<{ meanQ: number; cos1Q: number; sin1Q: number; cos2Q: number; sin2Q: number }>;

/** Recover the five response coefficients from actual unclipped operation samples, not its private rules. */
function productionCoefficients(solarByRow: readonly Harmonics[]) {
  const height = solarByRow.length;
  const result = runAdmittedOperationForTest(hydrology.climate.ops.computeThermalState, {
    model: "periodic-response", width: 1, height, solarByRow: [...solarByRow],
    phases, weights: phases.map(() => 1 / phases.length),
    elevation: new Int16Array(height), seaLevel: 0,
    landMask: new Uint8Array(height).fill(1), sstC: new Float32Array(height),
  }, {
    strategy: "periodic-response",
    config: { annualOffsetC: 0, lapseRateCPerElevationUnit: 0, minC: -120, maxC: 120 },
  });
  if (result.model !== "periodic-response") throw new Error("Expected the admitted periodic response.");
  const coefficients = solarByRow.map((_, row) => {
    const values = result.samples.map((sample) => sample.surfaceTemperatureC[row]!);
    return recoverProductionHarmonics(values);
  });
  return { coefficients, annual: result.annualSurfaceTemperatureC };
}

/** No coefficients are fitted for production; the existing test-only fit supplies an independent replay oracle. */
export function replayProductionThermalReference() {
  const samples = prepareResponseSamples();
  const oracle = fitResponseModels(samples);
  const replayOrigin = 2 * Math.PI * 0.5 / responseCalendar.meanYearDays - responseCalendar.solarPhaseOffsetRadians;
  const frozenForcing = samples.map((sample) => {
    const rotated = [sample.forcingAnnual];
    for (const harmonic of [1, 2]) {
      const angle = harmonic * replayOrigin;
      const cosine = sample.forcing.coefficients[2 * harmonic - 1]!;
      const sine = sample.forcing.coefficients[2 * harmonic]!;
      rotated.push(cosine * Math.cos(angle) - sine * Math.sin(angle));
      rotated.push(cosine * Math.sin(angle) + sine * Math.cos(angle));
    }
    return { meanQ: rotated[0]!, cos1Q: rotated[1]!, sin1Q: rotated[2]!, cos2Q: rotated[3]!, sin2Q: rotated[4]! };
  });
  // Rotate the frozen representation and its integration basis together; this
  // changes phase origin, not its monthly forcing projection or any fitted gain.
  const replayBasis = responseMonthlyBasis.map((basis) => {
    const rotated = [basis[0]];
    for (const harmonic of [1, 2]) {
      const angle = harmonic * replayOrigin;
      const cosine = basis[2 * harmonic - 1]!;
      const sine = basis[2 * harmonic]!;
      rotated.push(cosine * Math.cos(angle) - sine * Math.sin(angle));
      rotated.push(cosine * Math.sin(angle) + sine * Math.cos(angle));
    }
    return rotated;
  });
  const frozenResponse = productionCoefficients(frozenForcing);
  const solar = runAdmittedOperationForTest(hydrology.climate.ops.computeRadiativeForcing, {
    model: "daily-solar-fourier", width: 1, height: samples.length,
    latitudeByRow: Float32Array.from(samples, (sample) => sample.latitudeDegrees),
    axialTiltDeg: responseCalendar.axialTiltDegrees,
  }, { strategy: "daily-solar-fourier", config: {} });
  if (solar.model !== "daily-solar-fourier" || solar.phaseOrigin !== "northward-equinox") {
    throw new Error("Expected the admitted equinox-origin solar cycle.");
  }
  const continuousResponse = productionCoefficients(solar.solarByRow);
  const calendarBasis = equinoxCalendarBasis();
  const integrate = (coefficients: readonly number[], basis: readonly (readonly number[])[]) =>
    basis.map((row) => row.reduce((sum, value, column) => sum + value * coefficients[column]!, 0));
  const records = samples.map((sample, index) => ({
    split: sample.split, areaWeight: sample.areaWeight, observed: sample.monthlyAirTemperatureC,
    observedAnnual: sample.annualAirTemperatureC,
    oracle: predictResponseMonths(sample, oracle, "periodic-proxy"),
    frozen: integrate(frozenResponse.coefficients[index]!, replayBasis),
    continuous: integrate(continuousResponse.coefficients[index]!, calendarBasis),
    frozenAnnual: frozenResponse.annual[index]!, continuousAnnual: continuousResponse.annual[index]!,
  }));
  const cohorts = (["train", "holdout", "all"] as const).map((split) => {
    const selected = records.filter((record) => split === "all" || record.split === split);
    const totalArea = selected.reduce((sum, record) => sum + record.areaWeight, 0);
    const errors = (["oracle", "frozen", "continuous"] as const).map((arm) => ({
      arm,
      monthlyRmseC: Math.sqrt(selected.reduce((sum, record) => sum + record.areaWeight * weightedMonthlyMean(
        record[arm].map((value, month) => (value - record.observed[month]!) ** 2)
      ), 0) / totalArea),
      annualRmseC: Math.sqrt(selected.reduce((sum, record) => sum + record.areaWeight * (weightedMonthlyMean(record[arm]) - record.observedAnnual) ** 2, 0) / totalArea),
    }));
    return { split, count: selected.length, errors };
  });
  const maximumDifference = (left: "oracle" | "frozen", right: "frozen" | "continuous") =>
    records.reduce((maximum, record) => Math.max(maximum, ...record[left].map((value, month) => Math.abs(value - record[right][month]!))), 0);
  return {
    cohorts, records,
    frozenReplayMaxErrorC: maximumDifference("oracle", "frozen"),
    solarRepresentationMaxDeltaC: maximumDifference("frozen", "continuous"),
    limitations: [
      "Unclipped low-relief inland reference only; not ocean, relief or coupled climate qualification.",
      "Calendar-month harmonic projection and continuous solar Fourier integration are separate numerical representations.",
      "No held-out observations or coefficients are refitted by production operations.",
    ],
  };
}
