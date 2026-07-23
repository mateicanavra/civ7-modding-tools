/** Absolute floor required before rifting may reset a cell's tectonic lineage. */
export const RIFT_RESET_THRESHOLD_MIN = 1;
/** Absolute floor required before arc activity may reset a cell's tectonic lineage. */
export const ARC_RESET_THRESHOLD_MIN = 1;
/** Absolute floor required before hotspot activity may reset a cell's tectonic lineage. */
export const HOTSPOT_RESET_THRESHOLD_MIN = 1;

/** Fraction of the strongest rift signal admitted as a lineage-reset threshold. */
export const RIFT_RESET_THRESHOLD_FRAC_OF_MAX = 0.6;
/** Fraction of the strongest arc signal admitted as a lineage-reset threshold. */
export const ARC_RESET_THRESHOLD_FRAC_OF_MAX = 0.75;
/** Fraction of the strongest hotspot signal admitted as a lineage-reset threshold. */
export const HOTSPOT_RESET_THRESHOLD_FRAC_OF_MAX = 0.8;

/**
 * Derives a byte-domain reset threshold from the stronger of an absolute floor and field-relative signal.
 * This keeps provenance stable across maps whose tectonic intensity ranges differ materially.
 */
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
