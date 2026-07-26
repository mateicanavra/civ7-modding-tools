import { clamp01 } from "@swooper/mapgen-core/lib/math";

/**
 * Converts an encoded belt driver into the shaped unit strength shared by landform planners.
 *
 * Values at or below the configured signal floor are suppressed; the remaining byte range is
 * renormalized before exponent shaping so ridges, foothills, and rough lands use one policy.
 *
 * @param params - Encoded driver value, admission floor, and response-curve exponent.
 * @returns A clamped strength in the inclusive `0..1` domain.
 */
export function resolveDriverStrength(params: {
  driverByte: number;
  driverSignalByteMin: number;
  driverExponent: number;
}): number {
  const driverByte = params.driverByte | 0;
  const driverMin = Math.max(0, Math.min(255, Math.round(params.driverSignalByteMin))) | 0;
  if (driverByte <= driverMin) return 0;
  const denom = Math.max(1, 255 - driverMin);
  const normalized = (driverByte - driverMin) / denom;
  const exponent = Math.max(0.01, params.driverExponent);
  return Math.pow(clamp01(normalized), exponent);
}
