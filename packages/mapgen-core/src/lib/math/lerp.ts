/**
 * Evaluates the linear blend from `a` to `b` at `t`.
 * `t` is intentionally not clamped, allowing callers to extrapolate beyond either endpoint.
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}
