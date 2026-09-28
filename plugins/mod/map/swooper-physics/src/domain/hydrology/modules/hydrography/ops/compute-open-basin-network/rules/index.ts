import { getHexNeighborIndicesOddQ } from "@swooper/mapgen-core/lib/grid";

import { computeBasinWaterBudget, type BasinWaterBudgetResponse } from "../../../model/policy/basin-water-budget.js";
import { finite, requireValid, type NetworkInput } from "./types.js";
import { validateNetworkInput } from "./validate.js";

type Body = {
  nodeId: number;
  wetCells: number[];
  spillElevation: number;
  outletCell: number;
  receiverCell: number;
  connectorCells: number[];
  flux: BasinWaterBudgetResponse["flux"];
  outflow: number;
};
type Vertex = { cell: number; receiverCell: number; receiverVertex: number; body: Body | null; incoming: number; outflow: number };

const unsupported = <const Witness>(witness: Witness) => ({ status: "unsupported" as const, witness });

/** Certifies raw storage cohorts, then separately admits the actually routed mixed-body ledger. */
export function computeOpenBasinNetwork(input: NetworkInput) {
  const { width, height, elevation: ground, landMask, geometry: g, localRunoff, rainfall, potentialDemand } = input;
  const size = width * height;
  requireValid(Number.isSafeInteger(size) && size > 0 && size <= 0x7fffffff && size === ground.length, "grid cardinality");
  const neighbors = Array.from({ length: size }, (_, cell) => getHexNeighborIndicesOddQ(cell % width, Math.floor(cell / width), width, height));
  validateNetworkInput(input, neighbors);
  const rows = (cells: readonly number[]) => cells.map(cell => ({ cell, ground: ground[cell]!, localRunoff: localRunoff[cell]!, precipitation: rainfall[cell]!, potentialDemand: potentialDemand[cell]! }));
  for (const nodeId of g.roots) if (g.nodes[nodeId - 1]!.spill === null) return unsupported({ kind: "outlet-free-root", nodeId });
  for (let cell = 0; cell < size; cell++) {
    if (landMask[cell] && g.leafId[cell] === 0 && g.rawReceiver[cell] === -1) return unsupported({ kind: "external-land-terminal", cell });
  }

  const certificates: Array<{ nodeId: number; spillBalance: number }> = [];
  for (const node of g.nodes) {
    const response = computeBasinWaterBudget({
      cells: rows(Array.from(g.catchmentCells.slice(node.cellStart, node.cellEnd))),
      incomingOverflow: 0, attainedLevel: node.baseElevation, spillElevation: node.spill!.elevation,
    });
    if (response.state !== "open" || response.overflow <= 0) return unsupported({ kind: "uncertified-node", nodeId: node.id, response });
    certificates.push({ nodeId: node.id, spillBalance: response.overflow });
  }

  const wetMask = new Uint8Array(size), bodyId = new Int32Array(size), rootByCell = new Int32Array(size);
  const waterSurface = Int16Array.from(ground), receiver = g.rawReceiver.slice(), bodies: Body[] = [];
  for (const nodeId of g.roots) {
    const root = g.nodes[nodeId - 1]!, spill = root.spill!;
    const wetCells: number[] = [];
    for (let index = root.cellStart; index < root.cellEnd; index++) {
      const cell = g.catchmentCells[index]!;
      rootByCell[cell] = nodeId;
      if (ground[cell]! >= spill.elevation) continue;
      wetCells.push(cell); wetMask[cell] = 1; bodyId[cell] = nodeId; waterSurface[cell] = spill.elevation;
    }
    requireValid(wetCells.length > 0, `empty positive-capacity root ${nodeId}`);
    wetCells.sort((a, b) => a - b);
    bodies.push({ nodeId, wetCells, spillElevation: spill.elevation, outletCell: -1, receiverCell: -1, connectorCells: [], flux: { incomingOverflow: 0, dryRunoff: 0, wetPrecipitation: 0, wetDemand: 0, balance: 0 }, outflow: 0 });
  }
  for (const body of bodies) for (const cell of body.wetCells) for (const neighbor of neighbors[cell]!) {
    if (wetMask[neighbor] && waterSurface[neighbor] === body.spillElevation && bodyId[neighbor] !== body.nodeId) {
      return unsupported({ kind: "shared-wet-body", nodeIds: Array.of(body.nodeId, bodyId[neighbor]!), cell, neighbor });
    }
  }
  const reversed = new Uint8Array(size), wetVisited = new Uint8Array(size);
  for (const body of bodies) {
    const spill = g.nodes[body.nodeId - 1]!.spill!;
    let cell = spill.fromCell;
    // Reversing this exact zero-depth connector is the only dry receiver change.
    // Its upstream runoff may bypass the wet body, hence the later routed feasibility check.
    while (bodyId[cell] !== body.nodeId) {
      requireValid(cell >= 0 && rootByCell[cell] === body.nodeId && ground[cell] === spill.elevation && !wetMask[cell] && !reversed[cell], `recorded sill connector for root ${body.nodeId}`);
      body.connectorCells.push(cell); reversed[cell] = 1; cell = g.rawReceiver[cell]!;
    }
    for (const [index, connector] of body.connectorCells.entries()) receiver[connector] = index === 0 ? spill.toCell : body.connectorCells[index - 1]!;
    body.outletCell = cell;
    body.receiverCell = body.connectorCells.at(-1) ?? spill.toCell;
    receiver[cell] = body.receiverCell;
    const queue = [cell]; wetVisited[cell] = 1;
    for (let head = 0; head < queue.length; head++) for (const neighbor of neighbors[queue[head]!]!) {
      if (bodyId[neighbor] !== body.nodeId || wetVisited[neighbor]) continue;
      wetVisited[neighbor] = 1; receiver[neighbor] = queue[head]!; queue.push(neighbor);
    }
    if (queue.length !== body.wetCells.length) return unsupported({ kind: "disconnected-wet-footprint", nodeId: body.nodeId, cell: body.wetCells.find(member => !wetVisited[member])! });
  }

  const landCells: number[] = [], cellIndegree = new Int32Array(size), terminalType = new Uint8Array(size);
  for (let cell = 0; cell < size; cell++) if (landMask[cell]) {
    landCells.push(cell);
    const target = receiver[cell]!;
    requireValid(target >= 0 && neighbors[cell]!.includes(target), `final receiver at ${cell}`);
    requireValid(waterSurface[target]! <= waterSurface[cell]!, `ascending water surface at ${cell}`);
    if (!wetMask[cell]) {
      requireValid(ground[target]! <= ground[cell]!, `ascending dry ground at ${cell}`);
      requireValid(reversed[cell] === 1 || receiver[cell] === g.rawReceiver[cell], `unrecorded dry rerouting at ${cell}`);
    }
    if (landMask[target]) cellIndegree[target]++;
    else terminalType[cell] = 1;
  }
  const cellOrder = landCells.filter(cell => cellIndegree[cell] === 0);
  for (let head = 0; head < cellOrder.length; head++) {
    const target = receiver[cellOrder[head]!]!;
    if (landMask[target] && --cellIndegree[target] === 0) cellOrder.push(target);
  }
  if (cellOrder.length !== landCells.length) return unsupported({ kind: "cyclic-network", cells: landCells.filter(cell => cellIndegree[cell]! > 0) });

  const vertexByCell = new Int32Array(size).fill(-1), vertices: Vertex[] = [];
  for (const body of bodies) {
    for (const cell of body.wetCells) vertexByCell[cell] = vertices.length;
    vertices.push({ cell: body.outletCell, receiverCell: body.receiverCell, receiverVertex: -1, body, incoming: 0, outflow: 0 });
  }
  for (const cell of landCells) if (!wetMask[cell]) {
    vertexByCell[cell] = vertices.length;
    vertices.push({ cell, receiverCell: receiver[cell]!, receiverVertex: -1, body: null, incoming: 0, outflow: 0 });
  }
  const indegree = new Int32Array(vertices.length);
  for (const [index, vertex] of vertices.entries()) {
    vertex.receiverVertex = vertexByCell[vertex.receiverCell]!;
    requireValid(vertex.receiverVertex !== index, "self-connected mixed body");
    if (vertex.receiverVertex >= 0) indegree[vertex.receiverVertex]++;
    else requireValid(landMask[vertex.receiverCell] === 0, "nonmarine terminal");
  }
  const order = vertices.flatMap((_, index) => indegree[index] === 0 ? [index] : []);
  const dryDischarge = new Array<number>(size).fill(0);
  const marineExits: Array<{ fromCell: number; marineCell: number; discharge: number }> = [];
  for (let head = 0; head < order.length; head++) {
    const vertex = vertices[order[head]!]!;
    if (vertex.body) {
      const body = vertex.body;
      // The shared budget law evaluates this already attained strict wet footprint.
      // No signed wet-cell subtree or arbitrary internal BFS flow allocation exists.
      const response = computeBasinWaterBudget({ cells: rows(body.wetCells), incomingOverflow: vertex.incoming, attainedLevel: body.spillElevation, spillElevation: body.spillElevation });
      if (response.state === "infeasible-attained-state") return unsupported({ kind: "negative-body-outflow", nodeId: body.nodeId, wetCells: body.wetCells, flux: response.flux });
      requireValid(response.state === "open", "unexpected attained-sill budget response");
      body.flux = response.flux; body.outflow = response.overflow; vertex.outflow = response.overflow;
    } else {
      vertex.outflow = finite(vertex.incoming + localRunoff[vertex.cell]!, "dry discharge");
      dryDischarge[vertex.cell] = vertex.outflow;
    }
    if (vertex.receiverVertex >= 0) {
      const target = vertices[vertex.receiverVertex]!;
      target.incoming = finite(target.incoming + vertex.outflow, "routed incoming supply");
      if (--indegree[vertex.receiverVertex] === 0) order.push(vertex.receiverVertex);
    } else marineExits.push({ fromCell: vertex.cell, marineCell: vertex.receiverCell, discharge: vertex.outflow });
  }
  // A quotient cycle expands to a cell cycle: every body entry reaches its sole outlet.
  requireValid(order.length === vertices.length, "cyclic mixed-body quotient");
  const total = (values: readonly number[]) => values.reduce((sum, value) => finite(sum + value, "aggregate network flux"), 0);
  const dryRunoff = total(landCells.filter(cell => !wetMask[cell]).map(cell => localRunoff[cell]!));
  const wetPrecipitation = total(bodies.map(body => body.flux.wetPrecipitation));
  const wetDemand = total(bodies.map(body => body.flux.wetDemand));
  const externalDischarge = total(marineExits.map(exit => exit.discharge));
  const supply = finite(dryRunoff + wetPrecipitation, "aggregate network supply");
  const residual = externalDischarge - (supply - wetDemand);
  const epsilon = (vertices.length + size + 1) * Number.EPSILON;
  const roundoffBound = finite(3 * epsilon / (1 - epsilon) * finite(supply + wetDemand, "aggregate absolute flux"), "conservation roundoff bound");
  requireValid(Math.abs(residual) <= roundoffBound, "network conservation beyond accumulation roundoff");
  return {
    status: "supported" as const,
    plan: { wetMask, waterSurface, receiver, terminalType, bodyId, dryDischarge, bodies, certificates, marineExits, conservation: { dryRunoff, wetPrecipitation, wetDemand, externalDischarge, residual, roundoffBound } },
  };
}
