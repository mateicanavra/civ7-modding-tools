/**
 * Encodes `(x, y)` as a row-major index without bounds checks or wrapping.
 * Callers must supply coordinates admitted for the same `width` used to decode the result.
 */
export function idx(x: number, y: number, width: number): number {
  return y * width + x;
}

/**
 * Decodes a row-major index into a fresh coordinate record using modulo and floor division.
 * No bounds or positive-width validation is performed.
 */
export function xyFromIndex(index: number, width: number): { x: number; y: number } {
  return { x: index % width, y: Math.floor(index / width) };
}
