import type { SolarHarmonics } from "../../../model/atoms/solar-harmonics.schema.js";
import { clampNumber } from "./index.js";
import {
  evaluateRegionalRowAnomaly,
  evaluateThermalSeaLevel,
  type RegionalResponse,
  thermalHarmonics,
} from "./thermal-curve.js";

/** Fixed midpoint resolution for independent annual integration of clipped periodic temperatures. */
const ANNUAL_THERMAL_QUADRATURE_COUNT = 384;

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
  regionalResponse?: RegionalResponse;
}>;
type Options = Readonly<{
  annualOffsetC: number;
  lapseRateCPerElevationUnit: number;
  minC: number;
  maxC: number;
}>;

function requireValid(value: unknown, message: string): asserts value {
  if (!value) throw new RangeError(`Invalid periodic thermal input: ${message}.`);
}

function requireRegionalResponse(input: Params, response: RegionalResponse): void {
  const size = input.width * input.height;
  requireValid(
    Number.isFinite(response.gainC) && response.gainC >= 0 &&
      Number.isFinite(response.tMinC) && Number.isFinite(response.tMaxC) &&
      response.tMinC < response.tMaxC &&
      Number.isFinite(response.axialTiltDeg) && response.axialTiltDeg >= 0 && response.axialTiltDeg <= 90,
    "finite regional gain, tilt and ordered activity bounds"
  );
  requireValid(
    response.latitudeByRow.length === input.height &&
      Array.from(response.latitudeByRow).every((latitude) => Number.isFinite(latitude) && Math.abs(latitude) <= 90),
    "regional latitude registration"
  );
  const count = response.phases.length;
  requireValid(
    count > 0 && response.precipitationByPhase.length === count && response.demandByPhase.length === count,
    "aligned nonempty regional source calendar"
  );
  requireValid(
    response.gainC === 0 ||
      (input.phases.length === count && input.phases.every((phase, index) => phase === response.phases[index])),
    "enabled regional response requires requested phases to exactly match producer phases"
  );
  for (let phase = 0; phase < count; phase++) {
    const current = response.phases[phase]!;
    const next = phase + 1 < count ? response.phases[phase + 1]! : response.phases[0]! + 1;
    requireValid(
      Number.isFinite(current) && current >= 0 && current < 1 && next > current &&
        Math.abs(next - current - 1 / count) <= 64 * Number.EPSILON,
      "sorted uniform cyclic regional source phases"
    );
    const precipitation = response.precipitationByPhase[phase]!;
    const demand = response.demandByPhase[phase]!;
    requireValid(precipitation.length === size && demand.length === size, "regional map-grid cardinality");
    for (let cell = 0; cell < size; cell++) {
      requireValid(
        Number.isFinite(precipitation[cell]) && precipitation[cell]! >= 0 &&
          Number.isFinite(demand[cell]) && demand[cell]! >= 0,
        "finite nonnegative regional precipitation/demand"
      );
      requireValid(
        response.gainC === 0 || input.landMask[cell] !== 1 || demand[cell]! > 0,
        "enabled regional response requires strictly positive original-land source demand"
      );
    }
  }
}

