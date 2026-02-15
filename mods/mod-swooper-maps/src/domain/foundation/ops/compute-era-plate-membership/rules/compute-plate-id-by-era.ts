import { wrapDeltaPeriodic } from "@swooper/mapgen-core/lib/math";

import type { EraPlateMembershipMesh, EraPlateMembershipParams } from "../types.js";

type MinHeapItem = Readonly<{ cost: number; plateId: number; cellId: number; seq: number }>;

class MinHeap {
  private readonly items: MinHeapItem[] = [];
  private seq = 0;

  get size(): number {
    return this.items.length;
  }

  push(input: Omit<MinHeapItem, "seq">): void {
    const item: MinHeapItem = { ...input, seq: this.seq++ };
    this.items.push(item);
    this.bubbleUp(this.items.length - 1);
  }

  pop(): MinHeapItem | undefined {
    if (this.items.length === 0) return undefined;
    const top = this.items[0]!;
    const last = this.items.pop()!;
    if (this.items.length > 0) {
      this.items[0] = last;
      this.bubbleDown(0);
    }
    return top;
  }

  private compare(a: MinHeapItem, b: MinHeapItem): number {
    if (a.cost !== b.cost) return a.cost < b.cost ? -1 : 1;
    if (a.plateId !== b.plateId) return a.plateId < b.plateId ? -1 : 1;
    if (a.cellId !== b.cellId) return a.cellId < b.cellId ? -1 : 1;
    if (a.seq !== b.seq) return a.seq < b.seq ? -1 : 1;
    return 0;
  }

  private bubbleUp(index: number): void {
    let i = index;
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (this.compare(this.items[i]!, this.items[parent]!) >= 0) break;
      const tmp = this.items[i]!;
      this.items[i] = this.items[parent]!;
      this.items[parent] = tmp;
      i = parent;
    }
  }

  private bubbleDown(index: number): void {
    let i = index;
    const n = this.items.length;
    while (true) {
      const left = i * 2 + 1;
      const right = left + 1;
      let smallest = i;

      if (left < n && this.compare(this.items[left]!, this.items[smallest]!) < 0) {
        smallest = left;
      }
      if (right < n && this.compare(this.items[right]!, this.items[smallest]!) < 0) {
        smallest = right;
      }
      if (smallest === i) break;

      const tmp = this.items[i]!;
      this.items[i] = this.items[smallest]!;
      this.items[smallest] = tmp;
      i = smallest;
    }
  }
}

function computeMeanEdgeLen(mesh: EraPlateMembershipMesh, maxEdges = 100_000): number {
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

function findNearestCell(mesh: EraPlateMembershipMesh, x: number, y: number): number {
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

export function computePlateIdByEra(params: EraPlateMembershipParams): ReadonlyArray<Int16Array> {
  const cellCount = params.mesh.cellCount | 0;
  const plateCount = params.plates.length | 0;
  const eraCount = Math.max(0, params.eraCount | 0);
  const driftStepsByEra = params.driftStepsByEra;

  const meanEdgeLen = computeMeanEdgeLen(params.mesh);

  let meanPlateSpeed = 0;
  for (let p = 0; p < plateCount; p++) {
    const vx = params.plateVelocityX[p] ?? 0;
    const vy = params.plateVelocityY[p] ?? 0;
    meanPlateSpeed += Math.sqrt(vx * vx + vy * vy);
  }
  meanPlateSpeed = plateCount > 0 ? meanPlateSpeed / plateCount : 1;
  if (!Number.isFinite(meanPlateSpeed) || meanPlateSpeed <= 1e-9) meanPlateSpeed = 1;

  const result: Int16Array[] = [];

  for (let era = 0; era < eraCount; era++) {
    if (era === eraCount - 1 && params.currentCellToPlate.length === cellCount) {
      result.push(params.currentCellToPlate.slice());
      continue;
    }

    const driftSteps = Math.max(0, driftStepsByEra[era] ?? 0);
    const displacement = driftSteps * meanEdgeLen;
    const scale = displacement / meanPlateSpeed;

    const seedCellsByPlate = new Int32Array(plateCount);
    seedCellsByPlate.fill(-1);
    for (let p = 0; p < plateCount; p++) {
      const plate = params.plates[p]!;
      const vx = params.plateVelocityX[p] ?? 0;
      const vy = params.plateVelocityY[p] ?? 0;
      const sx = (plate.seedX ?? 0) + vx * scale;
      const sy = (plate.seedY ?? 0) + vy * scale;
      seedCellsByPlate[p] = findNearestCell(params.mesh, sx, sy);
    }

    const dist = new Float32Array(cellCount);
    dist.fill(Number.POSITIVE_INFINITY);
    const owner = new Int16Array(cellCount);
    owner.fill(-1);
    const heap = new MinHeap();

    for (let p = 0; p < plateCount; p++) {
      const seed = seedCellsByPlate[p] ?? -1;
      if (seed < 0 || seed >= cellCount) continue;
      const plateId = params.plates[p]!.id | 0;
      if (dist[seed]! === 0 && (owner[seed] ?? 32767) <= plateId) continue;
      dist[seed] = 0;
      owner[seed] = plateId;
      heap.push({ cost: 0, plateId, cellId: seed });
    }

    while (heap.size > 0) {
      const item = heap.pop();
      if (!item) break;
      const cellId = item.cellId | 0;
      const plateId = item.plateId | 0;
      const cost = item.cost;
      if (owner[cellId] !== plateId) continue;
      if (dist[cellId] !== cost) continue;

      const ax = params.mesh.siteX[cellId] ?? 0;
      const ay = params.mesh.siteY[cellId] ?? 0;
      const start = params.mesh.neighborsOffsets[cellId] | 0;
      const end = params.mesh.neighborsOffsets[cellId + 1] | 0;
      for (let cursor = start; cursor < end; cursor++) {
        const n = params.mesh.neighbors[cursor] | 0;
        if (n < 0 || n >= cellCount) continue;
        const bx = params.mesh.siteX[n] ?? 0;
        const by = params.mesh.siteY[n] ?? 0;
        const dx = wrapDeltaPeriodic(bx - ax, params.mesh.wrapWidth);
        const dy = by - ay;
        const edgeLenNorm = Math.sqrt(dx * dx + dy * dy) / meanEdgeLen;
        if (!Number.isFinite(edgeLenNorm) || edgeLenNorm <= 0) continue;

        const next = cost + edgeLenNorm;
        const current = dist[n] ?? Number.POSITIVE_INFINITY;
        if (next < current || (next === current && plateId < (owner[n] ?? 32767))) {
          dist[n] = next;
          owner[n] = plateId;
          heap.push({ cost: next, plateId, cellId: n });
        }
      }
    }

    result.push(owner);
  }

  return result;
}
