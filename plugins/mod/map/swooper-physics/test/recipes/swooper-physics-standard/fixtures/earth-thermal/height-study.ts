import { isDeepStrictEqual } from "node:util";
import { runAdmittedOperationForTest } from "@swooper/mapgen-core/testing";
import hydrology from "../../../../../src/domain/hydrology/router.js";
import { equinoxCalendarBasis, productionReplayPhases, recoverProductionHarmonics } from "./production-harmonics.js";
import { responseCalendar, weightedMonthlyMean } from "./response-harmonics.js";

export type EarthHeightSample = Readonly<{
  sourceRow: number;
  sourceColumn: number;
  latitudeDegrees: number;
  longitudeDegreesEast: number;
  areaWeight: number;
  sourceHeightM: number;
  monthlyAirTemperatureC: readonly number[];
  annualAirTemperatureC: number;
  lowReliefMembership: string | null;
  within80DegreeEvaluationCrop: boolean;
}>;

export const heightStudyProtocol = {
  referenceSha256: "11827210fcde734c4c3e1a9497e03ec21c516e6eec9aef364fe6236ec2943282",
  annualLowReliefSha256: "8540f4a8864fe3bd240b6038a7251bfdd4be2f6033880c386c7c412d67848a20",
  monthlyLowReliefSha256: "cdc4f1dd74a3ec6f9f92a55307ac273902a3f83ba34f010df372ce50dbf71a1f",
  assumedLapseCPerGeopotentialM: -0.0065,
  float32BudgetC: 0.0001,
  seaLevel: 0,
  thermalBoundsC: [-120, 120],
  arms: [
    { id: "zero-height", metresPerModelUnit: 1, zeroHeight: true },
    { id: "q1", metresPerModelUnit: 1, zeroHeight: false },
    { id: "q10", metresPerModelUnit: 10, zeroHeight: false },
  ],
  limitations: [
    "The -6.5 K/geopotential-km lapse is a diagnostic hypothesis, not accepted empirical surface-temperature truth.",
    "q is a declared test input encoding, not a calibration of generated normalized relief or native display elevation.",
    "Frozen response coefficients are not refitted; lowland height may already affect both their annual intercept and geographic gain.",
    "Original train/holdout labels are retained; other cells are out-of-fit, not an independent validation dataset.",
    "Independent source rows are not adjacent map cells. No Foundation, Morphology, precipitation, pressure-field or native pipeline is run.",
    "Exact sea-level thermal samples/means establish pressure-input invariance only. Land thermal transport remains absent.",
    "The existing nonnegative height-above-sea-level clamp is retained and below-sea-level land is reported separately.",
  ],
} as const;

/** Reject overflow before encoding; signed below-sea-level evidence must not be clipped by the fixture. */
export function encodeEarthHeight(heightM: number, metresPerModelUnit: number) {
  if (!Number.isFinite(heightM) || !Number.isFinite(metresPerModelUnit) || metresPerModelUnit <= 0) {
    throw new RangeError("Finite height and a positive finite unit scale are required.");
  }
  const encoded = Math.round(heightM / metresPerModelUnit);
  if (encoded < -32768 || encoded > 32767) throw new RangeError("Earth height is not Int16 representable.");
  return encoded;
}

