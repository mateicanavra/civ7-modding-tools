import { forEachHexNeighborOddQ } from "@swooper/mapgen-core/lib/grid";

/**
 * Returns true when `values[i]` is a strict local maximum over its hex neighbors.
 *
 * Tie-breaking is deterministic: if a neighbor has the same value, only the lowest index in that
 * plateau is allowed to be considered a maximum. This prevents "multiple seed" artifacts when a
 * driver field is locally flat.
 */
export function isStrictLocalMaximumHexWithTies(params: {
  i: number;
  width: number;
  height: number;
  values: ArrayLike<number>;
  mask?: Uint8Array;
}): boolean {
  const { i, width, height, values, mask } = params;
  if (mask && mask[i] === 0) return false;
  const v = values[i] ?? 0;
  if (!(v > 0)) return false;

  const x = i % width;
  const y = Math.floor(i / width);
  let ok = true;
  forEachHexNeighborOddQ(x, y, width, height, (nx, ny) => {
    const ni = ny * width + nx;
    if (mask && mask[ni] === 0) return;
    const nv = values[ni] ?? 0;
    if (nv > v) ok = false;
    if (nv === v && ni < i) ok = false;
  });

  return ok;
}

