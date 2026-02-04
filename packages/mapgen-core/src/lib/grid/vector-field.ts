import { clampInt } from "@mapgen/lib/math/clamp.js";
import { projectOddqToHexSpace } from "@mapgen/lib/grid/hex-space.js";

export type Vec2 = Readonly<{ x: number; y: number }>;

export const I8_VECTOR_MAX_ABS = 127;

const OFFSETS_ODD: readonly (readonly [number, number])[] = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
  [-1, 1],
  [1, 1],
];

const OFFSETS_EVEN: readonly (readonly [number, number])[] = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
  [-1, -1],
  [1, -1],
];

export function vec2(x: number, y: number): Vec2 {
  return { x, y };
}

export function vec2Dot(a: Vec2, b: Vec2): number {
  return a.x * b.x + a.y * b.y;
}

export function vec2CrossZ(a: Vec2, b: Vec2): number {
  return a.x * b.y - a.y * b.x;
}

export function vec2LengthSquared(v: Vec2): number {
  return v.x * v.x + v.y * v.y;
}

export function vec2Length(v: Vec2): number {
  return Math.sqrt(vec2LengthSquared(v));
}

export function vec2Normalize(v: Vec2, fallback: Vec2 = { x: 0, y: 0 }): Vec2 {
  const len = vec2Length(v);
  if (!Number.isFinite(len) || len <= 1e-12) return fallback;
  return { x: v.x / len, y: v.y / len };
}

export function vec2Scale(v: Vec2, s: number): Vec2 {
  return { x: v.x * s, y: v.y * s };
}

export function vec2Add(a: Vec2, b: Vec2): Vec2 {
  return { x: a.x + b.x, y: a.y + b.y };
}

export function vec2Sub(a: Vec2, b: Vec2): Vec2 {
  return { x: a.x - b.x, y: a.y - b.y };
}

/**
 * Quantize a scalar to a signed i8 in [-127..127], given a max-abs scale.
 *
 * Example:
 * - `maxAbs = 1`: value is treated as in [-1..1]
 * - `maxAbs = 80`: value is treated as in [-80..80]
 */
export function quantizeI8Signed(value: number, maxAbs: number): number {
  if (!Number.isFinite(value) || !Number.isFinite(maxAbs) || maxAbs <= 0) return 0;
  const scaled = Math.round((value / maxAbs) * I8_VECTOR_MAX_ABS);
  return clampInt(scaled, -I8_VECTOR_MAX_ABS, I8_VECTOR_MAX_ABS);
}

export function dequantizeI8Signed(value: number, maxAbs: number): number {
  if (!Number.isFinite(value) || !Number.isFinite(maxAbs) || maxAbs <= 0) return 0;
  return (Math.trunc(value) / I8_VECTOR_MAX_ABS) * maxAbs;
}

/**
 * Neighbor direction vectors (in hex space) from a tile center to each of its 6 neighbors.
 *
 * Notes:
 * - Uses odd-q projection (`projectOddqToHexSpace`).
 * - Returns vectors in a stable, deterministic order matching the neighbor offset table.
 */
function computeHexNeighborDirectionVectorsOddQ(baseX: number, offsets: readonly (readonly [number, number])[]): readonly Vec2[] {
  const base = projectOddqToHexSpace(baseX, 0);
  return offsets.map(([dx, dy]) => {
    const p = projectOddqToHexSpace(baseX + dx, dy);
    return { x: p.x - base.x, y: p.y - base.y };
  });
}

const HEX_NEIGHBOR_DIRS_EVEN = computeHexNeighborDirectionVectorsOddQ(0, OFFSETS_EVEN);
const HEX_NEIGHBOR_DIRS_ODD = computeHexNeighborDirectionVectorsOddQ(1, OFFSETS_ODD);

export function getHexNeighborDirectionVectorsOddQ(isOddCol: boolean): readonly Vec2[] {
  return isOddCol ? HEX_NEIGHBOR_DIRS_ODD : HEX_NEIGHBOR_DIRS_EVEN;
}

/**
 * Choose the best-matching neighbor direction for a velocity vector (in hex space).
 * Returns the neighbor direction index [0..5].
 */
export function bestHexNeighborDirectionIndexOddQ(velocity: Vec2, isOddCol: boolean): number {
  const dirs = getHexNeighborDirectionVectorsOddQ(isOddCol);
  const vHat = vec2Normalize(velocity);
  let best = 0;
  let bestDot = -Infinity;
  for (let k = 0; k < dirs.length; k++) {
    const dHat = vec2Normalize(dirs[k]);
    const score = vec2Dot(vHat, dHat);
    if (score > bestDot) {
      bestDot = score;
      best = k;
    }
  }
  return best;
}

/**
 * Estimate divergence at each tile from a vector field sampled at tile centers.
 *
 * The estimator is a simple symmetric finite-difference in hex space, intended
 * for diagnostics and bounded relaxation/projection steps (not a CFD reference).
 */
export function estimateDivergenceOddQ(
  width: number,
  height: number,
  fieldX: Float32Array,
  fieldY: Float32Array
): Float32Array {
  const size = Math.max(0, width * height);
  const out = new Float32Array(size);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      const isOdd = (x & 1) === 1;
      const dirs = getHexNeighborDirectionVectorsOddQ(isOdd);
      const offsets = isOdd ? OFFSETS_ODD : OFFSETS_EVEN;

      const vx = fieldX[i] ?? 0;
      const vy = fieldY[i] ?? 0;

      let acc = 0;
      let w = 0;
      for (let k = 0; k < offsets.length; k++) {
        const [dx, dy] = offsets[k];
        const nx = (x + dx + width) % width;
        const ny = y + dy;
        if (ny < 0 || ny >= height) continue;
        const j = ny * width + nx;

        const dvx = (fieldX[j] ?? 0) - vx;
        const dvy = (fieldY[j] ?? 0) - vy;
        const d = dirs[k];
        const denom = vec2LengthSquared(d);
        if (denom <= 1e-12) continue;
        acc += (dvx * d.x + dvy * d.y) / denom;
        w += 1;
      }

      out[i] = w > 0 ? acc / w : 0;
    }
  }

  return out;
}

/**
 * Estimate z-curl (scalar) at each tile from a vector field in hex space.
 *
 * Same intent as `estimateDivergenceOddQ`: diagnostics + bounded relax steps.
 */
export function estimateCurlZOddQ(
  width: number,
  height: number,
  fieldX: Float32Array,
  fieldY: Float32Array
): Float32Array {
  const size = Math.max(0, width * height);
  const out = new Float32Array(size);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      const isOdd = (x & 1) === 1;
      const dirs = getHexNeighborDirectionVectorsOddQ(isOdd);
      const offsets = isOdd ? OFFSETS_ODD : OFFSETS_EVEN;

      const vx = fieldX[i] ?? 0;
      const vy = fieldY[i] ?? 0;

      let acc = 0;
      let w = 0;
      for (let k = 0; k < offsets.length; k++) {
        const [dx, dy] = offsets[k];
        const nx = (x + dx + width) % width;
        const ny = y + dy;
        if (ny < 0 || ny >= height) continue;
        const j = ny * width + nx;

        const dvx = (fieldX[j] ?? 0) - vx;
        const dvy = (fieldY[j] ?? 0) - vy;
        const d = dirs[k];
        const denom = vec2LengthSquared(d);
        if (denom <= 1e-12) continue;
        acc += vec2CrossZ({ x: dvx, y: dvy }, d) / denom;
        w += 1;
      }

      out[i] = w > 0 ? acc / w : 0;
    }
  }

  return out;
}
