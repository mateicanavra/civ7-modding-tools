import { earthMonthlyThermalReference as reference } from "./monthly-reference.js";
import {
  fitMonthlyHarmonics,
  harmonicResponse,
  monthlySolarForcing,
  responseCalendar,
  responseInterpretability,
  responseMonthlyBasis,
  responseMonthWeightsDays,
  storageOnlyTransfer,
  weightedMonthlyMean,
} from "./response-harmonics.js";

export const responsePaperSource = {
  title: "McKinnon, Stine and Huybers (2013), The Spatial Structure of the Annual Cycle in Surface Temperature",
  url: "https://phuybers.sites.fas.harvard.edu/Doc/McKinnon_JC2013.pdf",
  doi: "10.1175/JCLI-D-13-00021.1",
  bytes: 1922744,
  sha256: "f1b658ed394acb64f3bd7f8f5aef2d4369385e398e2f5130a2472f85eb7b5e3f",
} as const;

export const responseStudyProtocol = {
  kind: "test-owned monthly response discriminator; no production adoption",
  fixtureSha256: "cdc4f1dd74a3ec6f9f92a55307ac273902a3f83ba34f010df372ce50dbf71a1f",
  calendar: responseCalendar,
  quadratureSubdivisionsPerDay: 4,
  harmonicBasis: "intercept, cos(annual), sin(annual), cos(semiannual), sin(semiannual); exact month integrals",
  harmonicFitting: "weighted QR of monthly means; month-day weights; harmonic coefficients are observations, not model parameters",
  geographicFitting: "annual area-weighted training-only intercept and slope; no physical radiative-feedback interpretation",
  null: "tau*dT'/dt + T' = b_geographic*q'; one nonnegative global tau, both harmonics; b held at annual geographic fit",
  nullInvariant: "gainRatio=cos(lagRadians), with 0<=lag<pi/2; the equality is conditional on this fixed-DC-gain null",
  nullFit: "training-only weighted complex harmonic error; 2049 equally spaced atan(2*pi*tau) values then 64 golden-section refinements",
  periodicProxy: "independent global complex G1 and G2 (C per q), fitted on training harmonic coefficients; not inferred heat capacity",
  periodicFit: "each harmonic minimizes sum(areaWeight*abs(T_complex-G*Q_complex)^2), training only; four real identifiable coefficients",
  monthlyEvaluation: "annual geographic mean plus integrated predicted annual+semiannual anomalies; unclipped; area*month-day weighted errors",
  phaseInterpretability: responseInterpretability,
  extratropicalAnnualSummary: "only bands wholly outside 23.44 degrees are interpreted as extratropical; tropical annual phase is not a sufficient seasonal description",
  limitations: [
    "411 geographically unbalanced low-relief inland reanalysis cells; not Earth's mean or an ocean calibration",
    "monthly 2m air temperature is not skin temperature or SST",
    "monthly harmonic truncation, climatological averaging and approximate orbital calendar remain visible residuals",
    "no physical heat capacity, radiative feedback, wind velocity, altitude or maritime exchange rate is identified",
    "one frozen spatial holdout, not an independent time-period or uncertainty estimate",
  ],
} as const;

type Sample = (typeof reference.samples)[number];
type Complex = Readonly<{ real: number; imaginary: number }>;
const multiply = (a: Complex, b: Complex): Complex => ({
  real: a.real * b.real - a.imaginary * b.imaginary,
  imaginary: a.real * b.imaginary + a.imaginary * b.real,
});

export function prepareResponseSamples(samples: readonly Sample[] = reference.samples, subdivisions = 4) {
  const forcingByLatitude = new Map<number, number[]>();
  return samples.map((sample) => {
    let forcingMonthly = forcingByLatitude.get(sample.latitudeDegrees);
    if (!forcingMonthly) {
      forcingMonthly = monthlySolarForcing(sample.latitudeDegrees, subdivisions);
      forcingByLatitude.set(sample.latitudeDegrees, forcingMonthly);
    }
    const temperature = fitMonthlyHarmonics(sample.monthlyAirTemperatureC);
    const forcing = fitMonthlyHarmonics(forcingMonthly);
    return { ...sample, forcingMonthly, temperature, forcing, forcingAnnual: weightedMonthlyMean(forcingMonthly) };
  });
}

