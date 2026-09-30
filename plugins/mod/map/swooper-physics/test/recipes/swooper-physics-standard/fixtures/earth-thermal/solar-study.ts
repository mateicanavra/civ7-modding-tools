import { runAdmittedOperationForTest } from "@swooper/mapgen-core/testing";
import hydrology from "../../../../../src/domain/hydrology/router.js";
import { earthThermalReference as reference, earthThermalReferenceProfiles } from "./reference.js";
import { dailyMeanSolar, declinationAtPhase, seasonalPhases } from "./solar-geometry.js";

type Sample = (typeof reference.samples)[number];
export type SolarGeometry = "shifted-curve" | "daily-mean-toa";
export type SolarFit = Readonly<{ interceptC: number; gainC: number }>;

export const solarStudyProtocol = {
  kind: "test-owned scientific discriminator; not a production strategy or Earth calibration",
  fitting: "area-weighted least squares of annual temperature on annual forcing; train only; no clipping in objective",
  identifiableParameters: ["interceptC at zero forcing", "gainC per forcing unit"],
  fixedForcing: earthThermalReferenceProfiles.originalNeutralBaseline.forcing,
  phaseCounts: [4, 48, 384],
  phaseWeight: "equal; phases i/N; four phases are [0, 0.25, 0.5, 0.75]",
  declination: "23.44 * sin(2*pi*phase) degrees; unchanged harmonic approximation, not exact orbital longitude",
  orbit: "circular-distance approximation (FAO distance factor dr=1); no eccentricity or dated ephemeris",
  dailyMeanUnits: "daily-mean TOA irradiance divided by solar constant; dimensionless",
  thermalAdapter: "daily-mean TOA q becomes I=4q (global-mean-one proxy); fixed unit conversion, not a fitted coefficient",
  thermalParameterization: "T=a+b*q; production gain=b/unitScale and base=a+0.5*gain; landCooling=0",
  thermalBoundsC: [-40, 50],
  terrain: "all land; model elevation=seaLevel=0; lapse=0; no source-meter conversion",
  numericalExecution: "float64 reference fit, Float32 forcing into admitted production thermal operation",
  diagnosticRows: "411 independent low-relief land source samples, not a map; frozen 196 train / 215 holdout",
  referenceFixtureSha256: "8540f4a8864fe3bd240b6038a7251bfdd4be2f6033880c386c7c412d67848a20",
  seasonalMeaning: "sampled phase temperature range versus monthly-climatology range, not matched monthly errors or lag",
  exclusions: ["seasonal attenuation fit", "thermal inertia", "ocean calibration", "physical altitude", "biome targets", "production adoption"],
} as const;

export function buildSolarForcing(geometry: SolarGeometry, phaseCount: number, samples = reference.samples) {
  return seasonalPhases(phaseCount).map((phase) => {
    const declination = declinationAtPhase(phase);
    return Float64Array.from(samples, ({ latitudeDegrees }) => {
      if (geometry === "daily-mean-toa") {
        return dailyMeanSolar(latitudeDegrees, declination).fluxOverSolarConstant;
      }
      const shifted = Math.max(-89.999, Math.min(89.999, latitudeDegrees - declination));
      const { equatorInsolation, poleInsolation, latitudeExponent } = solarStudyProtocol.fixedForcing.config;
      return equatorInsolation + (poleInsolation - equatorInsolation) * (Math.abs(shifted) / 90) ** latitudeExponent;
    });
  });
}

function annualMean(fields: readonly ArrayLike<number>[]) {
  if (fields.length === 0) throw new Error("At least one phase is required.");
  const count = fields[0]!.length;
  if (fields.some((field) => field.length !== count)) throw new Error("Phase cardinality mismatch.");
  return Float64Array.from({ length: count }, (_, index) =>
    fields.reduce((total, field) => total + field[index]!, 0) / fields.length
  );
}

/** The holdout response values never enter the normal equations. */
export function fitSolarAnnual(forcing: readonly Float64Array[], samples = reference.samples): SolarFit {
  const annual = annualMean(forcing);
  if (annual.length !== samples.length) throw new Error("Reference cardinality mismatch.");
  let weight = 0;
  let meanX = 0;
  let meanY = 0;
  samples.forEach((sample, index) => {
    if (sample.split !== "train") return;
    weight += sample.areaWeight;
    meanX += sample.areaWeight * annual[index]!;
    meanY += sample.areaWeight * sample.annualAirTemperatureC;
  });
  if (!(weight > 0)) throw new Error("Training area must be positive.");
  meanX /= weight;
  meanY /= weight;
  let variance = 0;
  let covariance = 0;
  samples.forEach((sample, index) => {
    if (sample.split !== "train") return;
    const dx = annual[index]! - meanX;
    variance += sample.areaWeight * dx * dx;
    covariance += sample.areaWeight * dx * (sample.annualAirTemperatureC - meanY);
  });
  if (!(variance > 0)) throw new Error("Training forcing must have positive variance.");
  const gainC = covariance / variance;
  return { interceptC: meanY - gainC * meanX, gainC };
}

