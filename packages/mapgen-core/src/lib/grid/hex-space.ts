import { wrapDeltaPeriodic } from "@mapgen/lib/math/wrap.js";

export const HEX_WIDTH = Math.sqrt(3);
export const HEX_HEIGHT = 1.5;
export const HALF_HEX_HEIGHT = HEX_HEIGHT / 2;
export const HALF_HEX_WIDTH = HEX_WIDTH / 2;

/**
 * Convert pointy-top, row-offset (odd-R) tile coordinates to "hex space".
 *
 * The Civ7 plot grid is odd-R: ODD ROWS are shifted half a tile east. This is
 * the canonical coordinate system for mesh-first computations:
 * - X scaled by `HEX_WIDTH` and offset by `HALF_HEX_WIDTH` for odd rows
 * - Y scaled by `HEX_HEIGHT`
 *
 * NOTE: the `Oddq` symbol name is legacy (the grid was historically and
 * incorrectly modeled as odd-Q); the math below is odd-R.
 */
export function projectOddqToHexSpace(x: number, y: number): { x: number; y: number } {
  const hx = x * HEX_WIDTH + (Math.floor(y) & 1 ? HALF_HEX_WIDTH : 0);
  const hy = y * HEX_HEIGHT;
  return { x: hx, y: hy };
}

export type CubeCoord = Readonly<{ x: number; y: number; z: number }>;

/**
 * Convert odd-R offset coordinates to cube coordinates.
 *
 * NOTE: legacy `oddqToCube` name; the math is odd-R (`q = x - (y - (y&1))/2`).
 */
export function oddqToCube(x: number, y: number): CubeCoord {
  const q = x - (y - (y & 1)) / 2;
  const xCube = q;
  const zCube = y;
  const yCube = -xCube - zCube;
  return { x: xCube, y: yCube, z: zCube };
}

/**
 * Computes symmetric graph distance between odd-R row-major plots on a periodic-X grid.
 *
 * Plot indices must be nonnegative safe integers and `width` must be a positive safe integer. Y does not
 * wrap. The result is the nonnegative integer distance implied by canonical hex adjacency.
 * Neighboring periodic images are compared because even-width half-wrap ties can have different
 * cube distances after the row-parity offset is applied.
 *
 * @throws {RangeError} When either plot index or the grid width is not a valid safe integer.
 */
export function hexDistanceOddQPeriodicX(aIndex: number, bIndex: number, width: number): number {
  if (
    !Number.isSafeInteger(aIndex) ||
    aIndex < 0 ||
    !Number.isSafeInteger(bIndex) ||
    bIndex < 0 ||
    !Number.isSafeInteger(width) ||
    width <= 0
  ) {
    throw new RangeError(
      `hexDistanceOddQPeriodicX requires nonnegative safe-integer indices and a positive safe-integer width; received ${aIndex}, ${bIndex}, width ${width}.`
    );
  }
  const ay = Math.floor(aIndex / width);
  const ax = aIndex - ay * width;
  const by = Math.floor(bIndex / width);
  const bx = bIndex - by * width;
  const aCube = oddqToCube(ax, ay);
  const wrappedBx = ax + wrapDeltaPeriodic(bx - ax, width);
  let minimum = Number.POSITIVE_INFINITY;

  // Even-width half-wrap ties have two equally short X deltas, but row parity can make
  // their cube distances differ. Check the neighboring periodic images rather than
  // allowing wrapDeltaPeriodic's tie direction to choose the hex path.
  for (const imageX of [wrappedBx - width, wrappedBx, wrappedBx + width]) {
    const bCube = oddqToCube(imageX, by);
    minimum = Math.min(
      minimum,
      Math.max(
        Math.abs(aCube.x - bCube.x),
        Math.abs(aCube.y - bCube.y),
        Math.abs(aCube.z - bCube.z)
      )
    );
  }

  return minimum;
}
