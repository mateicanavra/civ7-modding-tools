import { forEachHexNeighborOddQ } from "@swooper/mapgen-core/lib/grid";

export const HYDROLOGY_TERMINAL_NONE = 0;
export const HYDROLOGY_TERMINAL_OCEAN = 1;
export const HYDROLOGY_TERMINAL_CLOSED_BASIN = 2;

type PriorityFloodEntry = Readonly<{
  index: number;
  spillElevation: number;
  basinId: number;
  order: number;
}>;

export type DrainageRoutingResult = Readonly<{
  flowDir: Int32Array;
  flowAccum: Float32Array;
  basinId: Int32Array;
  routingElevation: Float32Array;
  depressionDepth: Float32Array;
  sinkMask: Uint8Array;
  outletMask: Uint8Array;
  terminalType: Uint8Array;
}>;

export function computeDrainageRouting(params: {
  width: number;
  height: number;
  elevation: Int16Array;
  landMask: Uint8Array;
  allowExternalEdgeOutlets: boolean;
}): DrainageRoutingResult {
  const width = params.width;
  const height = params.height;
  const size = width * height;
  const { elevation, landMask } = params;
  if (elevation.length !== size || landMask.length !== size) {
    throw new Error("[Hydrology] Invalid inputs for hydrology/compute-drainage-routing.");
  }

  const flowDir = new Int32Array(size);
  const basinId = new Int32Array(size);
  const routingElevation = new Float32Array(size);
  const depressionDepth = new Float32Array(size);
  const sinkMask = new Uint8Array(size);
  const outletMask = new Uint8Array(size);
  const terminalType = new Uint8Array(size);
  const visited = new Uint8Array(size);
  flowDir.fill(-1);
  basinId.fill(-1);

  for (let i = 0; i < size; i++) routingElevation[i] = elevation[i] ?? 0;

  const heap = new PriorityFloodHeap();
  let order = 0;
  const seed = (index: number, basin: number, terminal: number): void => {
    if (visited[index] === 1) return;
    visited[index] = 1;
    basinId[index] = basin;
    if (landMask[index] === 1 && terminal !== HYDROLOGY_TERMINAL_NONE) {
      terminalType[index] = terminal;
      if (terminal === HYDROLOGY_TERMINAL_OCEAN) outletMask[index] = 1;
      if (terminal === HYDROLOGY_TERMINAL_CLOSED_BASIN) sinkMask[index] = 1;
    }
    heap.push({
      index,
      spillElevation: elevation[index] ?? 0,
      basinId: basin,
      order: order++,
    });
  };

  for (let i = 0; i < size; i++) {
    if (landMask[i] === 0) seed(i, -1, HYDROLOGY_TERMINAL_NONE);
  }

  if (params.allowExternalEdgeOutlets) {
    for (let x = 0; x < width; x++) {
      seed(x, x, HYDROLOGY_TERMINAL_OCEAN);
      if (height > 1) {
        const south = (height - 1) * width + x;
        seed(south, south, HYDROLOGY_TERMINAL_OCEAN);
      }
    }
  }

  if (heap.size === 0) {
    const closedSeed = findLowestLandTile(elevation, landMask);
    if (closedSeed >= 0) seed(closedSeed, closedSeed, HYDROLOGY_TERMINAL_CLOSED_BASIN);
  }

  while (heap.size > 0) {
    const current = heap.pop()!;
    const x = current.index % width;
    const y = Math.floor(current.index / width);

    forEachHexNeighborOddQ(x, y, width, height, (nx, ny) => {
      const neighbor = ny * width + nx;
      if (visited[neighbor] === 1) return;

      visited[neighbor] = 1;
      const rawElevation = elevation[neighbor] ?? 0;
      const spillElevation = Math.max(rawElevation, current.spillElevation);
      const drainsToWater = landMask[current.index] !== 1;
      const nextBasinId =
        current.basinId >= 0 ? current.basinId : drainsToWater ? neighbor : current.index;

      routingElevation[neighbor] = spillElevation;
      depressionDepth[neighbor] = Math.max(0, spillElevation - rawElevation);
      basinId[neighbor] = landMask[neighbor] === 1 ? nextBasinId : -1;

      if (landMask[neighbor] === 1) {
        flowDir[neighbor] = current.index;
        if (drainsToWater) {
          outletMask[neighbor] = 1;
          terminalType[neighbor] = HYDROLOGY_TERMINAL_OCEAN;
        }
      }

      heap.push({
        index: neighbor,
        spillElevation,
        basinId: nextBasinId,
        order: order++,
      });
    });
  }

  for (let i = 0; i < size; i++) {
    if (landMask[i] !== 1) continue;
    if (visited[i] !== 1) {
      throw new Error("[Hydrology] Drainage routing left a land tile unvisited.");
    }
    if (
      terminalType[i] === HYDROLOGY_TERMINAL_NONE &&
      isRawLocalDrainageMinimum(i, width, height, elevation, landMask)
    ) {
      sinkMask[i] = 1;
    }
  }

  const flowAccum = computeDrainageAccumulation(landMask, flowDir);
  return {
    flowDir,
    flowAccum,
    basinId,
    routingElevation,
    depressionDepth,
    sinkMask,
    outletMask,
    terminalType,
  };
}