function errorSummary(values: ArrayLike<number>, selected: (sample: Sample) => boolean) {
  let areaWeight = 0;
  let bias = 0;
  let square = 0;
  let absolute = 0;
  let count = 0;
  reference.samples.forEach((sample, index) => {
    if (!selected(sample)) return;
    const error = values[index]! - sample.annualAirTemperatureC;
    count++;
    areaWeight += sample.areaWeight;
    bias += sample.areaWeight * error;
    square += sample.areaWeight * error * error;
    absolute += sample.areaWeight * Math.abs(error);
  });
  if (!(areaWeight > 0)) throw new Error("Cohort area must be positive.");
  return { count, areaWeight, biasC: bias / areaWeight, rmseC: Math.sqrt(square / areaWeight), maeC: absolute / areaWeight };
}

function rangeByLatitudeBand(unclipped: Float64Array[], clipped: Float32Array[]) {
  return [[0, 15], [15, 30], [30, 45], [45, 60], [60, 75]].map(([low, high]) => {
    let areaWeight = 0;
    let count = 0;
    let unclippedRange = 0;
    let clippedRange = 0;
    let monthlyRange = 0;
    reference.samples.forEach((sample, index) => {
      const latitude = Math.abs(sample.latitudeDegrees);
      if (latitude < low! || latitude >= high!) return;
      const u = unclipped.map((field) => field[index]!);
      const c = clipped.map((field) => field[index]!);
      count++;
      areaWeight += sample.areaWeight;
      unclippedRange += sample.areaWeight * (Math.max(...u) - Math.min(...u));
      clippedRange += sample.areaWeight * (Math.max(...c) - Math.min(...c));
      monthlyRange += sample.areaWeight * sample.monthlyAirTemperatureRangeC;
    });
    return {
      absoluteLatitudeBand: [low!, high!], count, areaWeight,
      unclippedPhaseRangeC: unclippedRange / areaWeight,
      clippedPhaseRangeC: clippedRange / areaWeight,
      referenceMonthlyRangeC: monthlyRange / areaWeight,
    };
  });
}

