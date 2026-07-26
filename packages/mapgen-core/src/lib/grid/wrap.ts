/**
 * Normalizes a horizontal coordinate into `[0, width)` for a positive width, including negative X.
 * Width is not validated, so callers must provide an admitted finite grid width.
 */
export function wrapX(x: number, width: number): number {
  return ((x % width) + width) % width;
}
