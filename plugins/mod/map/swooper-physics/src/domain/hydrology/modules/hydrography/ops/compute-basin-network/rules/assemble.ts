import { BASIN_INTERNAL_RECEIVER, BASIN_TERMINAL, type BasinPool, type BasinWetBody, type BasinHydraulicComponent, type BasinPort, type BasinInternalTransfer, type BasinTerminal } from "../../../model/atoms/basin-network.schema.js";
import { finite, requireValid, type NetworkInput } from "./types.js";
import { sum, type Solved, type Pool } from "./solve.js";

type Flux = BasinPool["flux"];
const flux = (incomingOverflow: number, dryRunoff: number, wetPrecipitation: number, wetDemand: number): Flux => ({ incomingOverflow, dryRunoff, wetPrecipitation, wetDemand, balance: incomingOverflow + dryRunoff + wetPrecipitation - wetDemand });

/** Recomputes all transport from original rows on the final, disjoint partition. */
export function assembleNetwork(input: NetworkInput, neighbors: readonly number[][], solved: Solved) {
  const { elevation: z, geometry: g, landMask, localRunoff: runoff, rainfall, potentialDemand: demand } = input;
  const size = z.length, wetMask = new Uint8Array(size), bodyId = new Int32Array(size), componentId = new Int32Array(size);
  const waterSurface = Array.from(z), receiver = Int32Array.from(g.rawReceiver), dryDischarge = new Array<number>(size).fill(0);
  const terminalId = new Int32Array(size).fill(-1), terminalType = new Uint8Array(size);
  const pools: BasinPool[] = [], bodies: BasinWetBody[] = [], components: BasinHydraulicComponent[] = [], ports: BasinPort[] = [], transfers: BasinInternalTransfer[] = [];
  const terminals: BasinTerminal[] = [], marineExits: Array<{ fromCell: number; marineCell: number; discharge: number }> = [], boundaryExits: Array<{ fromCell: number; side: "north" | "south"; discharge: number }> = [];
  const solutionByComponent = new Map<number, Pool>();
  for (const pool of solved.pools) {
    const response = pool.response;
    requireValid(response.state !== "no-stationary-solution" && response.state !== "infeasible-attained-state", "unresolved pool assembly");
    const wet = [...response.wetCells].sort((a, b) => a - b);
    const junctions = [...pool.junctions].filter(cell => !wet.includes(cell)).sort((a, b) => a - b);
    const members = [...wet, ...junctions];
    const pit = pool.leaves.map(leaf => g.nodes[leaf - 1]!.floorCell).sort((a, b) => z[a]! - z[b]! || a - b)[0]!;
    if (!members.length) { members.push(pit); junctions.push(pit); }
    members.sort((a, b) => a - b);
    const id = members[0]! + 1;
    for (const cell of members) {
      requireValid(componentId[cell] === 0, `overlapping final components at ${cell}`);
      componentId[cell] = id; receiver[cell] = BASIN_INTERNAL_RECEIVER;
    }
    for (const cell of wet) { wetMask[cell] = 1; waterSurface[cell] = pool.level; }
    const poolBodies: BasinWetBody[] = [];
    for (const start of wet) {
      if (bodyId[start]) continue;
      const body = { bodyId: start + 1, componentId: id, poolId: pool.id, wetCells: [start], level: pool.level, flux: flux(0, 0, 0, 0), outflow: 0, unresolvedResidual: 0 };
      bodyId[start] = body.bodyId;
      for (let index = 0; index < body.wetCells.length; index++) for (const target of neighbors[body.wetCells[index]!]!) {
        if (componentId[target] !== id || !wetMask[target] || bodyId[target]) continue;
        bodyId[target] = body.bodyId; body.wetCells.push(target);
      }
      body.wetCells.sort((a, b) => a - b); bodies.push(body); poolBodies.push(body);
    }
    const closure: BasinPool["closure"] = "resolution" in response
      ? response.resolution === "exact-balance" ? { resolution: response.resolution, levels: response.levels }
        : { resolution: response.resolution, level: response.level, ...response.bracket, unresolvedResidual: response.unresolvedResidual }
      : null;
    pools.push({ poolId: pool.id, componentId: id, leafIds: [...pool.leaves], catchmentCells: [...pool.cells], wetCells: wet, state: response.state, level: pool.level, flux: response.flux, outflow: response.overflow, unresolvedResidual: response.unresolvedResidual, closure });
    components.push({ componentId: id, poolId: pool.id, bodyIds: poolBodies.map(body => body.bodyId), memberCells: members, junctionCells: junctions, anchorCell: members[0]!, level: pool.level, state: response.state, flux: flux(0, 0, 0, 0), outflow: response.overflow, unresolvedResidual: response.unresolvedResidual, terminalId: 0 });
    solutionByComponent.set(id, pool);
    if (poolBodies.length) poolBodies[0]!.unresolvedResidual = response.unresolvedResidual;
  }
  components.sort((a, b) => a.componentId - b.componentId); bodies.sort((a, b) => a.bodyId - b.bodyId);
  const bodyById = new Map(bodies.map(body => [body.bodyId, body]));
  type Vertex = { cell: number; component: BasinHydraulicComponent | null; target: number; targetCell: number; incoming: number; outflow: number; terminal: BasinTerminal | null };
  const vertices: Vertex[] = [], vertexAt = new Int32Array(size).fill(-1);
  for (const component of components) {
    const solution = solutionByComponent.get(component.componentId)!;
    for (const cell of component.memberCells) vertexAt[cell] = vertices.length;
    vertices.push({ cell: solution.port?.fromCell ?? component.anchorCell, component, target: -1, targetCell: solution.port?.toCell ?? -1, incoming: 0, outflow: 0, terminal: null });
  }
  for (let cell = 0; cell < size; cell++) if (landMask[cell] && !componentId[cell]) {
    vertexAt[cell] = vertices.length;
    vertices.push({ cell, component: null, target: -1, targetCell: receiver[cell]!, incoming: 0, outflow: 0, terminal: null });
  }
  const incomingAt = new Array<number>(size).fill(0), indegree = new Int32Array(vertices.length);
  for (const [index, vertex] of vertices.entries()) {
    if (vertex.targetCell >= 0 && landMask[vertex.targetCell]) { vertex.target = vertexAt[vertex.targetCell]!; requireValid(vertex.target !== index, "component self port"); indegree[vertex.target]++; }
    if (!vertex.component) requireValid(vertex.targetCell === g.rawReceiver[vertex.cell], "ordinary raw tributary changed");
  }
  const order = vertices.flatMap((_, index) => indegree[index] === 0 ? [index] : []);
  const absolute = sum(Array.from({ length: size }, (_, cell) => landMask[cell] ? runoff[cell]! + rainfall[cell]! + demand[cell]! : 0));
  const epsilon = (8 * size + 8 * vertices.length + 1) * Number.EPSILON;
  requireValid(epsilon < 1, "unsupported accumulation cardinality");
  const roundoffBound = finite(3 * epsilon / (1 - epsilon) * absolute, "roundoff bound");
  const close = (actual: number, expected: number, label: string) => requireValid(Math.abs(actual - expected) <= roundoffBound, `${label}: ${actual} != ${expected}`);
  const addTerminal = (role: BasinTerminal["role"], anchorCell: number, id: number): BasinTerminal => {
    const terminal = { terminalId: anchorCell + 1, role, anchorCell, componentId: id };
    const existing = terminals.find(item => item.terminalId === terminal.terminalId);
    if (existing) { requireValid(existing.role === role && existing.componentId === id, "terminal identity collision"); return existing; }
    terminals.push(terminal); return terminal;
  };
  for (let index = 0; index < order.length; index++) {
    const vertex = vertices[order[index]!]!, component = vertex.component;
    if (component) {
      const dry = component.memberCells.filter(cell => !wetMask[cell]), wet = component.memberCells.filter(cell => wetMask[cell]);
      component.flux = flux(vertex.incoming, sum(dry.map(cell => runoff[cell]!)), sum(wet.map(cell => rainfall[cell]!)), sum(wet.map(cell => demand[cell]!)));
      vertex.outflow = component.outflow;
      close(component.flux.balance, component.outflow + component.unresolvedResidual, `component ${component.componentId} balance`);
    } else { vertex.outflow = finite(vertex.incoming + runoff[vertex.cell]!, "dry discharge"); if (vertex.targetCell >= 0) dryDischarge[vertex.cell] = vertex.outflow; }
    if (vertex.target >= 0) {
      const target = vertices[vertex.target]!;
      target.incoming += vertex.outflow; incomingAt[vertex.targetCell]! += vertex.outflow;
      if (--indegree[vertex.target] === 0) order.push(vertex.target);
    } else if (vertex.targetCell >= 0) {
      requireValid(!landMask[vertex.targetCell], "untyped external receiver");
      marineExits.push({ fromCell: vertex.cell, marineCell: vertex.targetCell, discharge: vertex.outflow });
      vertex.terminal = addTerminal("marine", vertex.cell, component?.componentId ?? 0);
    } else if (component && component.state !== "open") {
      vertex.terminal = addTerminal(component.state === "closed" ? "closed-wet" : component.state, component.anchorCell, component.componentId);
    } else {
      requireValid(vertex.cell < input.width || vertex.cell >= size - input.width, "unadmitted boundary exit");
      const side = vertex.cell < input.width ? "north" as const : "south" as const;
      boundaryExits.push({ fromCell: vertex.cell, side, discharge: vertex.outflow });
      vertex.terminal = addTerminal("boundary-export", vertex.cell, component?.componentId ?? 0);
    }
  }
  requireValid(order.length === vertices.length, "cyclic final external quotient");
  const firstPool = new Int32Array(vertices.length);
  for (const index of [...order].reverse()) {
    const vertex = vertices[index]!;
    firstPool[index] = vertex.component?.poolId ?? (vertex.target >= 0 ? firstPool[vertex.target]! : 0);
    if (vertex.target >= 0) vertex.terminal = vertices[vertex.target]!.terminal;
    requireValid(vertex.terminal, "unresolved terminal");
    const cells = vertex.component?.memberCells ?? [vertex.cell];
    for (const cell of cells) { terminalId[cell] = vertex.terminal.terminalId; terminalType[cell] = BASIN_TERMINAL[vertex.terminal.role]; }
    if (vertex.component) vertex.component.terminalId = vertex.terminal.terminalId;
  }
  for (let cell = 0; cell < size; cell++) if (landMask[cell]) {
    requireValid(firstPool[vertexAt[cell]!] === solved.owner[cell], `source partition differs from first final component at ${cell}`);
  }
  for (const pool of pools) {
    const incoming = sum(vertices.filter(vertex => vertex.component?.poolId !== pool.poolId && vertex.targetCell >= 0 && solved.owner[vertex.targetCell] === pool.poolId && vertex.component).map(vertex => vertex.outflow));
    const dry = pool.catchmentCells.filter(cell => !wetMask[cell]), wet = pool.catchmentCells.filter(cell => wetMask[cell]);
    const recomputed = flux(incoming, sum(dry.map(cell => runoff[cell]!)), sum(wet.map(cell => rainfall[cell]!)), sum(wet.map(cell => demand[cell]!)));
    for (const key of ["incomingOverflow", "dryRunoff", "wetPrecipitation", "wetDemand", "balance"] as const) close(recomputed[key], pool.flux[key], `pool ${pool.poolId} ${key}`);
    if (pool.closure?.resolution === "shoreline-quantization") {
      const closure = pool.closure;
      requireValid(closure.before.balance > 0 && closure.after.balance < 0 && closure.unresolvedResidual === closure.before.balance && closure.unresolvedResidual <= closure.jumpMagnitude, `invalid quantized bracket ${pool.poolId}`);
      close(closure.before.balance - closure.after.balance, closure.jumpMagnitude, `pool ${pool.poolId} shoreline jump`);
    }
  }
  for (const component of components) {
    const solution = solutionByComponent.get(component.componentId)!, port = solution.port;
    if (port) {
      if (port.toCell >= 0) ports.push({ kind: "adjacent", componentId: component.componentId, ...port, destination: !landMask[port.toCell] ? "marine" : componentId[port.toCell] ? "component" : "dry-reach", destinationComponentId: componentId[port.toCell]!, discharge: component.outflow });
      else ports.push({ kind: "boundary-export", componentId: component.componentId, fromCell: port.fromCell, side: port.fromCell < input.width ? "north" : "south", discharge: component.outflow });
    }
    type Internal = { cells: number[]; body: BasinWetBody | null; net: number; parent: number; edge: { childCell: number; parentCell: number } | null };
    const internal: Internal[] = [], internalAt = new Map<number, number>();
    for (const id of component.bodyIds) {
      const body = bodyById.get(id)!;
      for (const cell of body.wetCells) internalAt.set(cell, internal.length);
      body.flux = flux(sum(body.wetCells.map(cell => incomingAt[cell]!)), 0, sum(body.wetCells.map(cell => rainfall[cell]!)), sum(body.wetCells.map(cell => demand[cell]!)));
      internal.push({ cells: body.wetCells, body, net: body.flux.balance - body.unresolvedResidual, parent: -1, edge: null });
    }
    for (const cell of component.memberCells) if (!wetMask[cell]) {
      internalAt.set(cell, internal.length);
      internal.push({ cells: [cell], body: null, net: runoff[cell]! + incomingAt[cell]! - (!component.bodyIds.length && cell === component.anchorCell ? component.unresolvedResidual : 0), parent: -1, edge: null });
    }
    const root = internalAt.get(port?.fromCell ?? component.anchorCell)!;
    const traversal = [root], visited = new Set([root]);
    for (let index = 0; index < traversal.length; index++) {
      const parent = traversal[index]!, candidates: Array<{ child: number; parentCell: number; childCell: number }> = [];
      for (const parentCell of internal[parent]!.cells) for (const childCell of neighbors[parentCell]!) {
        const child = internalAt.get(childCell);
        if (child !== undefined && child !== parent) candidates.push({ child, parentCell, childCell });
      }
      candidates.sort((a, b) => a.childCell - b.childCell || a.parentCell - b.parentCell);
      for (const edge of candidates) if (!visited.has(edge.child)) {
        visited.add(edge.child); traversal.push(edge.child); internal[edge.child]!.parent = parent; internal[edge.child]!.edge = edge;
      }
    }
    requireValid(traversal.length === internal.length, `disconnected hydraulic component ${component.componentId}`);
    const attachments = new Map<number, Array<{ receiver: number; discharge: number }>>();
    const attach = (from: number, to: number, discharge: number): void => {
      if (discharge <= 0 || wetMask[from]) return;
      const list = attachments.get(from) ?? []; list.push({ receiver: to, discharge }); attachments.set(from, list);
    };
    for (const index of [...traversal].reverse()) {
      const vertex = internal[index]!;
      if (!vertex.edge) continue;
      const { childCell, parentCell } = vertex.edge;
      const cellA = Math.min(childCell, parentCell), cellB = Math.max(childCell, parentCell), signedDischarge = childCell === cellA ? vertex.net : -vertex.net;
      transfers.push({ componentId: component.componentId, cellA, cellB, bodyA: bodyId[cellA]!, bodyB: bodyId[cellB]!, signedDischarge });
      const source = vertex.net >= 0 ? childCell : parentCell, target = vertex.net >= 0 ? parentCell : childCell, amount = Math.abs(vertex.net);
      attach(source, target, amount);
      if (bodyId[source]) bodyById.get(bodyId[source]!)!.outflow += amount;
      if (bodyId[target]) bodyById.get(bodyId[target]!)!.flux.incomingOverflow += amount;
      internal[vertex.parent]!.net += vertex.net;
    }
    close(internal[root]!.net, component.outflow, `component ${component.componentId} tree cut`);
    if (port && port.toCell >= 0) {
      attach(port.fromCell, port.toCell, component.outflow);
      if (bodyId[port.fromCell]) bodyById.get(bodyId[port.fromCell]!)!.outflow += component.outflow;
    }
    for (const [cell, options] of attachments) {
      options.sort((a, b) => {
        const isPort = (option: typeof a) => port?.fromCell === cell && port.toCell === option.receiver ? 0 : 1;
        return isPort(a) - isPort(b) || b.discharge - a.discharge || a.receiver - b.receiver;
      });
      receiver[cell] = options[0]!.receiver; dryDischarge[cell] = options[0]!.discharge;
    }
    for (const id of component.bodyIds) {
      const body = bodyById.get(id)!;
      body.flux.balance = body.flux.incomingOverflow + body.flux.wetPrecipitation - body.flux.wetDemand;
      close(body.flux.balance, body.outflow + body.unresolvedResidual, `body ${body.bodyId} balance`);
    }
    // Verify every contracted vertex independently from the emitted signed
    // edges; the spanning-tree cut balances follow by summing these equations.
    for (const vertex of internal) {
      const members = new Set(vertex.cells);
      let balance = vertex.body
        ? sum(vertex.cells.map(cell => rainfall[cell]! - demand[cell]! + incomingAt[cell]!)) - vertex.body.unresolvedResidual
        : runoff[vertex.cells[0]!]! + incomingAt[vertex.cells[0]!]! - (!component.bodyIds.length && vertex.cells[0] === component.anchorCell ? component.unresolvedResidual : 0);
      for (const transfer of transfers) if (transfer.componentId === component.componentId) {
        if (members.has(transfer.cellA)) balance -= transfer.signedDischarge;
        if (members.has(transfer.cellB)) balance += transfer.signedDischarge;
      }
      if (port && members.has(port.fromCell)) balance -= component.outflow;
      close(balance, 0, `component ${component.componentId} internal vertex ${vertex.cells[0]}`);
    }
  }
  for (let cell = 0; cell < size; cell++) if (landMask[cell]) {
    requireValid(terminalId[cell]! > 0 && terminalType[cell]! > 0, `missing terminal at ${cell}`);
    if (receiver[cell]! >= 0) {
      requireValid(neighbors[cell]!.includes(receiver[cell]!), `nonadjacent principal channel at ${cell}`);
      if (!wetMask[cell]) requireValid(z[receiver[cell]!]! <= z[cell]!, `ascending principal channel at ${cell}`);
    }
  }
  const dryRunoff = sum(Array.from({ length: size }, (_, cell) => landMask[cell] && !wetMask[cell] ? runoff[cell]! : 0));
  const wetPrecipitation = sum(bodies.map(body => body.flux.wetPrecipitation)), wetDemand = sum(bodies.map(body => body.flux.wetDemand));
  const marineDischarge = sum(marineExits.map(exit => exit.discharge)), boundaryDischarge = sum(boundaryExits.map(exit => exit.discharge));
  const externalDischarge = marineDischarge + boundaryDischarge, unresolvedResidual = sum(pools.map(pool => pool.unresolvedResidual));
  const residual = dryRunoff + wetPrecipitation - wetDemand - externalDischarge - unresolvedResidual;
  close(residual, 0, "global conservation");
  terminals.sort((a, b) => a.terminalId - b.terminalId);
  return { wetMask, waterSurface, receiver, terminalType, terminalId, bodyId, componentId, dryDischarge, pools, bodies, components, ports, transfers, terminals, marineExits, boundaryExits,
    conservation: { dryRunoff, wetPrecipitation, wetDemand, marineDischarge, boundaryDischarge, externalDischarge, unresolvedResidual, normalizedUnresolvedResidual: dryRunoff + wetPrecipitation ? unresolvedResidual / (dryRunoff + wetPrecipitation) : 0, residual, roundoffBound } };
}
