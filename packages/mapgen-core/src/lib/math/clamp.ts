/**
 * Saturates a scalar to an inclusive, caller-ordered range.
 * Bounds are not reordered and `NaN` is not repaired.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Saturates a normalized scalar to `[0, 1]`.
 * Infinities reach their respective endpoints, while `NaN` remains `NaN`.
 */
export function clamp01(value: number): number {
  return clamp(value, 0, 1);
}

/**
 * Truncates a finite scalar toward zero and then clamps it to the supplied bounds.
 * Any non-finite input falls back to `min`.
 */
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

/**
 * Clamps a finite percentage-like value without rounding.
 * Any non-finite input uses the explicit fallback, which defaults to `min`.
 */
export function clampPct(value: number, min: number, max: number, fallback: number = min): number {
  if (!Number.isFinite(value)) return fallback;
  return clamp(value, min, max);
}

/**
 * Clamps a finite scalar to the supplied bounds and substitutes a fallback for non-finite input.
 * The upper bound defaults to positive infinity and the fallback defaults to `min`.
 */
export function clampFinite(
  value: number,
  min: number,
  max: number = Number.POSITIVE_INFINITY,
  fallback: number = min
): number {
  if (!Number.isFinite(value)) return fallback;
  return clamp(value, min, max);
}
