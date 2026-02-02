export const INT16_MIN = -32768;
export const INT16_MAX = 32767;

export function clampInt16(value: number): number {
  if (!Number.isFinite(value)) return 0;
  if (value > INT16_MAX) return INT16_MAX;
  if (value < INT16_MIN) return INT16_MIN;
  return value;
}

export function roundHalfAwayFromZero(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return value >= 0 ? Math.floor(value + 0.5) : Math.ceil(value - 0.5);
}

