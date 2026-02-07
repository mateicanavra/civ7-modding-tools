export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function clamp01(value: number): number {
  return clamp(value, 0, 1);
}

export function clampInt(value: number, min: number, max: number): number {
  const v = Math.trunc(value);
  if (!Number.isFinite(v)) return min;
  return clamp(v, min, max);
}

/**
 * Clamp a value into an unsigned byte (0..255) and coerce to an integer.
 *
 * Notes:
 * - This is intentionally used across the pipeline to avoid dozens of ad-hoc
 *   `clampByte` helpers that silently differ in rounding and NaN handling.
 */
export function clampU8(value: number): number {
  const v = Math.trunc(value);
  if (!Number.isFinite(v)) return 0;
  return clamp(v, 0, 255);
}

export function clampPct(value: number, min: number, max: number, fallback: number = min): number {
  if (!Number.isFinite(value)) return fallback;
  return clamp(value, min, max);
}

export function clampFinite(
  value: number,
  min: number,
  max: number = Number.POSITIVE_INFINITY,
  fallback: number = min
): number {
  if (!Number.isFinite(value)) return fallback;
  return clamp(value, min, max);
}
