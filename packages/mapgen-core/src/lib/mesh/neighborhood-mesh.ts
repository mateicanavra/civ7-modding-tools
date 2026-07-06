import { wrapDeltaPeriodic } from "@mapgen/lib/math/wrap.js";

export type CsrPointMesh2D = Readonly<{
  cellCount: number;
  wrapWidth: number;
  siteX: Float32Array;
  siteY: Float32Array;
  neighborsOffsets: Int32Array;
  neighbors: Int32Array;
}>;

export function meanMeshEdgeLength(mesh: CsrPointMesh2D, maxEdges = 100_000): number {
  const cellCount = mesh.cellCount | 0;
  if (cellCount <= 0) return 1;

  let sum = 0;
  let count = 0;

  for (let i = 0; i < cellCount; i++) {
    const start = mesh.neighborsOffsets[i] | 0;
    const end = mesh.neighborsOffsets[i + 1] | 0;
    const ax = mesh.siteX[i] ?? 0;
    const ay = mesh.siteY[i] ?? 0;
    for (let cursor = start; cursor < end; cursor++) {
      const n = mesh.neighbors[cursor] | 0;
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

export function findNearestMeshCell(mesh: CsrPointMesh2D, x: number, y: number): number {
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

export function selectMeshNeighborByVectorProjection(params: {
  mesh: CsrPointMesh2D;
  cellId: number;
  vectorX: number;
  vectorY: number;
}): number {
  const { mesh } = params;
  const cellId = params.cellId | 0;
  const cellCount = mesh.cellCount | 0;
  if (cellId < 0 || cellId >= cellCount) return cellId;

  const start = mesh.neighborsOffsets[cellId] | 0;
  const end = mesh.neighborsOffsets[cellId + 1] | 0;
  if (end <= start) return cellId;

  const vectorX = params.vectorX;
  const vectorY = params.vectorY;
  if (!Number.isFinite(vectorX) || !Number.isFinite(vectorY) || (!vectorX && !vectorY)) {
    return cellId;
  }

  let best = cellId;
  let bestDot = Number.NEGATIVE_INFINITY;
  const ax = mesh.siteX[cellId] ?? 0;
  const ay = mesh.siteY[cellId] ?? 0;

  for (let cursor = start; cursor < end; cursor++) {
    const n = mesh.neighbors[cursor] | 0;
    if (n < 0 || n >= cellCount) continue;
    const bx = mesh.siteX[n] ?? 0;
    const by = mesh.siteY[n] ?? 0;
    const dx = wrapDeltaPeriodic(bx - ax, mesh.wrapWidth);
    const dy = by - ay;
    const dot = dx * vectorX + dy * vectorY;
    if (dot > bestDot) {
      bestDot = dot;
      best = n;
    }
  }

  return best;
}