/** Incumbent thermal curve with optional producer-phase response and a bounded annual ground proxy. */
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
  if (input.regionalResponse) requireRegionalResponse(input, input.regionalResponse);

  const harmonics = input.solarByRow.map((row) => thermalHarmonics(row, options.annualOffsetC));
  const denseByRow = harmonics.map((row) =>
    Array.from({ length: annualQuadratureCount }, (_, sample) =>
      evaluateThermalSeaLevel(row, (sample + 0.5) / annualQuadratureCount)
    )
  );
  const rawSamplesByRow = harmonics.map((row) => phases.map((phase) => evaluateThermalSeaLevel(row, phase)));
  const samples = phases.map(() => ({
    seaLevelTemperatureC: new Float32Array(size),
    surfaceTemperatureC: new Float32Array(size),
  }));
  const meanSeaLevelTemperatureC = new Float32Array(size);
  const annualSurfaceTemperatureC = new Float32Array(size);
  const annualUnclippedSurfaceTemperatureC = new Float32Array(size);
  const annualClippingDeltaC = new Float32Array(size);
  if (input.regionalResponse && input.regionalResponse.gainC > 0) {
    const response = input.regionalResponse;
    const working = {
      activity: new Float64Array(width),
      limitation: new Float64Array(width),
      anomaly: new Float64Array(width),
    };
    const lapseByColumn = new Float64Array(width);
    const rawSums = new Float64Array(width);
    const clippedSums = new Float64Array(width);
    const rawAnomalySums = new Float64Array(width);
    const clippedDepartureSums = new Float64Array(width);
    const hasAnomalyByColumn = new Uint8Array(width);
    const pressureMeans = new Float64Array(width);
    for (let row = 0; row < height; row++) {
      rawSums.fill(0);
      clippedSums.fill(0);
      rawAnomalySums.fill(0);
      clippedDepartureSums.fill(0);
      hasAnomalyByColumn.fill(0);
      pressureMeans.fill(0);
      for (let column = 0; column < width; column++) {
        const cell = row * width + column;
        lapseByColumn[column] = input.landMask[cell] === 1
          ? Math.max(0, input.elevation[cell]! - input.seaLevel) * options.lapseRateCPerElevationUnit
          : 0;
      }
      const regionalRow = { response, width, row, landMask: input.landMask, lapseByColumn,
        minC: options.minC, maxC: options.maxC };
      // Keep the independent dense incumbent baseline; P/D has no intermediate-phase representation.
      for (const raw of denseByRow[row]!) {
        for (let column = 0; column < width; column++) {
          const cell = row * width + column;
          const rawGround = input.landMask[cell] === 1
            ? raw + lapseByColumn[column]!
            : input.sstC[cell]!;
          rawSums[column]! += rawGround;
          clippedSums[column]! += clampNumber(rawGround, options.minC, options.maxC);
        }
      }
      for (let phase = 0; phase < phases.length; phase++) {
        const raw = rawSamplesByRow[row]![phase]!;
        const anomaly = evaluateRegionalRowAnomaly(regionalRow, phase, raw, working);
        const sample = samples[phase]!;
        for (let column = 0; column < width; column++) {
          const cell = row * width + column;
          const land = input.landMask[cell] === 1;
          if (anomaly[column] !== 0) hasAnomalyByColumn[column] = 1;
          const rawSeaLevel = land ? raw + anomaly[column]! : input.sstC[cell]!;
          const incumbentRawGround = land ? raw + lapseByColumn[column]! : input.sstC[cell]!;
          const correctedRawGround = incumbentRawGround + anomaly[column]!;
          const clippedGround = clampNumber(correctedRawGround, options.minC, options.maxC);
          sample.seaLevelTemperatureC[cell] = clampNumber(rawSeaLevel, options.minC, options.maxC);
          sample.surfaceTemperatureC[cell] = clippedGround;
          pressureMeans[column]! += weights[phase]! * sample.seaLevelTemperatureC[cell]!;
          rawAnomalySums[column]! += weights[phase]! * anomaly[column]!;
          clippedDepartureSums[column]! += weights[phase]! * (
            clippedGround - clampNumber(incumbentRawGround, options.minC, options.maxC)
          );
        }
      }
      for (let column = 0; column < width; column++) {
        const cell = row * width + column;
        const rawBaseline = rawSums[column]! / annualQuadratureCount;
        const clippedBaseline = clippedSums[column]! / annualQuadratureCount;
        const hasAnomaly = hasAnomalyByColumn[column] === 1;
        const rawAnnualProxy = hasAnomaly ? rawBaseline + rawAnomalySums[column]! : rawBaseline;
        // Exactly inert cells retain incumbent publications, including dense accumulation roundoff.
        // Aggregate saturation belongs to this proxy law, not a corrected continuous-cycle integral.
        const annualProxy = hasAnomaly ? clampNumber(
          clippedBaseline + clippedDepartureSums[column]!,
          options.minC, options.maxC
        ) : clippedBaseline;
        const clippingDelta = annualProxy - rawAnnualProxy;
        requireValid(
          Number.isFinite(Math.fround(annualProxy)) &&
            Number.isFinite(Math.fround(rawAnnualProxy)) && Number.isFinite(Math.fround(clippingDelta)),
          `regional annual diagnostics must be representable as finite Float32 at cell ${cell}`
        );
        meanSeaLevelTemperatureC[cell] = pressureMeans[column]!;
        annualSurfaceTemperatureC[cell] = annualProxy;
        annualUnclippedSurfaceTemperatureC[cell] = rawAnnualProxy;
        annualClippingDeltaC[cell] = clippingDelta;
      }
    }
  } else {
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
  }
  return {
    samples,
    meanSeaLevelTemperatureC,
    annualSurfaceTemperatureC,
    annualUnclippedSurfaceTemperatureC,
    annualClippingDeltaC,
  };
}
