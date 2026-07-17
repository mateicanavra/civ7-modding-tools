/**
 * Climate comfort policy for start scoring (placement-realignment S4, E1.8).
 *
 * E1.8 measures the share of starts inside the top land ARIDITY decile or the
 * outer land TEMPERATURE deciles, with deciles computed over land tiles. The
 * comfort component therefore grounds itself in the same land-decile frame:
 * thresholds are land-rank-relative (precedent: S3 rank-relative habitat
 * lanes), so the policy self-calibrates to uncalibrated pipeline fields
 * instead of assuming absolute units.
 *
 * comfort = min(aridityComfort, temperatureComfort) where each comfort ramps
 * 1→0 across the decile adjacent to the extreme decile, hitting 0 exactly at
 * the extreme-decile boundary E1.8 measures.
 */

export type ClimateComfortThresholds = {
  aridityP80: number;
  aridityP90: number;
  temperatureP10: number;
  temperatureP20: number;
  temperatureP80: number;
  temperatureP90: number;
};

function quantileSorted(sorted: readonly number[], q: number): number {
  if (!sorted.length) return 0;
  const pos = (sorted.length - 1) * Math.min(1, Math.max(0, q));
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  const loValue = sorted[lo]!;
  const hiValue = sorted[hi]!;
  return loValue + (hiValue - loValue) * (pos - lo);
}

/**
 * Derives land-relative aridity and temperature deciles for start comfort scoring. Returns
 * null when either climate field or land samples are unavailable; otherwise thresholds are
 * deterministic quantiles over land tiles only.
 */
export function computeClimateComfortThresholds(args: {
  landMask: Uint8Array;
  aridityIndex?: Float32Array;
  surfaceTemperature?: Float32Array;
}): ClimateComfortThresholds | null {
  if (!args.aridityIndex || !args.surfaceTemperature) return null;
  const aridity: number[] = [];
  const temperature: number[] = [];
  for (let i = 0; i < args.landMask.length; i++) {
    if (args.landMask[i] !== 1) continue;
    aridity.push(args.aridityIndex[i] ?? 0);
    temperature.push(args.surfaceTemperature[i] ?? 0);
  }
  if (!aridity.length) return null;
  aridity.sort((a, b) => a - b);
  temperature.sort((a, b) => a - b);
  return {
    aridityP80: quantileSorted(aridity, 0.8),
    aridityP90: quantileSorted(aridity, 0.9),
    temperatureP10: quantileSorted(temperature, 0.1),
    temperatureP20: quantileSorted(temperature, 0.2),
    temperatureP80: quantileSorted(temperature, 0.8),
    temperatureP90: quantileSorted(temperature, 0.9),
  };
}

function rampDown(value: number, comfortable: number, extreme: number): number {
  if (value <= comfortable) return 1;
  if (value >= extreme) return 0;
  const span = extreme - comfortable;
  return span > 0 ? 1 - (value - comfortable) / span : 0;
}

function rampUp(value: number, extreme: number, comfortable: number): number {
  if (value >= comfortable) return 1;
  if (value <= extreme) return 0;
  const span = comfortable - extreme;
  return span > 0 ? (value - extreme) / span : 0;
}

/** Climate comfort (0..1) for one tile; 0 means inside an E1.8 extreme decile. */
export function climateComfortAt(
  thresholds: ClimateComfortThresholds,
  aridity: number,
  temperature: number
): number {
  const aridityComfort = rampDown(aridity, thresholds.aridityP80, thresholds.aridityP90);
  const coldComfort = rampUp(temperature, thresholds.temperatureP10, thresholds.temperatureP20);
  const heatComfort = rampDown(temperature, thresholds.temperatureP80, thresholds.temperatureP90);
  return Math.min(aridityComfort, coldComfort, heatComfort);
}

/**
 * True when the tile sits inside an E1.8 extreme land decile. Degenerate
 * distributions (no spread between the adjacent deciles, e.g. uniform test
 * fields) define no extremes — a flat climate has no climate-extreme tail.
 */
export function isClimateExtreme(
  thresholds: ClimateComfortThresholds,
  aridity: number,
  temperature: number
): boolean {
  const aridityExtreme =
    thresholds.aridityP90 > thresholds.aridityP80 && aridity >= thresholds.aridityP90;
  const coldExtreme =
    thresholds.temperatureP10 < thresholds.temperatureP20 &&
    temperature <= thresholds.temperatureP10;
  const heatExtreme =
    thresholds.temperatureP90 > thresholds.temperatureP80 &&
    temperature >= thresholds.temperatureP90;
  return aridityExtreme || coldExtreme || heatExtreme;
}
