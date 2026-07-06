export const RIFT_RESET_THRESHOLD_MIN = 1;
export const ARC_RESET_THRESHOLD_MIN = 1;
export const HOTSPOT_RESET_THRESHOLD_MIN = 1;

export const RIFT_RESET_THRESHOLD_FRAC_OF_MAX = 0.6;
export const ARC_RESET_THRESHOLD_FRAC_OF_MAX = 0.75;
export const HOTSPOT_RESET_THRESHOLD_FRAC_OF_MAX = 0.8;

export function deriveResetThreshold(
  maxValue: number,
  fracOfMax: number,
  minThreshold: number
): number {
  const maxByte = Math.max(0, Math.min(255, maxValue | 0)) | 0;
  const frac = Number.isFinite(fracOfMax) ? Math.max(0, Math.min(1, fracOfMax)) : 0;
  const derived = Math.round(maxByte * frac) | 0;

  // Keep the floor bounded by the actual per-era maxima so a zero-signal era
  // does not force impossible reset thresholds.
  const minByte = Math.max(0, Math.min(255, minThreshold | 0)) | 0;
  const floor = Math.min(maxByte, minByte) | 0;
  return Math.max(floor, derived) | 0;
}
