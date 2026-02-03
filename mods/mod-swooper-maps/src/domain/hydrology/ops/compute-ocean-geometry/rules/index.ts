import { clampInt } from "@swooper/mapgen-core";
import { forEachHexNeighborOddQ } from "@swooper/mapgen-core/lib/grid";

import type { ComputeOceanGeometryOptions, ComputeOceanGeometryOutput } from "../types.js";

const INF_U16 = 0xffff;

function popIndex(queue: number[], head: number): number {
  return queue[head] ?? 0;
}

function isCoastalWater(x: number, y: number, width: number, height: number, isWaterMask: Uint8Array): boolean {
  const i = y * width + x;
  if ((isWaterMask[i] ?? 0) !== 1) return false;
  let coastal = false;
  forEachHexNeighborOddQ(x, y, width, height, (nx, ny) => {
    const j = ny * width + nx;
    if ((isWaterMask[j] ?? 0) === 0) coastal = true;
  });
  // Treat north/south edges as coast-adjacent.
  if (y === 0 || y === height - 1) coastal = true;
  return coastal;
}

export function computeOceanGeometry(
  width: number,
  height: number,
  isWaterMask: Uint8Array,
  options: ComputeOceanGeometryOptions
): ComputeOceanGeometryOutput {
  const size = Math.max(0, width * height);
  const basinId = new Int32Array(size);
  const coastDistance = new Uint16Array(size);
  const coastNormalU = new Int8Array(size);
  const coastNormalV = new Int8Array(size);
  const coastTangentU = new Int8Array(size);
  const coastTangentV = new Int8Array(size);

  // Initialize coastDistance to INF, and mark land as INF.
  for (let i = 0; i < size; i++) {
    coastDistance[i] = INF_U16;
  }

  // 1) Basin labeling (connected components on water).
  let nextBasin = 1;
  const queue: number[] = [];
  let head = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      if ((isWaterMask[i] ?? 0) !== 1) continue;
      if ((basinId[i] ?? 0) !== 0) continue;

      const basin = nextBasin++;
      basinId[i] = basin;
      queue.length = 0;
      head = 0;
      queue.push(i);

      while (head < queue.length) {
        const index = popIndex(queue, head++);
        const qx = index % width;
        const qy = Math.floor(index / width);
        forEachHexNeighborOddQ(qx, qy, width, height, (nx, ny) => {
          const j = ny * width + nx;
          if ((isWaterMask[j] ?? 0) !== 1) return;
          if ((basinId[j] ?? 0) !== 0) return;
          basinId[j] = basin;
          queue.push(j);
        });
      }
    }
  }

  // 2) Coast distance over water (multi-source BFS from coastal water).
  const maxDist = Math.max(1, options.maxCoastDistance | 0);
  queue.length = 0;
  head = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      if ((isWaterMask[i] ?? 0) !== 1) continue;
      if (isCoastalWater(x, y, width, height, isWaterMask)) {
        coastDistance[i] = 0;
        queue.push(i);
      }
    }
  }

  while (head < queue.length) {
    const qi = popIndex(queue, head++);
    const qx = qi % width;
    const qy = Math.floor(qi / width);
    const d = coastDistance[qi] ?? INF_U16;
    if (d >= maxDist) continue;
    forEachHexNeighborOddQ(qx, qy, width, height, (nx, ny) => {
      const j = ny * width + nx;
      if ((isWaterMask[j] ?? 0) !== 1) return;
      const cur = coastDistance[j] ?? INF_U16;
      const next = (d + 1) as number;
      if (next < cur) {
        coastDistance[j] = next;
        queue.push(j);
      }
    });
  }

  // 3) Coast normal/tangent (advisory). We approximate a normal pointing offshore by taking a local
  // gradient of coastDistance on water tiles. Tangent is normal rotated 90deg.
  const maxVecDist = Math.max(0, options.maxCoastVectorDistance | 0);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      if ((isWaterMask[i] ?? 0) !== 1) continue;
      const d0 = coastDistance[i] ?? INF_U16;
      if (!Number.isFinite(d0) || d0 === INF_U16 || d0 > maxVecDist) continue;

      let gx = 0;
      let gy = 0;
      let w = 0;
      forEachHexNeighborOddQ(x, y, width, height, (nx, ny) => {
        const j = ny * width + nx;
        if ((isWaterMask[j] ?? 0) !== 1) return;
        const dj = coastDistance[j] ?? INF_U16;
        if (dj === INF_U16) return;
        let dx = nx - x;
        if (dx > width / 2) dx -= width;
        else if (dx < -width / 2) dx += width;
        const dy = ny - y;
        gx += (dj - d0) * dx;
        gy += (dj - d0) * dy;
        w += 1;
      });
      if (w <= 0) continue;

      const len = Math.sqrt(gx * gx + gy * gy);
      if (!Number.isFinite(len) || len <= 1e-6) continue;
      const nx = gx / len;
      const ny = gy / len;

      // Note: nx/ny are in tile-space; quantize for advisory use.
      const qnx = clampInt(Math.round(nx * 127), -127, 127);
      const qny = clampInt(Math.round(ny * 127), -127, 127);
      coastNormalU[i] = qnx;
      coastNormalV[i] = qny;
      // Rotate by +90deg in tile-space for tangent (approx).
      coastTangentU[i] = clampInt(Math.round(-ny * 127), -127, 127);
      coastTangentV[i] = clampInt(Math.round(nx * 127), -127, 127);
    }
  }

  return { basinId, coastDistance, coastNormalU, coastNormalV, coastTangentU, coastTangentV };
}
