/** Lowest value representable by signed 16-bit MapGen height and distance buffers. */
export const INT16_MIN = -32768;

/** Highest value representable by signed 16-bit MapGen height and distance buffers. */
export const INT16_MAX = 32767;

/**
 * Saturates finite values to the signed 16-bit range and maps non-finite input to `0`.
 * Fractional values are preserved; callers that materialize an integer buffer must round separately.
 */
export function clampInt16(value: number): number {
  if (!Number.isFinite(value)) return 0;
  if (value > INT16_MAX) return INT16_MAX;
  if (value < INT16_MIN) return INT16_MIN;
  return value;
}

/**
 * Rounds finite values to the nearest integer with exact half ties moving away from zero.
 * Non-finite input becomes `0`, keeping signed height materialization deterministic across runtimes.
 */
export function roundHalfAwayFromZero(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return value >= 0 ? Math.floor(value + 0.5) : Math.ceil(value - 0.5);
}