type Prepared = ReturnType<typeof prepareResponseSamples>[number];

function complexAt(coefficients: readonly number[], harmonic: 1 | 2): Complex {
  return { real: coefficients[2 * harmonic - 1]!, imaginary: -coefficients[2 * harmonic]! };
}

export function fitResponseModels(samples: readonly Prepared[]) {
  const training = samples.filter((sample) => sample.split === "train");
  const totalWeight = training.reduce((sum, sample) => sum + sample.areaWeight, 0);
  if (!(totalWeight > 0)) throw new Error("Training cohort must contain positive area.");
  const meanQ = training.reduce((sum, sample) => sum + sample.areaWeight * sample.forcingAnnual, 0) / totalWeight;
  const meanT = training.reduce((sum, sample) => sum + sample.areaWeight * sample.annualAirTemperatureC, 0) / totalWeight;
  const variance = training.reduce((sum, sample) => sum + sample.areaWeight * (sample.forcingAnnual - meanQ) ** 2, 0);
  if (!(variance > 0)) throw new Error("Training annual forcing variance must be positive.");
  const gainCPerQ = training.reduce((sum, sample) =>
    sum + sample.areaWeight * (sample.forcingAnnual - meanQ) * (sample.annualAirTemperatureC - meanT), 0
  ) / variance;
  const geographic = { interceptC: meanT - gainCPerQ * meanQ, gainCPerQ };
  const periodic = ([1, 2] as const).map((harmonic) => {
    let denominator = 0;
    let real = 0;
    let imaginary = 0;
    for (const sample of training) {
      const q = complexAt(sample.forcing.coefficients, harmonic);
      const t = complexAt(sample.temperature.coefficients, harmonic);
      denominator += sample.areaWeight * (q.real ** 2 + q.imaginary ** 2);
      real += sample.areaWeight * (t.real * q.real + t.imaginary * q.imaginary);
      imaginary += sample.areaWeight * (t.imaginary * q.real - t.real * q.imaginary);
    }
    if (!(denominator > 1e-12)) throw new Error("Training solar harmonic is unidentifiable.");
    return { harmonic, real: real / denominator, imaginary: imaginary / denominator };
  });
  // The angular search includes tau=0 and the zero-response limit without choosing a maximum number of days.
  const cost = (angle: number) => {
    const tauYears = Math.tan(angle) / (2 * Math.PI);
    let squaredError = 0;
    for (const sample of training) {
      for (const harmonic of [1, 2] as const) {
        const transfer = storageOnlyTransfer(tauYears, harmonic);
        const prediction = multiply(complexAt(sample.forcing.coefficients, harmonic), {
          real: gainCPerQ * transfer.real, imaginary: gainCPerQ * transfer.imaginary,
        });
        const observed = complexAt(sample.temperature.coefficients, harmonic);
        squaredError += sample.areaWeight * ((observed.real - prediction.real) ** 2 + (observed.imaginary - prediction.imaginary) ** 2);
      }
    }
    return squaredError / totalWeight;
  };
  const count = 2048;
  let bestIndex = 0;
  let bestCost = Infinity;
  for (let index = 0; index <= count; index++) {
    const value = cost(index * Math.PI / (2 * count));
    if (value < bestCost) { bestCost = value; bestIndex = index; }
  }
  let low = Math.max(0, bestIndex - 1) * Math.PI / (2 * count);
  let high = Math.min(count, bestIndex + 1) * Math.PI / (2 * count);
  const golden = (Math.sqrt(5) - 1) / 2;
  for (let iteration = 0; iteration < 64; iteration++) {
    const left = high - golden * (high - low);
    const right = low + golden * (high - low);
    if (cost(left) < cost(right)) high = right;
    else low = left;
  }
  const candidates = [0, Math.PI / 2, (low + high) / 2];
  const angle = candidates.reduce((best, candidate) => cost(candidate) < cost(best) ? candidate : best);
  const storageOnly = {
    relaxationYears: Math.tan(angle) / (2 * Math.PI),
    relaxationDays: Math.tan(angle) * responseCalendar.meanYearDays / (2 * Math.PI),
    trainingHarmonicSquaredErrorC2: cost(angle),
    atInfiniteRelaxationLimit: angle === Math.PI / 2,
  };
  return { geographic, periodic, storageOnly };
}

