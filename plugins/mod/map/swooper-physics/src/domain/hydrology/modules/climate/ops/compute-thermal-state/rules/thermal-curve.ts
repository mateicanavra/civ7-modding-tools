import type { SolarHarmonics } from "../../../model/atoms/solar-harmonics.schema.js";
import { dailyMeanSolarQ } from "../../../model/policy/daily-solar.js";
import { EARTH_PERIODIC_RESPONSE } from "../../../model/policy/earth-periodic-response.js";
import { clampNumber } from "./index.js";

/** Frozen seasonal evidence shared only by this operation's private curve and integration rules. */
export type RegionalResponse = Readonly<{
  gainC: number;
  phases: readonly number[];
  precipitationByPhase: readonly ArrayLike<number>[];
  demandByPhase: readonly (readonly number[])[];
  latitudeByRow: ArrayLike<number>;
  axialTiltDeg: number;
  tMinC: number;
  tMaxC: number;
}>;
type ThermalHarmonics = Readonly<{
  mean: number;
  cos1: number;
  sin1: number;
  cos2: number;
  sin2: number;
}>;
type RegionalRow = Readonly<{
  response: RegionalResponse;
  width: number;
  row: number;
  landMask: ArrayLike<number>;
  lapseByColumn: ArrayLike<number>;
  minC: number;
  maxC: number;
}>;
type RegionalWorking = Readonly<{
  activity: Float64Array;
  limitation: Float64Array;
  anomaly: Float64Array;
}>;

/** Converts solar harmonics to the incumbent raw sea-level thermal curve once per row. */
export function thermalHarmonics(solar: Readonly<SolarHarmonics>, offset: number): ThermalHarmonics {
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

/** Evaluates the equinox-relative incumbent sea-level curve before lapse or clipping. */
export function evaluateThermalSeaLevel(harmonics: ThermalHarmonics, phaseTurns: number): number {
  const phase = 2 * Math.PI * phaseTurns;
  return (
    harmonics.mean +
    harmonics.cos1 * Math.cos(phase) +
    harmonics.sin1 * Math.sin(phase) +
    harmonics.cos2 * Math.cos(2 * phase) +
    harmonics.sin2 * Math.sin(2 * phase)
  );
}

function interpolateNonnegative(lower: number, upper: number, fraction: number): number {
  // Add to the smaller endpoint: avoid cancellation or underflow turning positive demand into zero.
  return lower <= upper ? lower + fraction * (upper - lower)
    : upper + (1 - fraction) * (lower - upper);
}

/**
 * Interpolates frozen evidence, then gates and centers against the unchanged ground curve.
 * Writes activity, limitation and anomaly into reusable row storage and returns that anomaly buffer.
 */
export function evaluateRegionalRowAnomaly(
  input: RegionalRow,
  phaseTurns: number,
  incumbentRawSeaLevelC: number,
  working: RegionalWorking
): Float64Array {
  const { response, width, row } = input;
  const count = response.phases.length;
  let lower = count - 1;
  for (let source = 0; source < count; source++) {
    if (response.phases[source]! > phaseTurns) break;
    lower = source;
  }
  const upper = (lower + 1) % count;
  const start = response.phases[lower]!;
  const end = response.phases[upper]! + (upper === 0 ? 1 : 0);
  const phase = phaseTurns < start ? phaseTurns + 1 : phaseTurns;
  const fraction = (phase - start) / (end - start);
  const q = dailyMeanSolarQ(
    response.latitudeByRow[row]!, response.axialTiltDeg * Math.sin(2 * Math.PI * phaseTurns)
  );
  let activitySum = 0, weightedLimitationSum = 0;
  for (let column = 0; column < width; column++) {
    const cell = row * width + column;
    const d0 = response.demandByPhase[lower]![cell]!;
    const demand = interpolateNonnegative(d0, response.demandByPhase[upper]![cell]!, fraction);
    const p0 = response.precipitationByPhase[lower]![cell]!;
    const precipitation = interpolateNonnegative(p0, response.precipitationByPhase[upper]![cell]!, fraction);
    // The private zero-demand rule is inactive; enabled admission excludes its discontinuous boundary on land.
    const limitation = demand <= 0 || precipitation >= demand ? 0 : 1 - precipitation / demand;
    const incumbentGroundC = clampNumber(
      incumbentRawSeaLevelC + input.lapseByColumn[column]!, input.minC, input.maxC
    );
    const activity = input.landMask[cell] === 1 && demand > 0
      ? q * clampNumber((incumbentGroundC - response.tMinC) / (response.tMaxC - response.tMinC), 0, 1)
      : 0;
    working.activity[column] = activity;
    working.limitation[column] = limitation;
    activitySum += activity;
    weightedLimitationSum += activity * limitation;
  }
  const reference = activitySum > 0 ? weightedLimitationSum / activitySum : 0;
  for (let column = 0; column < width; column++) {
    working.anomaly[column] = working.activity[column] === 0 ? 0
      : response.gainC * working.activity[column]! * (working.limitation[column]! - reference);
  }
  return working.anomaly;
}
