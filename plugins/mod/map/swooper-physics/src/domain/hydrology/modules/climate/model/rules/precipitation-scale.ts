import { clamp } from "@swooper/mapgen-core/lib/math";

const MIN_RAINFALL = 0;
const MAX_RAINFALL = 200;
const MAX_HUMIDITY = 255;

/**
 * Enforces the climate model's `0..200` rainfall scale before byte encoding.
 *
 * @param rainfall - Candidate rainfall after moisture, terrain, and local modifiers.
 * @returns Rainfall constrained to the authored physical scale.
 */
export function clampRainfall(rainfall: number): number {
  return clamp(rainfall, MIN_RAINFALL, MAX_RAINFALL);
}

/**
 * Projects the authored rainfall scale onto the full byte-valued humidity evidence range.
 *
 * @param rainfall - Rainfall on the `0..200` precipitation scale; outliers are clamped first.
 * @returns Rounded humidity in the `0..255` artifact representation.
 */
export function rainfallToHumidityU8(rainfall: number): number {
  const admittedRainfall = clampRainfall(rainfall);
  return Math.round((admittedRainfall / MAX_RAINFALL) * MAX_HUMIDITY);
}