/** Run the actual public operations on independent source sample rows, without any response fitting. */
export function runHeightThermalArms(rows: readonly Pick<EarthHeightSample, "latitudeDegrees" | "sourceHeightM">[]) {
  if (rows.length === 0) throw new Error("At least one source sample is required.");
  const heldRows = structuredClone(rows);
  const solarInput = {
    model: "daily-solar-fourier" as const, width: 1, height: rows.length,
    latitudeByRow: Float32Array.from(rows, (row) => row.latitudeDegrees),
    axialTiltDeg: responseCalendar.axialTiltDegrees,
  };
  const solarConfig = { strategy: "daily-solar-fourier" as const, config: {} };
  const heldSolar = structuredClone({ solarInput, solarConfig });
  const solar = runAdmittedOperationForTest(hydrology.climate.ops.computeRadiativeForcing, solarInput, solarConfig);
  if (solar.model !== "daily-solar-fourier" || solar.phaseOrigin !== "northward-equinox") {
    throw new Error("Expected the admitted equinox-origin solar cycle.");
  }
  const calendarBasis = equinoxCalendarBasis();
  const arms = heightStudyProtocol.arms.map((arm) => {
    const input = {
      model: "periodic-response" as const, width: 1, height: rows.length,
      solarByRow: solar.solarByRow,
      phases: [...productionReplayPhases], weights: productionReplayPhases.map(() => 1 / 8),
      elevation: Int16Array.from(rows, (row) => encodeEarthHeight(arm.zeroHeight ? 0 : row.sourceHeightM, arm.metresPerModelUnit)),
      seaLevel: heightStudyProtocol.seaLevel,
      landMask: new Uint8Array(rows.length).fill(1), sstC: new Float32Array(rows.length),
    };
    const config = { strategy: "periodic-response" as const, config: {
      annualOffsetC: 0,
      lapseRateCPerElevationUnit: arm.metresPerModelUnit * heightStudyProtocol.assumedLapseCPerGeopotentialM,
      minC: heightStudyProtocol.thermalBoundsC[0], maxC: heightStudyProtocol.thermalBoundsC[1],
    } };
    const held = structuredClone({ input, config });
    const result = runAdmittedOperationForTest(hydrology.climate.ops.computeThermalState, input, config);
    if (result.model !== "periodic-response") throw new Error("Expected the admitted periodic response.");
    if (!isDeepStrictEqual({ input, config }, held)) throw new Error("Thermal operation mutated its inputs/config.");
    const records = rows.map((_, row) => {
      const coefficients = recoverProductionHarmonics(result.samples.map((sample) => sample.surfaceTemperatureC[row]!));
      const monthlyC = calendarBasis.map((basis) => basis.reduce((sum, value, column) => sum + value * coefficients[column]!, 0));
      const radius = Math.hypot(coefficients[1]!, coefficients[2]!) + Math.hypot(coefficients[3]!, coefficients[4]!);
      return {
        coefficients, monthlyC,
        annualPublishedC: result.annualSurfaceTemperatureC[row]!,
        annualCalendarC: weightedMonthlyMean(monthlyC),
        conservativeMinC: coefficients[0]! - radius,
        conservativeMaxC: coefficients[0]! + radius,
      };
    });
    return { ...arm, input, config, result, records };
  });
  if (!isDeepStrictEqual(rows, heldRows) || !isDeepStrictEqual({ solarInput, solarConfig }, heldSolar)) {
    throw new Error("Source samples or solar operation inputs/config changed.");
  }
  return { solarInput, solarConfig, solar, arms, inputImmutabilityVerified: true as const };
}

type ThermalArm = ReturnType<typeof runHeightThermalArms>["arms"][number];

function errorSummary(samples: readonly EarthHeightSample[], indices: readonly number[], arm: ThermalArm) {
  const totalArea = indices.reduce((sum, index) => sum + samples[index]!.areaWeight, 0);
  const annualErrors = indices.map((index) => arm.records[index]!.annualPublishedC - samples[index]!.annualAirTemperatureC);
  const monthlyErrors = indices.map((index) => arm.records[index]!.monthlyC.map((value, month) => value - samples[index]!.monthlyAirTemperatureC[month]!));
  const average = (values: readonly number[]) => values.reduce((sum, value, slot) => sum + samples[indices[slot]!]!.areaWeight * value, 0) / totalArea;
  return {
    arm: arm.id,
    annual: { biasC: average(annualErrors), maeC: average(annualErrors.map(Math.abs)), rmseC: Math.sqrt(average(annualErrors.map((value) => value * value))) },
    monthly: {
      biasC: average(monthlyErrors.map(weightedMonthlyMean)),
      maeC: average(monthlyErrors.map((values) => weightedMonthlyMean(values.map(Math.abs)))),
      rmseC: Math.sqrt(average(monthlyErrors.map((values) => weightedMonthlyMean(values.map((value) => value * value))))),
    },
  };
}

