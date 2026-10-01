import type { OperationInput } from "@swooper/mapgen-core/authoring";
import { getHexNeighborIndicesOddQ } from "@swooper/mapgen-core/lib/grid";
import {
  BASIN_INTERNAL_RECEIVER,
  BASIN_TERMINAL,
  type BasinWetBodySchema,
  type BasinHydraulicComponentSchema,
  type BasinInternalTransferSchema,
  type BasinPortSchema,
  type BasinTerminalSchema,
} from "../../../model/atoms/basin-network.schema.js";
import {
  HYDROLOGY_MOUTH_OCEAN,
  HYDROLOGY_MOUTH_ACCEPTED_LAKE,
  HYDROLOGY_MOUTH_CLOSED_BASIN,
  HYDROLOGY_MOUTH_BOUNDARY_EXPORT,
  HYDROLOGY_MOUTH_SUBTILE,
  HYDROLOGY_MOUTH_DRY,
} from "../../../model/policy/river-network-classification.js";
type ClassificationInput = Readonly<{
  width: number;
  height: number;
  externalWaterMask: ArrayLike<number>;
  elevation: ArrayLike<number>;
  lakeMask: ArrayLike<number>;
  waterSurface: readonly number[];
  bodyId: ArrayLike<number>;
  componentId: ArrayLike<number>;
  terminalId: ArrayLike<number>;
  terminalType: ArrayLike<number>;
  bodies: readonly OperationInput<typeof BasinWetBodySchema>[];
  components: readonly OperationInput<typeof BasinHydraulicComponentSchema>[];
  transfers: readonly OperationInput<typeof BasinInternalTransferSchema>[];
  ports: readonly OperationInput<typeof BasinPortSchema>[];
  terminals: readonly OperationInput<typeof BasinTerminalSchema>[];
  discharge: readonly number[];
  riverClass: ArrayLike<number>;
  flowDir: ArrayLike<number>;
}>;
function requireValid(value: unknown, message: string): asserts value {
  if (!value) throw new RangeError(`Invalid basin river metadata input: ${message}.`);
}

