import type { SolarHarmonics } from "../../../model/atoms/solar-harmonics.schema.js";
import { EARTH_PERIODIC_RESPONSE } from "../../../model/policy/earth-periodic-response.js";
import { clampNumber } from "./index.js";

export const ANNUAL_THERMAL_QUADRATURE_COUNT = 384;

type Params = Readonly<{
  width: number;
  height: number;
  solarByRow: readonly Readonly<SolarHarmonics>[];
  phases: readonly number[];
  weights: readonly number[];
  elevation: ArrayLike<number>;
  seaLevel: number;
  landMask: ArrayLike<number>;
  sstC: ArrayLike<number>;
}>;
type Options = Readonly<{
  annualOffsetC: number;
  lapseRateCPerElevationUnit: number;
  minC: number;
  maxC: number;
}>;
type ThermalHarmonics = Readonly<{
  mean: number;
  cos1: number;
  sin1: number;
  cos2: number;
  sin2: number;
}>;

function requireValid(value: unknown, message: string): asserts value {
  if (!value) throw new RangeError(`Invalid periodic thermal input: ${message}.`);
}

function thermalHarmonics(solar: Readonly<SolarHarmonics>, offset: number): ThermalHarmonics {
  const { annual, semiannual, interceptC, geographicGainCPerQ } = EARTH_PERIODIC_RESPONSE;
  // Q = cosine - i*sine. Multiply by G once; the phase origin belongs to Q and evaluation.
  return {
    mean: interceptC + geographicGainCPerQ * solar.meanQ + offset,
    cos1: annual.real * solar.cos1Q + annual.imaginary * solar.sin1Q,
    sin1: annual.real * solar.sin1Q - annual.imaginary * solar.cos1Q,
    cos2: semiannual.real * solar.cos2Q + semiannual.imaginary * solar.sin2Q,
    sin2: semiannual.real * solar.sin2Q - semiannual.imaginary * solar.cos2Q,
  };
}

function evaluate(harmonics: ThermalHarmonics, phaseTurns: number): number {
  const phase = 2 * Math.PI * phaseTurns;
  return (
    harmonics.mean +
    harmonics.cos1 * Math.cos(phase) +
    harmonics.sin1 * Math.sin(phase) +
    harmonics.cos2 * Math.cos(2 * phase) +
    harmonics.sin2 * Math.sin(2 * phase)
  );
}

/** One empirical thermal response, sampled at two datums and independently integrated after clipping. */
export function computePeriodicThermalResponse(
  input: Params,
  options: Options,
  annualQuadratureCount = ANNUAL_THERMAL_QUADRATURE_COUNT
) {
  const { width, height, phases, weights } = input;
  requireValid(
    Number.isInteger(width) && width > 0 && Number.isInteger(height) && height > 0,
    "positive grid dimensions"
  );
  const size = width * height;
  requireValid(input.solarByRow.length === height, "one solar harmonic record per row");
  requireValid(
    [input.elevation, input.landMask, input.sstC].every((field) => field.length === size),
    "map-grid cardinality"
  );
  requireValid(
    phases.length > 0 && phases.length === weights.length,
    "aligned nonempty phases and weights"
  );
  requireValid(
    phases.every((phase) => Number.isFinite(phase) && phase >= 0 && phase < 1),
    "phases in [0, 1) turns"
  );
  requireValid(
    weights.every((weight) => Number.isFinite(weight) && weight > 0 && weight <= 1),
    "positive finite weights"
  );
  requireValid(
    Math.abs(weights.reduce((sum, weight) => sum + weight, 0) - 1) <= 64 * Number.EPSILON,
    "normalized weights"
  );
  requireValid(
    Number.isFinite(input.seaLevel) &&
      Object.values(options).every(Number.isFinite) &&
      options.minC <= options.maxC,
    "finite parameters and ordered bounds"
  );
  requireValid(
    Number.isInteger(annualQuadratureCount) &&
      annualQuadratureCount >= 8 &&
      annualQuadratureCount % 4 === 0,
    "annual quadrature multiple of four, at least eight"
  );
  for (const row of input.solarByRow) {
    requireValid(
      Object.values(row).every(Number.isFinite) && row.meanQ >= 0 && row.meanQ <= 1,
      "finite dimensionless solar coefficients"
    );
    requireValid(
      [row.cos1Q, row.sin1Q, row.cos2Q, row.sin2Q].every((value) => Math.abs(value) <= 2),
      "bounded daily-mean solar harmonics"
    );
  }
  for (let cell = 0; cell < size; cell++) {
    requireValid(
      (input.landMask[cell] === 0 || input.landMask[cell] === 1) &&
        Number.isFinite(input.elevation[cell]) &&
        Number.isFinite(input.sstC[cell]),
      "binary land identity and finite ground/SST"
    );
  }

  const harmonics = input.solarByRow.map((row) => thermalHarmonics(row, options.annualOffsetC));
  const denseByRow = harmonics.map((row) =>
    Array.from({ length: annualQuadratureCount }, (_, sample) =>
      evaluate(row, (sample + 0.5) / annualQuadratureCount)
    )
  );
  const rawSamplesByRow = harmonics.map((row) => phases.map((phase) => evaluate(row, phase)));
  const samples = phases.map(() => ({
    seaLevelTemperatureC: new Float32Array(size),
    surfaceTemperatureC: new Float32Array(size),
  }));
  const meanSeaLevelTemperatureC = new Float32Array(size);
  const annualSurfaceTemperatureC = new Float32Array(size);
  const annualUnclippedSurfaceTemperatureC = new Float32Array(size);
  const annualClippingDeltaC = new Float32Array(size);
  for (let cell = 0; cell < size; cell++) {
    const row = Math.floor(cell / width);
    const land = input.landMask[cell] === 1;
    const lapse = land
      ? Math.max(0, input.elevation[cell]! - input.seaLevel) * options.lapseRateCPerElevationUnit
      : 0;
    let pressureMean = 0;
    for (let phase = 0; phase < phases.length; phase++) {
      const raw = land ? rawSamplesByRow[row]![phase]! : input.sstC[cell]!;
      const sample = samples[phase]!;
      sample.seaLevelTemperatureC[cell] = clampNumber(raw, options.minC, options.maxC);
      sample.surfaceTemperatureC[cell] = clampNumber(raw + lapse, options.minC, options.maxC);
      pressureMean += weights[phase]! * sample.seaLevelTemperatureC[cell]!;
    }
    meanSeaLevelTemperatureC[cell] = pressureMean;
    let clippedSum = 0,
      rawSum = 0;
    for (const rawSeaLevel of denseByRow[row]!) {
      const rawGround = land ? rawSeaLevel + lapse : input.sstC[cell]!;
      rawSum += rawGround;
      clippedSum += clampNumber(rawGround, options.minC, options.maxC);
    }
    const rawMean = rawSum / annualQuadratureCount;
    const clippedMean = clippedSum / annualQuadratureCount;
    annualSurfaceTemperatureC[cell] = clippedMean;
    annualUnclippedSurfaceTemperatureC[cell] = rawMean;
    annualClippingDeltaC[cell] = clippedMean - rawMean;
  }
  return {
    samples,
    meanSeaLevelTemperatureC,
    annualSurfaceTemperatureC,
    annualUnclippedSurfaceTemperatureC,
    annualClippingDeltaC,
  };
}