export function computeDrainageAccumulation(
  landMask: Uint8Array,
  flowDir: Int32Array
): Float32Array {
  const size = landMask.length;
  if (flowDir.length !== size) {
    throw new Error("[Hydrology] flowDir length must match landMask length.");
  }

  const flowAccum = new Float32Array(size);
  const receiver = new Int32Array(size);
  const indegree = new Int32Array(size);
  receiver.fill(-1);

  let landCount = 0;
  for (let i = 0; i < size; i++) {
    if (landMask[i] !== 1) continue;
    landCount += 1;
    flowAccum[i] = 1;
    const raw = flowDir[i] ?? -1;
    if (raw >= 0 && raw < size && landMask[raw] === 1) {
      receiver[i] = raw;
      indegree[raw] += 1;
    }
  }

  const queue = new Int32Array(size);
  let head = 0;
  let tail = 0;
  for (let i = 0; i < size; i++) {
    if (landMask[i] === 1 && indegree[i] === 0) queue[tail++] = i;
  }

  let processed = 0;
  while (head < tail) {
    const index = queue[head++]!;
    processed += 1;
    const dest = receiver[index]!;
    if (dest < 0) continue;
    flowAccum[dest] += flowAccum[index] ?? 0;
    indegree[dest] -= 1;
    if (indegree[dest] === 0) queue[tail++] = dest;
  }

  if (processed !== landCount) {
    throw new Error("[Hydrology] Drainage routing produced a cycle.");
  }

  return flowAccum;
}

function findLowestLandTile(elevation: Int16Array, landMask: Uint8Array): number {
  let best = -1;
  let bestElevation = Infinity;
  for (let i = 0; i < landMask.length; i++) {
    if (landMask[i] !== 1) continue;
    const value = elevation[i] ?? 0;
    if (value >= bestElevation) continue;
    bestElevation = value;
    best = i;
  }
  return best;
}

function isRawLocalDrainageMinimum(
  index: number,
  width: number,
  height: number,
  elevation: Int16Array,
  landMask: Uint8Array
): boolean {
  const here = elevation[index] ?? 0;
  const x = index % width;
  const y = Math.floor(index / width);
  let hasLowerLandNeighbor = false;
  let hasWaterNeighbor = false;
  forEachHexNeighborOddQ(x, y, width, height, (nx, ny) => {
    const neighbor = ny * width + nx;
    if (landMask[neighbor] !== 1) {
      hasWaterNeighbor = true;
      return;
    }
    if ((elevation[neighbor] ?? here) < here) hasLowerLandNeighbor = true;
  });
  return !hasLowerLandNeighbor && !hasWaterNeighbor;
}

class PriorityFloodHeap {
  private readonly entries: PriorityFloodEntry[] = [];

  get size(): number {
    return this.entries.length;
  }

  push(entry: PriorityFloodEntry): void {
    this.entries.push(entry);
    this.bubbleUp(this.entries.length - 1);
  }

  pop(): PriorityFloodEntry | undefined {
    const first = this.entries[0];
    const last = this.entries.pop();
    if (this.entries.length > 0 && last) {
      this.entries[0] = last;
      this.sinkDown(0);
    }
    return first;
  }

  private bubbleUp(index: number): void {
    while (index > 0) {
      const parent = (index - 1) >> 1;
      if (compareEntries(this.entries[index]!, this.entries[parent]!) >= 0) break;
      this.swap(index, parent);
      index = parent;
    }
  }

  private sinkDown(index: number): void {
    for (;;) {
      const left = index * 2 + 1;
      const right = left + 1;
      let best = index;
      if (
        left < this.entries.length &&
        compareEntries(this.entries[left]!, this.entries[best]!) < 0
      ) {
        best = left;
      }
      if (
        right < this.entries.length &&
        compareEntries(this.entries[right]!, this.entries[best]!) < 0
      ) {
        best = right;
      }
      if (best === index) break;
      this.swap(index, best);
      index = best;
    }
  }

  private swap(a: number, b: number): void {
    const tmp = this.entries[a]!;
    this.entries[a] = this.entries[b]!;
    this.entries[b] = tmp;
  }
}

function compareEntries(a: PriorityFloodEntry, b: PriorityFloodEntry): number {
  if (a.spillElevation !== b.spillElevation) return a.spillElevation - b.spillElevation;
  return a.order - b.order;
}
