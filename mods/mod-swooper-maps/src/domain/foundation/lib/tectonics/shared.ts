import { clamp01 as clamp01Core, clampInt, clampU8, wrapDeltaPeriodic } from "@swooper/mapgen-core/lib/math";

export type NeighborhoodMesh = Readonly<{
  cellCount: number;
  wrapWidth: number;
  siteX: Float32Array;
  siteY: Float32Array;
  neighborsOffsets: Int32Array;
  neighbors: Int32Array;
}>;

export function clampByte(value: number): number {
  if (value === Number.POSITIVE_INFINITY) return 255;
  if (!Number.isFinite(value)) return 0;
  return clampU8(Math.round(value));
}

export function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return clamp01Core(value);
}

export function clampInt8(value: number): number {
  if (!Number.isFinite(value)) {
    if (value === Number.POSITIVE_INFINITY) return 127;
    if (value === Number.NEGATIVE_INFINITY) return -127;
    return 0;
  }
  return clampInt(Math.round(value), -127, 127);
}

export function normalizeToInt8(x: number, y: number): { u: number; v: number } {
  const len = Math.sqrt(x * x + y * y);
  if (!Number.isFinite(len) || len <= 1e-9) return { u: 0, v: 0 };
  return { u: clampInt8((x / len) * 127), v: clampInt8((y / len) * 127) };
}

export function computeMeanEdgeLen(mesh: NeighborhoodMesh, maxEdges = 100_000): number {
  const cellCount = mesh.cellCount | 0;
  if (cellCount <= 0) return 1;

  let sum = 0;
  let count = 0;

  for (let i = 0; i < cellCount; i++) {
    const start = mesh.neighborsOffsets[i] | 0;
    const end = mesh.neighborsOffsets[i + 1] | 0;
    const ax = mesh.siteX[i] ?? 0;
    const ay = mesh.siteY[i] ?? 0;
    for (let c = start; c < end; c++) {
      const n = mesh.neighbors[c] | 0;
      if (n <= i || n < 0 || n >= cellCount) continue;
      const bx = mesh.siteX[n] ?? 0;
      const by = mesh.siteY[n] ?? 0;
      const dx = wrapDeltaPeriodic(bx - ax, mesh.wrapWidth);
      const dy = by - ay;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (!Number.isFinite(len) || len <= 1e-9) continue;
      sum += len;
      count += 1;
      if (count >= maxEdges) break;
    }
    if (count >= maxEdges) break;
  }

  return count > 0 ? sum / count : 1;
}

export function findNearestCell(mesh: NeighborhoodMesh, x: number, y: number): number {
  const cellCount = mesh.cellCount | 0;
  if (cellCount <= 0) return -1;

  let best = -1;
  let bestDist = Number.POSITIVE_INFINITY;

  for (let i = 0; i < cellCount; i++) {
    const dx = wrapDeltaPeriodic((mesh.siteX[i] ?? 0) - x, mesh.wrapWidth);
    const dy = (mesh.siteY[i] ?? 0) - y;
    const dist = dx * dx + dy * dy;
    if (dist < bestDist) {
      bestDist = dist;
      best = i;
    }
  }

  return best;
}

export function chooseDriftNeighbor(params: {
  cellId: number;
  driftU: number;
  driftV: number;
  mesh: NeighborhoodMesh;
}): number {
  const { mesh } = params;
  const cellId = params.cellId | 0;
  const start = mesh.neighborsOffsets[cellId] | 0;
  const end = mesh.neighborsOffsets[cellId + 1] | 0;
  if (end <= start) return cellId;

  const ux = (params.driftU | 0) / 127;
  const uy = (params.driftV | 0) / 127;
  if (!ux && !uy) return cellId;

  let best = cellId;
  let bestDot = -Infinity;
  const ax = mesh.siteX[cellId] ?? 0;
  const ay = mesh.siteY[cellId] ?? 0;

  for (let cursor = start; cursor < end; cursor++) {
    const n = mesh.neighbors[cursor] | 0;
    const bx = mesh.siteX[n] ?? 0;
    const by = mesh.siteY[n] ?? 0;
    const dx = wrapDeltaPeriodic(bx - ax, mesh.wrapWidth);
    const dy = by - ay;
    const dot = dx * ux + dy * uy;
    if (dot > bestDot) {
      bestDot = dot;
      best = n;
    }
  }

  return best;
}

export function deriveResetThreshold(maxValue: number, fracOfMax: number, minThreshold: number): number {
  const maxByte = Math.max(0, Math.min(255, maxValue | 0)) | 0;
  const frac = Number.isFinite(fracOfMax) ? Math.max(0, Math.min(1, fracOfMax)) : 0;
  const derived = Math.round(maxByte * frac) | 0;

  // Keep the floor bounded by the actual per-era maxima so a zero-signal era
  // does not force impossible reset thresholds.
  const minByte = Math.max(0, Math.min(255, minThreshold | 0)) | 0;
  const floor = Math.min(maxByte, minByte) | 0;
  return Math.max(floor, derived) | 0;
}
