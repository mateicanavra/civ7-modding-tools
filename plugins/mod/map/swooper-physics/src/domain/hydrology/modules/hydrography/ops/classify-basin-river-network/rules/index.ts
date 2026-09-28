import type { OperationInput } from "@swooper/mapgen-core/authoring";
import { getHexNeighborIndicesOddQ } from "@swooper/mapgen-core/lib/grid";
import type { OpenBasinBodySchema } from "../../../model/atoms/index.js";

type Input = Readonly<{
  width: number;
  height: number;
  landMask: ArrayLike<number>;
  elevation: ArrayLike<number>;
  lakeMask: ArrayLike<number>;
  waterSurface: ArrayLike<number>;
  bodyId: ArrayLike<number>;
  bodies: readonly OperationInput<typeof OpenBasinBodySchema>[];
  discharge: readonly number[];
  riverClass: ArrayLike<number>;
  flowDir: ArrayLike<number>;
}>;

function requireValid(value: unknown, message: string): asserts value {
  if (!value) throw new RangeError(`Invalid basin river metadata input: ${message}.`);
}

/** Contract each body before counting area or tributary order, so wet connectivity cannot bias metadata. */
export function classifyBasinRiverNetwork(input: Input, orderAreaMin: number) {
  const size = input.width * input.height;
  for (const field of [
    input.landMask,
    input.elevation,
    input.lakeMask,
    input.waterSurface,
    input.bodyId,
    input.discharge,
    input.riverClass,
    input.flowDir,
  ])
    requireValid(field.length === size, "map-grid cardinality");
  const vertexCount = size + input.bodies.length;
  const active = new Uint8Array(vertexCount);
  const vertexOf = new Int32Array(size).fill(-1);
  const receiver = new Int32Array(vertexCount).fill(-1);
  const terminal = new Int32Array(vertexCount).fill(-1);
  const area = new Int32Array(vertexCount);
  const hierarchy = new Uint8Array(vertexCount);
  const indegree = new Int32Array(vertexCount);
  const ids = new Set<number>();
  for (let b = 0; b < input.bodies.length; b++) {
    const body = input.bodies[b]!;
    requireValid(
      body.nodeId > 0 && !ids.has(body.nodeId) && body.wetCells.length > 0,
      "body identity"
    );
    ids.add(body.nodeId);
    const vertex = size + b;
    active[vertex] = 1;
    area[vertex] = body.wetCells.length;
    for (const cell of body.wetCells) {
      requireValid(
        cell >= 0 &&
          cell < size &&
          vertexOf[cell] === -1 &&
          input.landMask[cell] === 1 &&
          input.lakeMask[cell] === 1 &&
          input.bodyId[cell] === body.nodeId,
        "strict body partition"
      );
      requireValid(
        input.waterSurface[cell] === body.spillElevation &&
          input.elevation[cell]! < body.spillElevation,
        "strict body surface"
      );
      vertexOf[cell] = vertex;
    }
    requireValid(
      body.wetCells.includes(body.outletCell) &&
        input.flowDir[body.outletCell] === body.receiverCell,
      "recorded body outlet"
    );
  }
  for (let cell = 0; cell < size; cell++) {
    requireValid(
      input.landMask[cell] === 0 || input.landMask[cell] === 1,
      "binary original land mask"
    );
    requireValid(input.lakeMask[cell] === 0 || input.lakeMask[cell] === 1, "binary lake mask");
    requireValid(
      Number.isFinite(input.discharge[cell]) && input.discharge[cell]! >= 0,
      "finite nonnegative dry discharge"
    );
    if (input.lakeMask[cell])
      requireValid(
        vertexOf[cell] >= size && input.riverClass[cell] === 0 && input.discharge[cell] === 0,
        "wet-cell sentinels"
      );
    else {
      requireValid(input.bodyId[cell] === 0, "zero nonbody identity");
      if (input.landMask[cell]) {
        vertexOf[cell] = cell;
        active[cell] = 1;
        area[cell] = 1;
      } else
        requireValid(
          input.flowDir[cell] === -1 && input.discharge[cell] === 0 && input.riverClass[cell] === 0,
          "marine sentinels"
        );
    }
  }
  const exits = new Int32Array(input.bodies.length);
  for (let cell = 0; cell < size; cell++) {
    if (!input.landMask[cell]) continue;
    const dest = input.flowDir[cell]!;
    requireValid(
      dest >= 0 &&
        dest < size &&
        getHexNeighborIndicesOddQ(
          cell % input.width,
          Math.floor(cell / input.width),
          input.width,
          input.height
        ).includes(dest),
      "adjacent final receiver"
    );
    requireValid(
      input.waterSurface[dest]! <= input.waterSurface[cell]!,
      "nonascending physical surface"
    );
    if (!input.lakeMask[cell]) {
      requireValid(input.waterSurface[cell] === input.elevation[cell], "unchanged dry ground");
      receiver[cell] = vertexOf[dest]!;
      if (receiver[cell] < 0) terminal[cell] = cell + 1;
    } else if (vertexOf[dest] !== vertexOf[cell]) {
      const bodyIndex = vertexOf[cell]! - size;
      const body = input.bodies[bodyIndex]!;
      requireValid(
        cell === body.outletCell && dest === body.receiverCell,
        "sole declared body outlet"
      );
      exits[bodyIndex]++;
    }
  }
  for (let b = 0; b < input.bodies.length; b++) {
    const body = input.bodies[b]!;
    const vertex = size + b;
    requireValid(exits[b] === 1, "one body exit");
    receiver[vertex] = vertexOf[body.receiverCell]!;
    requireValid(receiver[vertex] !== vertex, "external body receiver");
    if (receiver[vertex] < 0) terminal[vertex] = body.outletCell + 1;
  }
  const queue: number[] = [];
  let activeCount = 0;
  for (let v = 0; v < vertexCount; v++)
    if (active[v]) {
      activeCount++;
      if (receiver[v]! >= 0) indegree[receiver[v]!]++;
    }
  for (let v = 0; v < vertexCount; v++) if (active[v] && indegree[v] === 0) queue.push(v);
  const maxOrder = new Uint8Array(vertexCount);
  const maxOrderCount = new Uint8Array(vertexCount);
  for (let cursor = 0; cursor < queue.length; cursor++) {
    const v = queue[cursor]!;
    if ((v < size && input.riverClass[v]! > 0) || (v >= size && maxOrder[v]! > 0)) {
      const incoming = maxOrder[v]!;
      const increase = maxOrderCount[v]! >= 2 && (incoming < 2 || area[v]! >= orderAreaMin);
      hierarchy[v] = incoming === 0 ? 1 : Math.min(255, incoming + (increase ? 1 : 0));
    }
    const dest = receiver[v]!;
    if (dest < 0) continue;
    area[dest] += area[v]!;
    const value = hierarchy[v]!;
    if (value > maxOrder[dest]!) {
      maxOrder[dest] = value;
      maxOrderCount[dest] = 1;
    } else if (value > 0 && value === maxOrder[dest])
      maxOrderCount[dest] = Math.min(255, maxOrderCount[dest]! + 1);
    if (--indegree[dest] === 0) queue.push(dest);
  }
  requireValid(queue.length === activeCount, "acyclic contracted graph");
  const mouth = new Uint8Array(vertexCount);
  const mouthBody = new Int32Array(vertexCount);
  for (let i = queue.length - 1; i >= 0; i--) {
    const v = queue[i]!;
    const dest = receiver[v]!;
    if (dest >= 0) terminal[v] = terminal[dest]!;
    if (v >= size) continue;
    if (dest < 0) mouth[v] = 1;
    else if (dest >= size) {
      mouth[v] = 2;
      mouthBody[v] = input.bodies[dest - size]!.nodeId;
    } else {
      mouth[v] = mouth[dest]!;
      mouthBody[v] = mouthBody[dest]!;
    }
  }
  const basinId = new Int32Array(size).fill(-1);
  const upstreamArea = new Int32Array(size);
  const streamOrderProxy = new Uint8Array(size);
  const mouthType = new Uint8Array(size);
  const mouthBodyId = new Int32Array(size);
  const slopeClass = new Uint8Array(size);
  const flowPermanenceProxy = new Uint8Array(size);
  for (let cell = 0; cell < size; cell++) {
    const v = vertexOf[cell]!;
    if (v < 0) continue;
    basinId[cell] = terminal[v]!;
    upstreamArea[cell] = area[v]!;
    streamOrderProxy[cell] = hierarchy[v]!;
    if (input.lakeMask[cell]) continue;
    mouthType[cell] = mouth[v]!;
    mouthBodyId[cell] = mouthBody[v]!;
    const dest = input.flowDir[cell]!;
    const delta =
      input.elevation[cell]! -
      (input.lakeMask[dest] ? input.waterSurface[dest]! : input.elevation[dest]!);
    slopeClass[cell] = delta <= 0.5 ? 1 : delta <= 4 ? 2 : delta <= 12 ? 3 : 4;
    const specific = input.discharge[cell]! / Math.max(1, area[v]!);
    const riverClass = input.riverClass[cell]!;
    flowPermanenceProxy[cell] =
      riverClass >= 2
        ? specific >= 4
          ? 3
          : 2
        : riverClass === 1
          ? specific >= 2.25
            ? 2
            : 1
          : specific >= 1.5 && area[v]! >= 4
            ? 1
            : 0;
  }
  return {
    basinId,
    upstreamArea,
    streamOrderProxy,
    mouthType,
    mouthBodyId,
    slopeClass,
    flowPermanenceProxy,
  };
}