/** Report errors without making a fitted correction or declaring an accuracy acceptance threshold. */
export function runEarthHeightStudy(samples: readonly EarthHeightSample[]) {
  const identities = new Set<string>();
  for (const sample of samples) {
    const key = `${sample.sourceRow}:${sample.sourceColumn}`;
    if (identities.has(key)) throw new Error(`Duplicate source cell ${key}.`);
    identities.add(key);
    if (!(sample.areaWeight > 0) || !Number.isFinite(sample.areaWeight) ||
      !Number.isFinite(sample.annualAirTemperatureC) || !["train", "holdout", null].includes(sample.lowReliefMembership) ||
      sample.within80DegreeEvaluationCrop !== (Math.abs(sample.latitudeDegrees) <= 80)) {
      throw new Error(`Invalid source sample ${key}.`);
    }
    if (Math.abs(weightedMonthlyMean(sample.monthlyAirTemperatureC) - sample.annualAirTemperatureC) > 1e-10) {
      throw new Error(`Inconsistent calendar annual mean at ${key}.`);
    }
  }
  const run = runHeightThermalArms(samples);
  const [zero, q1, q10] = run.arms as [ThermalArm, ThermalArm, ThermalArm];
  const cohorts = [];
  const groups: { group: string; select: (sample: EarthHeightSample) => boolean }[] = [
    { group: "all", select: () => true },
    ...["train", "holdout"].map((split) => ({ group: `original-${split}`, select: (sample: EarthHeightSample) => sample.lowReliefMembership === split })),
    { group: "out-of-fit-not-independent", select: (sample) => sample.lowReliefMembership === null },
    ...[-90, -60, -30, 0, 30, 60].map((lower) => ({ group: `latitude:[${lower},${lower + 30})`, select: (sample: EarthHeightSample) => sample.latitudeDegrees >= lower && sample.latitudeDegrees < lower + 30 })),
    { group: "altitude:below-sea-level", select: (sample) => sample.sourceHeightM < 0 },
    ...[0, 250, 1000, 2000, 4000].map((lower, index, bounds) => ({ group: `altitude:[${lower},${bounds[index + 1] ?? "infinity"})`, select: (sample: EarthHeightSample) => sample.sourceHeightM >= lower && sample.sourceHeightM < (bounds[index + 1] ?? Infinity) })),
  ];
  for (const scope of ["global", "crop80"] as const) {
    for (const group of groups) {
      const indices = samples.flatMap((sample, index) => (scope === "global" || sample.within80DegreeEvaluationCrop) && group.select(sample) ? [index] : []);
      if (indices.length === 0) continue;
      cohorts.push({ scope, group: group.group, count: indices.length,
        areaWeight: indices.reduce((sum, index) => sum + samples[index]!.areaWeight, 0),
        errors: run.arms.map((arm) => errorSummary(samples, indices, arm)),
      });
    }
  }
  const numericalEvidence = run.arms.map((arm) => ({
    arm: arm.id,
    encodedHeightRange: [Math.min(...arm.input.elevation), Math.max(...arm.input.elevation)],
    negativeEncodedHeightCount: arm.input.elevation.filter((height) => height < 0).length,
    conservativeMinC: Math.min(...arm.records.map((record) => record.conservativeMinC)),
    conservativeMaxC: Math.max(...arm.records.map((record) => record.conservativeMaxC)),
    maxAnnualClippingDeltaC: Math.max(...Array.from(arm.result.annualClippingDeltaC, Math.abs)),
    maxAnnualCalendarDifferenceC: Math.max(...arm.records.map((record) => Math.abs(record.annualCalendarC - record.annualPublishedC))),
    seaLevelPressureInputsExact: isDeepStrictEqual(arm.result.meanSeaLevelTemperatureC, zero.result.meanSeaLevelTemperatureC) && arm.result.samples.every((sample, phase) => isDeepStrictEqual(sample.seaLevelTemperatureC, zero.result.samples[phase]!.seaLevelTemperatureC)),
  }));
  const covariance = {
    roundingBoundC: Math.abs(heightStudyProtocol.assumedLapseCPerGeopotentialM) * (1 + 10) / 2,
    float32BudgetC: heightStudyProtocol.float32BudgetC,
    maxAnnualDeltaC: Math.max(...q1.records.map((record, index) => Math.abs(record.annualPublishedC - q10.records[index]!.annualPublishedC))),
    maxMonthlyDeltaC: Math.max(...q1.records.map((record, index) => Math.max(...record.monthlyC.map((value, month) => Math.abs(value - q10.records[index]!.monthlyC[month]!))))),
    maxSampleDeltaC: Math.max(...q1.result.samples.map((sample, phase) => Math.max(...Array.from(sample.surfaceTemperatureC, (value, row) => Math.abs(value - q10.result.samples[phase]!.surfaceTemperatureC[row]!))))),
  };
  return { ...run, summary: {
    protocol: heightStudyProtocol, calendar: responseCalendar, sampleCount: samples.length,
    inputImmutabilityVerified: run.inputImmutabilityVerified, numericalEvidence, covariance, cohorts,
  } };
}
