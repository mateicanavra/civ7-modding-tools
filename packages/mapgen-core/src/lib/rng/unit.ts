export type RngFn = (max: number, label: string) => number;

/**
 * Converts one labeled bounded-integer draw into a unit value at `1e-6` resolution.
 * The `[0, 1)` guarantee assumes `rng(max, label)` returns a nonnegative integer below `max`.
 */
export function rollUnit(rng: RngFn, label: string): number {
  const scale = 1_000_000;
  const roll = rng(scale, label);
  return (roll % scale) / scale;
}
