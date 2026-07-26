/**
 * Tests the half-open grid extent `[0, width) x [0, height)` without coercion or wrapping.
 * Bounded grid traversals use this when crossing either edge must discard the coordinate.
 */
export function inBounds(x: number, y: number, width: number, height: number): boolean {
  return x >= 0 && x < width && y >= 0 && y < height;
}
