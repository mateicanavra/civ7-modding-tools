import { wrapDeltaPeriodic } from "@mapgen/lib/math/wrap.js";

export const HEX_WIDTH = Math.sqrt(3);
export const HEX_HEIGHT = 1.5;
export const HALF_HEX_HEIGHT = HEX_HEIGHT / 2;

/**
 * Convert odd-q offset coordinates (tile space) to "hex space" coordinates.
 *
 * This is the canonical coordinate system for mesh-first computations:
 * - X scaled by `HEX_WIDTH`
 * - Y scaled by `HEX_HEIGHT` and offset by `HALF_HEX_HEIGHT` for odd columns
 */
export function projectOddqToHexSpace(x: number, y: number): { x: number; y: number } {
  const hx = x * HEX_WIDTH;
  const hy = y * HEX_HEIGHT + ((Math.floor(x) & 1) ? HALF_HEX_HEIGHT : 0);
  return { x: hx, y: hy };
}

export type CubeCoord = Readonly<{ x: number; y: number; z: number }>;

export function oddqToCube(x: number, y: number): CubeCoord {
  const z = y - (x - (x & 1)) / 2;
  const xCube = x;
  const zCube = z;
  const yCube = -xCube - zCube;
  return { x: xCube, y: yCube, z: zCube };
}

/**
 * Hex distance for odd-q row-major indices on a map with periodic X wrapping.
 */
export function hexDistanceOddQPeriodicX(aIndex: number, bIndex: number, width: number): number {
  const ay = (aIndex / width) | 0;
  const ax = aIndex - ay * width;
  const by = (bIndex / width) | 0;
  const bx = bIndex - by * width;
  const wrappedBx = ax + wrapDeltaPeriodic(bx - ax, width);
  const aCube = oddqToCube(ax, ay);
  const bCube = oddqToCube(wrappedBx, by);
  return Math.max(
    Math.abs(aCube.x - bCube.x),
    Math.abs(aCube.y - bCube.y),
    Math.abs(aCube.z - bCube.z)
  );
}