/** Counts each source once on the external component DAG, never on branching internal exchanges. */
export function classifyBasinRiverNetwork(input: ClassificationInput, orderAreaMin: number) {
  const size = input.width * input.height;
  requireValid(
    input.externalWaterMask.length === size &&
      Array.from(input.externalWaterMask).every((cell) => cell === 0 || cell === 1),
    "binary map-grid external water declaration"
  );
  const landMask = Uint8Array.from(input.externalWaterMask, (external) => external === 0 ? 1 : 0);
  for (const field of [
    landMask,
    input.elevation,
    input.lakeMask,
    input.waterSurface,
    input.bodyId,
    input.componentId,
    input.terminalId,
    input.terminalType,
    input.discharge,
    input.riverClass,
    input.flowDir,
  ])
    requireValid(field.length === size, "map-grid cardinality");
  const adjacent = (a: number, b: number) =>
    b >= 0 &&
    b < size &&
    getHexNeighborIndicesOddQ(
      a % input.width,
      Math.floor(a / input.width),
      input.width,
      input.height
    ).includes(b);
  const close = (a: number, b: number) =>
    Math.abs(a - b) <= 64 * Number.EPSILON * Math.max(1, Math.abs(a), Math.abs(b));
  const bodies = new Map(input.bodies.map((body) => [body.bodyId, body]));
  const components = new Map(
    input.components.map((component, index) => [
      component.componentId,
      { component, vertex: size + index },
    ])
  );
  const terminals = new Map(input.terminals.map((terminal) => [terminal.terminalId, terminal]));
  requireValid(
    bodies.size === input.bodies.length &&
      components.size === input.components.length &&
      terminals.size === input.terminals.length,
    "unique physical identities"
  );
  const vertexCount = size + input.components.length;
  const vertexOf = new Int32Array(size).fill(-1),
    receiver = new Int32Array(vertexCount).fill(-1);
  const active = new Uint8Array(vertexCount),
    area = new Int32Array(vertexCount),
    hierarchy = new Uint8Array(vertexCount);
  const terminalOf = new Int32Array(vertexCount).fill(-1),
    indegree = new Int32Array(vertexCount);
  for (const { component, vertex } of components.values()) {
    requireValid(
      component.memberCells.length > 0 &&
        component.componentId === Math.min(...component.memberCells) + 1,
      "canonical component identity"
    );
    active[vertex] = 1;
    terminalOf[vertex] = component.terminalId;
    for (const cell of component.memberCells) {
      requireValid(
        cell >= 0 &&
          cell < size &&
          vertexOf[cell] === -1 &&
          landMask[cell] === 1 &&
          input.componentId[cell] === component.componentId,
        "complete disjoint component membership"
      );
      vertexOf[cell] = vertex;
      area[vertex]++;
    }
  }
  const representedWet = new Uint8Array(size);
  for (const body of input.bodies) {
    requireValid(
      body.wetCells.length > 0 && body.bodyId === Math.min(...body.wetCells) + 1,
      "canonical wet-body identity"
    );
    for (const cell of body.wetCells) {
      requireValid(
        cell >= 0 &&
          cell < size &&
          !representedWet[cell] &&
          input.lakeMask[cell] === 1 &&
          input.bodyId[cell] === body.bodyId &&
          input.componentId[cell] === body.componentId &&
          input.waterSurface[cell] === body.level &&
          input.elevation[cell]! < body.level,
        "strict wet-body partition and head"
      );
      representedWet[cell] = 1;
    }
  }
  for (let cell = 0; cell < size; cell++) {
    requireValid(
      (landMask[cell] === 0 || landMask[cell] === 1) &&
        (input.lakeMask[cell] === 0 || input.lakeMask[cell] === 1),
      "binary masks"
    );
    requireValid(
      Number.isFinite(input.waterSurface[cell]) &&
        Number.isFinite(input.discharge[cell]) &&
        input.discharge[cell]! >= 0,
      "finite physical head and nonnegative principal discharge"
    );
    requireValid(
      representedWet[cell] === input.lakeMask[cell] &&
        (input.lakeMask[cell] === 1 || input.bodyId[cell] === 0),
      "complete wet membership"
    );
    if (!landMask[cell]) {
      requireValid(
        input.lakeMask[cell] === 0 &&
          input.componentId[cell] === 0 &&
          input.flowDir[cell] === -1 &&
          input.discharge[cell] === 0 &&
          input.riverClass[cell] === 0 &&
          input.terminalId[cell] === -1 &&
          input.terminalType[cell] === BASIN_TERMINAL.none,
        "marine sentinels"
      );
      continue;
    }
    const terminal = terminals.get(input.terminalId[cell]!);
    requireValid(
      terminal && input.terminalType[cell] === BASIN_TERMINAL[terminal.role],
      "resolved authoritative source terminal"
    );
    if (input.componentId[cell] === 0) {
      requireValid(vertexOf[cell] === -1 && !input.lakeMask[cell], "ordinary dry membership");
      vertexOf[cell] = cell;
      active[cell] = 1;
      area[cell] = 1;
      terminalOf[cell] = input.terminalId[cell]!;
    } else
      requireValid(
        vertexOf[cell] >= size && terminalOf[vertexOf[cell]!] === input.terminalId[cell],
        "component terminal agreement"
      );
    if (input.lakeMask[cell])
      requireValid(
        input.discharge[cell] === 0 && input.riverClass[cell] === 0,
        "wet dry-channel sentinels"
      );
    else requireValid(input.waterSurface[cell] === input.elevation[cell], "unchanged dry ground");
    requireValid(
      input.riverClass[cell]! <= 2 && (input.flowDir[cell]! >= 0 || input.riverClass[cell] === 0),
      "class requires actual adjacent principal edge"
    );
  }
  // The full ledger admits principal junction edges; a geometric connection alone is not positive flow.
  const outgoing = new Map<number, { toCell: number; discharge: number }[]>();
  for (const transfer of input.transfers) {
    requireValid(
      transfer.cellA < transfer.cellB &&
        adjacent(transfer.cellA, transfer.cellB) &&
        Number.isFinite(transfer.signedDischarge) &&
        input.componentId[transfer.cellA] === transfer.componentId &&
        input.componentId[transfer.cellB] === transfer.componentId &&
        input.bodyId[transfer.cellA] === transfer.bodyA &&
        input.bodyId[transfer.cellB] === transfer.bodyB,
      "canonical internal exchange"
    );
    if (transfer.signedDischarge === 0) continue;
    const from = transfer.signedDischarge > 0 ? transfer.cellA : transfer.cellB;
    const to = transfer.signedDischarge > 0 ? transfer.cellB : transfer.cellA;
    const edges = outgoing.get(from) ?? [];
    edges.push({ toCell: to, discharge: Math.abs(transfer.signedDischarge) });
    outgoing.set(from, edges);
  }
  for (const { component, vertex } of components.values()) {
    const ports = input.ports.filter((port) => port.componentId === component.componentId);
    requireValid(
      ports.length === (component.state === "open" ? 1 : 0),
      "state determines external port"
    );
    const port = ports[0];
    if (port) {
      requireValid(
        component.memberCells.includes(port.fromCell) &&
          port.discharge > 0 &&
          close(port.discharge, component.outflow),
        "positive component port"
      );
      if (port.kind === "adjacent") {
        requireValid(
          adjacent(port.fromCell, port.toCell) &&
            vertexOf[port.toCell] !== vertex &&
            port.destinationComponentId === input.componentId[port.toCell] &&
            port.destination ===
              (landMask[port.toCell] === 0
                ? "marine"
                : input.componentId[port.toCell]! > 0
                  ? "component"
                  : "dry-reach"),
          "physical external port destination"
        );
        receiver[vertex] = vertexOf[port.toCell]!;
      } else
        requireValid(
          Math.floor(port.fromCell / input.width) ===
            (port.side === "north" ? 0 : input.height - 1) &&
            terminals.get(component.terminalId)?.role === "boundary-export",
          "declared boundary export"
        );
    }
    for (const cell of component.junctionCells) {
      requireValid(
        component.memberCells.includes(cell) &&
          !input.lakeMask[cell] &&
          input.elevation[cell] === component.level,
        "equal-head dry junction"
      );
      const principal =
        port?.fromCell === cell && port.kind === "adjacent"
          ? { toCell: port.toCell, discharge: port.discharge }
          : (outgoing.get(cell) ?? []).sort(
              (a, b) => b.discharge - a.discharge || a.toCell - b.toCell
            )[0];
      if (principal)
        requireValid(
          input.flowDir[cell] === principal.toCell &&
            close(input.discharge[cell]!, principal.discharge),
          "principal edge is actual selected positive transfer"
        );
      else
        requireValid(
          (input.flowDir[cell] === BASIN_INTERNAL_RECEIVER ||
            (port?.fromCell === cell &&
              port.kind === "boundary-export" &&
              input.flowDir[cell] === -1)) &&
            input.discharge[cell] === 0 &&
            input.riverClass[cell] === 0,
          "no fabricated component principal edge"
        );
    }
  }
  for (let cell = 0; cell < size; cell++) {
    if (!landMask[cell] || input.componentId[cell]) continue;
    const dest = input.flowDir[cell]!;
    if (dest >= 0) {
      requireValid(
        adjacent(cell, dest) && input.waterSurface[dest]! <= input.elevation[cell]!,
        "adjacent nonascending ordinary receiver"
      );
      receiver[cell] = vertexOf[dest]!;
      if (!landMask[dest])
        requireValid(
          terminals.get(input.terminalId[cell]!)?.role === "marine",
          "marine edge terminal role"
        );
    } else {
      const terminal = terminals.get(input.terminalId[cell]!)!;
      requireValid(
        dest === -1 &&
          terminal.anchorCell === cell &&
          (terminal.role === "dry" || terminal.role === "boundary-export"),
        "resolved ordinary terminal"
      );
    }
  }
  const queue: number[] = [];
  let activeCount = 0;
  for (let v = 0; v < vertexCount; v++)
    if (active[v]) {
      activeCount++;
      if (receiver[v]! >= 0) {
        requireValid(
          active[receiver[v]!] && terminalOf[v] === terminalOf[receiver[v]!],
          "external DAG preserves authoritative terminal"
        );
        indegree[receiver[v]!]++;
      }
    }
  for (let v = 0; v < vertexCount; v++) if (active[v] && indegree[v] === 0) queue.push(v);
  const maxOrder = new Uint8Array(vertexCount),
    maxCount = new Uint8Array(vertexCount);
  for (let cursor = 0; cursor < queue.length; cursor++) {
    const v = queue[cursor]!;
    const locallyClassified =
      v < size
        ? input.riverClass[v]! > 0
        : input.components[v - size]!.junctionCells.some((cell) => input.riverClass[cell]! > 0);
    // A classified junction can originate a channel; it does not add a second source or tributary.
    if (locallyClassified || (v >= size && maxOrder[v]! > 0)) {
      const incoming = maxOrder[v]!;
      hierarchy[v] =
        incoming === 0
          ? 1
          : Math.min(
              255,
              incoming + (maxCount[v]! >= 2 && (incoming < 2 || area[v]! >= orderAreaMin) ? 1 : 0)
            );
    }
    const dest = receiver[v]!;
    if (dest < 0) continue;
    area[dest] += area[v]!;
    const order = hierarchy[v]!;
    if (order > maxOrder[dest]!) {
      maxOrder[dest] = order;
      maxCount[dest] = 1;
    } else if (order > 0 && order === maxOrder[dest])
      maxCount[dest] = Math.min(255, maxCount[dest]! + 1);
    if (--indegree[dest] === 0) queue.push(dest);
  }
  requireValid(queue.length === activeCount, "acyclic contracted graph");
  const upstreamArea = new Int32Array(size),
    streamOrderProxy = new Uint8Array(size),
    mouthType = new Uint8Array(size),
    mouthBodyId = new Int32Array(size),
    slopeClass = new Uint8Array(size),
    flowPermanenceProxy = new Uint8Array(size);
  const terminalMouth = {
    marine: HYDROLOGY_MOUTH_OCEAN,
    "boundary-export": HYDROLOGY_MOUTH_BOUNDARY_EXPORT,
    "closed-wet": HYDROLOGY_MOUTH_CLOSED_BASIN,
    subtile: HYDROLOGY_MOUTH_SUBTILE,
    dry: HYDROLOGY_MOUTH_DRY,
  } as const;
  // Follow only the already-selected principal attachment to identify the first wet endpoint.
  const resolveMouth = (start: number) => {
    const path: number[] = [],
      seen = new Set<number>();
    let cell = start,
      mouth = 0,
      body = 0;
    while (true) {
      requireValid(!seen.has(cell), "acyclic principal endpoint path");
      seen.add(cell);
      if (mouthType[cell]) {
        mouth = mouthType[cell]!;
        body = mouthBodyId[cell]!;
        break;
      }
      path.push(cell);
      const dest = input.flowDir[cell]!;
      if (dest >= 0 && input.lakeMask[dest]) {
        mouth = HYDROLOGY_MOUTH_ACCEPTED_LAKE;
        body = input.bodyId[dest]!;
        break;
      }
      if (dest < 0 || !landMask[dest]) {
        mouth = terminalMouth[terminals.get(input.terminalId[cell]!)!.role];
        break;
      }
      requireValid(adjacent(cell, dest), "adjacent principal endpoint path");
      cell = dest;
    }
    for (const entry of path) {
      mouthType[entry] = mouth;
      mouthBodyId[entry] = body;
    }
  };
  for (let cell = 0; cell < size; cell++) {
    const v = vertexOf[cell]!;
    if (v < 0) continue;
    upstreamArea[cell] = area[v]!;
    streamOrderProxy[cell] = hierarchy[v]!;
    if (input.lakeMask[cell]) continue;
    resolveMouth(cell);
    const dest = input.flowDir[cell]!;
    const delta = dest < 0 ? 0 : input.elevation[cell]! - input.waterSurface[dest]!;
    slopeClass[cell] = delta <= 0.5 ? 1 : delta <= 4 ? 2 : delta <= 12 ? 3 : 4;
    const specific = input.discharge[cell]! / Math.max(1, area[v]!),
      riverClass = input.riverClass[cell]!;
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
    upstreamArea,
    streamOrderProxy,
    mouthType,
    mouthBodyId,
    slopeClass,
    flowPermanenceProxy,
  };
}