type Models = ReturnType<typeof fitResponseModels>;
export type ResponseModel = "instantaneous-geographic-gain" | "storage-only" | "periodic-proxy";

export function predictResponseMonths(sample: Prepared, models: Models, model: ResponseModel) {
  const mean = models.geographic.interceptC + models.geographic.gainCPerQ * sample.forcingAnnual;
  const coefficients: number[] = [mean];
  for (const harmonic of [1, 2] as const) {
    let transfer: Complex = { real: models.geographic.gainCPerQ, imaginary: 0 };
    if (model === "storage-only") {
      const h = storageOnlyTransfer(models.storageOnly.relaxationYears, harmonic);
      transfer = { real: models.geographic.gainCPerQ * h.real, imaginary: models.geographic.gainCPerQ * h.imaginary };
    }
    if (model === "periodic-proxy") transfer = models.periodic[harmonic - 1]!;
    const prediction = multiply(complexAt(sample.forcing.coefficients, harmonic), transfer);
    coefficients.push(prediction.real, -prediction.imaginary);
  }
  return responseMonthlyBasis.map((basis) => basis.reduce((sum, value, column) => sum + value * coefficients[column]!, 0));
}

export function runResponseStudy(samples = prepareResponseSamples()) {
  const models = fitResponseModels(samples);
  const evaluated = samples.map((sample) => ({
    ...sample,
    harmonics: ([1, 2] as const).map((harmonic) => harmonicResponse(
      sample.temperature.coefficients, sample.forcing.coefficients, models.geographic.gainCPerQ, harmonic
    )),
    predictions: Object.fromEntries((["instantaneous-geographic-gain", "storage-only", "periodic-proxy"] as const)
      .map((model) => [model, predictResponseMonths(sample, models, model)])),
  }));
  const cohortErrors = (["train", "holdout", "all"] as const).map((split) => {
    const selected = evaluated.filter((sample) => split === "all" || sample.split === split);
    const areaWeight = selected.reduce((sum, sample) => sum + sample.areaWeight, 0);
    const modelErrors = (["instantaneous-geographic-gain", "storage-only", "periodic-proxy"] as const).map((model) => {
      let monthlySquare = 0;
      let anomalySquare = 0;
      let annualSquare = 0;
      let bias = 0;
      let reconstructionSquare = 0;
      let belowBoundWeight = 0;
      let aboveBoundWeight = 0;
      for (const sample of selected) {
        const prediction = sample.predictions[model]!;
        const predictedMean = weightedMonthlyMean(prediction);
        const annualError = predictedMean - sample.annualAirTemperatureC;
        annualSquare += sample.areaWeight * annualError ** 2;
        bias += sample.areaWeight * annualError;
        reconstructionSquare += sample.areaWeight * sample.temperature.residualRmse ** 2;
        for (let month = 0; month < 12; month++) {
          const weight = sample.areaWeight * responseMonthWeightsDays[month]! / responseCalendar.meanYearDays;
          const error = prediction[month]! - sample.monthlyAirTemperatureC[month]!;
          monthlySquare += weight * error ** 2;
          anomalySquare += weight * (error - annualError) ** 2;
          if (prediction[month]! < -40) belowBoundWeight += weight;
          if (prediction[month]! > 50) aboveBoundWeight += weight;
        }
      }
      return { model, monthlyRmseC: Math.sqrt(monthlySquare / areaWeight),
        anomalyRmseC: Math.sqrt(anomalySquare / areaWeight), annualRmseC: Math.sqrt(annualSquare / areaWeight),
        annualBiasC: bias / areaWeight, observedHarmonicReconstructionRmseC: Math.sqrt(reconstructionSquare / areaWeight),
        belowMinus40MonthlyAreaFraction: belowBoundWeight / areaWeight, above50MonthlyAreaFraction: aboveBoundWeight / areaWeight };
    });
    return { split, count: selected.length, areaWeight, modelErrors };
  });
  const harmonicBands = [[0, 15], [15, 30], [30, 45], [45, 60], [60, 75]].flatMap(([low, high]) =>
    ([1, 2] as const).map((harmonic) => {
      const selected = evaluated.filter((sample) => Math.abs(sample.latitudeDegrees) >= low! && Math.abs(sample.latitudeDegrees) < high!);
      const usable = selected.filter((sample) => sample.harmonics[harmonic - 1]!.transfer !== null);
      const areaWeight = usable.reduce((sum, sample) => sum + sample.areaWeight, 0);
      const weighted = (value: (transfer: NonNullable<(typeof evaluated)[number]["harmonics"][number]["transfer"]>) => number) =>
        areaWeight > 0 ? usable.reduce((sum, sample) => sum + sample.areaWeight * value(sample.harmonics[harmonic - 1]!.transfer!), 0) / areaWeight : null;
      return { absoluteLatitudeBand: [low!, high!], harmonic, count: selected.length, usableCount: usable.length,
        excludedCount: selected.length - usable.length, areaWeight,
        annualExtratropicalInterpretation: harmonic === 1 && low! >= 30,
        meanGainRatio: weighted((transfer) => transfer.gainRatio),
        // Circular mean avoids treating +half-period and -half-period as opposite phases.
        circularMeanLagDays: areaWeight > 0 ? Math.atan2(weighted((transfer) => Math.sin(transfer.lagRadians))!,
          weighted((transfer) => Math.cos(transfer.lagRadians))!) * responseCalendar.meanYearDays / (2 * Math.PI * harmonic) : null,
        meanStorageGainAtObservedLag: weighted((transfer) => transfer.storageOnlyGainAtObservedLag),
        meanGainMinusStoragePrediction: weighted((transfer) => transfer.gainMinusStoragePrediction),
        rmsComplexCircleResidual: areaWeight > 0 ? Math.sqrt(weighted((transfer) => transfer.complexCircleResidual ** 2)!) : null,
        passivePhaseViolationCount: usable.filter((sample) => !sample.harmonics[harmonic - 1]!.transfer!.passiveStoragePhase).length,
      };
    })
  );
  const monthlyBandErrors = (["train", "holdout", "all"] as const).flatMap((split) =>
    [[0, 15], [15, 30], [30, 45], [45, 60], [60, 75]].map(([low, high]) => {
    const selected = evaluated.filter((sample) => (split === "all" || sample.split === split)
      && Math.abs(sample.latitudeDegrees) >= low! && Math.abs(sample.latitudeDegrees) < high!);
    const areaWeight = selected.reduce((sum, sample) => sum + sample.areaWeight, 0);
    return { split, absoluteLatitudeBand: [low!, high!], count: selected.length, areaWeight,
      modelErrors: (["instantaneous-geographic-gain", "storage-only", "periodic-proxy"] as const).map((model) => ({
        model,
        monthlyRmseC: areaWeight > 0 ? Math.sqrt(selected.reduce((sum, sample) => sum + sample.areaWeight * weightedMonthlyMean(
          sample.predictions[model]!.map((value, month) => (value - sample.monthlyAirTemperatureC[month]!) ** 2)
        ), 0) / areaWeight) : null,
      })),
    };
  }));
  return { protocol: responseStudyProtocol, models, cohortErrors, harmonicBands, monthlyBandErrors, samples: evaluated };
}