export function evaluateSolarCase(geometry: SolarGeometry, phaseCount: number, fitted = true) {
  const forcing = buildSolarForcing(geometry, phaseCount);
  const original = earthThermalReferenceProfiles.originalNeutralBaseline.thermal.config;
  if (!fitted && geometry !== "shifted-curve") throw new Error("The unfitted baseline is the original shifted curve only.");
  const fit = fitted ? fitSolarAnnual(forcing) : {
    interceptC: original.baseTemperatureC - original.landCoolingC - 0.5 * original.insolationScaleC,
    gainC: original.insolationScaleC,
  };
  // Fixed units let the existing admitted operation represent the same affine law.
  const unitScale = geometry === "daily-mean-toa" ? 4 : 1;
  const thermalConfig = {
    baseTemperatureC: fit.interceptC + (0.5 * fit.gainC) / unitScale,
    insolationScaleC: fit.gainC / unitScale,
    lapseRateCPerElevationUnit: 0,
    landCoolingC: 0,
    minC: -40,
    maxC: 50,
  };
  const width = 1;
  const height = reference.samples.length;
  const elevation = new Int16Array(height);
  const landMask = new Uint8Array(height).fill(1);
  const unclipped = forcing.map((field) => Float64Array.from(field, (value) => fit.interceptC + fit.gainC * value));
  let forcingParityMaxAbsoluteError = 0;
  let thermalParityMaxAbsoluteErrorC = 0;
  const clipped = forcing.map((field, phaseIndex) => {
    const phase = phaseIndex / phaseCount;
    const legacyForcing = geometry === "shifted-curve"
      ? runAdmittedOperationForTest(hydrology.climate.ops.computeRadiativeForcing, {
        model: "latitude-insolation", width, height,
        latitudeByRow: Float32Array.from(reference.samples, (sample) =>
          Math.max(-89.999, Math.min(89.999, sample.latitudeDegrees - declinationAtPhase(phase)))
        ),
      }, solarStudyProtocol.fixedForcing)
      : null;
    if (legacyForcing && legacyForcing.model !== "latitude-insolation") throw new Error("Expected legacy reference forcing.");
    const insolation = legacyForcing?.insolation ?? Float32Array.from(field, (value) => value * unitScale);
    field.forEach((value, index) => {
      forcingParityMaxAbsoluteError = Math.max(forcingParityMaxAbsoluteError, Math.abs(insolation[index]! / unitScale - value));
    });
    const thermal = runAdmittedOperationForTest(hydrology.climate.ops.computeThermalState, {
      model: "insolation-lapse-rate", width, height, elevation, seaLevel: 0, landMask, insolation,
    }, { strategy: "insolation-lapse-rate", config: thermalConfig });
    if (thermal.model !== "insolation-lapse-rate") throw new Error("Expected legacy reference thermal field.");
    const result = thermal.surfaceTemperatureC;
    result.forEach((value, index) => {
      const expected = Math.max(-40, Math.min(50, unclipped[phaseIndex]![index]!));
      thermalParityMaxAbsoluteErrorC = Math.max(thermalParityMaxAbsoluteErrorC, Math.abs(value - expected));
    });
    return result;
  });
  const annualUnclipped = annualMean(unclipped);
  const annualClipped = annualMean(clipped);
  const annualForcing = annualMean(forcing);
  const cohorts = Object.fromEntries(["train", "holdout", "all"].map((split) => {
    const select = (sample: Sample) => split === "all" || sample.split === split;
    let weight = 0;
    let low = 0;
    let high = 0;
    let affected = 0;
    let clipShift = 0;
    let numericalShift = 0;
    reference.samples.forEach((sample, index) => {
      if (!select(sample)) return;
      weight += sample.areaWeight;
      let anyClip = false;
      let analyticClippedMean = 0;
      for (const field of unclipped) {
        if (field[index]! < -40) { low += sample.areaWeight / phaseCount; anyClip = true; }
        if (field[index]! > 50) { high += sample.areaWeight / phaseCount; anyClip = true; }
        analyticClippedMean += Math.max(-40, Math.min(50, field[index]!)) / phaseCount;
      }
      if (anyClip) affected += sample.areaWeight;
      clipShift += sample.areaWeight * (analyticClippedMean - annualUnclipped[index]!);
      numericalShift += sample.areaWeight * (annualClipped[index]! - analyticClippedMean);
    });
    return [split, {
      unclipped: errorSummary(annualUnclipped, select),
      clipped: errorSummary(annualClipped, select),
      clipping: { lowPhaseAreaFraction: low / weight, highPhaseAreaFraction: high / weight,
        affectedSampleAreaFraction: affected / weight, annualMeanShiftC: clipShift / weight },
      productionRoundoffAnnualMeanShiftC: numericalShift / weight,
    }];
  }));
  return {
    id: `${geometry}-${phaseCount}-${fitted ? "annual-fit" : "original-baseline"}`,
    geometry, phaseCount, fitted, fit, unitScale, thermalConfig, cohorts,
    bands: rangeByLatitudeBand(unclipped, clipped),
    numericalParity: { forcingMaxAbsoluteError: forcingParityMaxAbsoluteError, thermalMaxAbsoluteErrorC: thermalParityMaxAbsoluteErrorC },
    samples: reference.samples.map((sample, index) => ({
      sourceRow: sample.sourceRow, sourceColumn: sample.sourceColumn, split: sample.split,
      latitudeDegrees: sample.latitudeDegrees, areaWeight: sample.areaWeight,
      referenceAnnualC: sample.annualAirTemperatureC,
      referenceMonthlyRangeC: sample.monthlyAirTemperatureRangeC,
      annualForcing: annualForcing[index]!,
      annualUnclippedC: annualUnclipped[index]!, annualClippedC: annualClipped[index]!,
      phaseUnclippedC: unclipped.map((field) => field[index]!),
      phaseClippedC: clipped.map((field) => field[index]!),
    })),
  };
}

export function runSolarStudy() {
  return [
    evaluateSolarCase("shifted-curve", 4, false),
    ...solarStudyProtocol.phaseCounts.flatMap((count) =>
      (["shifted-curve", "daily-mean-toa"] as const).map((geometry) => evaluateSolarCase(geometry, count))
    ),
  ];
}
