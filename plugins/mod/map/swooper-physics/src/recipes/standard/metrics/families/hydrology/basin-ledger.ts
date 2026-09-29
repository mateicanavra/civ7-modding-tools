import { getHexNeighborIndicesOddQ } from "@swooper/mapgen-core/lib/grid";
import { BASIN_INTERNAL_RECEIVER, BASIN_TERMINAL } from "../../../../../domain/hydrology/modules/hydrography/model/atoms/basin-network.schema.js";
import type { StandardBasinNetworkMeasurementInput } from "./basin-network.js";

/** Independent accounting over captured source fields and the completed transport graph. */
export function measureBasinLedger(capture: StandardBasinNetworkMeasurementInput) {
  const physical = capture.model.physicalHydrology;
  if (physical.model !== "certified-sill-spill") throw new Error("Expected completed basin evidence.");
  const { width, height } = capture.provenance;
  const size = width * height;
  const { landMask, elevation, plannedLakeMask: wet, flowDir, terminalType, baselineRainfall } = capture.model;
  const { potentialDemand, runoff, discharge, conservation } = physical;
  // Bound arithmetic accumulation from source magnitudes and graph cardinality;
  // neither a claimed larger bound nor unresolved supply can hide lost water.
  let absolute = 0, correction = 0, ordinaryVertexCount = 0;
  for (let cell = 0; cell < size; cell++) if (landMask[cell]) {
    const adjusted = runoff[cell]! + baselineRainfall[cell]! + potentialDemand[cell]! - correction;
    const next = absolute + adjusted;
    correction = (next - absolute) - adjusted; absolute = next;
    if (!physical.componentId[cell]) ordinaryVertexCount++;
  }
  const epsilon = (8 * size + 8 * (ordinaryVertexCount + physical.components.length) + 1) * Number.EPSILON;
  const arithmeticBound = 3 * epsilon / (1 - epsilon) * absolute;
  const roundoffBoundValid = epsilon < 1 && Number.isFinite(arithmeticBound) && conservation.roundoffBound >= 0 && conservation.roundoffBound <= arithmeticBound;
  const inGrid = (cell: number) => Number.isInteger(cell) && cell >= 0 && cell < size;
  const adjacent = (a: number, b: number) => inGrid(a) && inGrid(b) &&
    getHexNeighborIndicesOddQ(a % width, Math.floor(a / width), width, height).includes(b);
  const nonnegative = (value: number) => Number.isFinite(value) && value >= 0;
  const close = (a: number, b: number) => Number.isFinite(a) && Number.isFinite(b) &&
    Math.abs(a - b) <= Math.min(conservation.roundoffBound, arithmeticBound);
  const sameMembers = (a: readonly number[], b: readonly number[]) => a.length === b.length &&
    new Set(a).size === a.length && new Set(b).size === b.length && a.every((item) => b.includes(item));
  const connected = (cells: readonly number[]) => {
    if (!cells.length || cells.some((cell) => !inGrid(cell))) return false;
    const members = new Set(cells), seen = new Set([cells[0]!]), queue = [cells[0]!];
    for (const cell of queue) for (const neighbor of getHexNeighborIndicesOddQ(cell % width, Math.floor(cell / width), width, height))
      if (members.has(neighbor) && !seen.has(neighbor)) { seen.add(neighbor); queue.push(neighbor); }
    return seen.size === cells.length;
  };
  const bodies = new Map(physical.bodies.map((body) => [body.bodyId, body]));
  const components = new Map(physical.components.map((component) => [component.componentId, component]));
  const pools = new Map(physical.pools.map((pool) => [pool.poolId, pool]));
  const terminals = new Map(physical.terminals.map((terminal) => [terminal.terminalId, terminal]));
  const bodyAt = new Int32Array(size), componentAt = new Int32Array(size), poolAt = new Int32Array(size);
  let bodyFootprintMismatchCount = bodies.size === physical.bodies.length ? 0 : 1;
  let componentPartitionMismatchCount = components.size === physical.components.length ? 0 : 1;
  let poolPartitionMismatchCount = pools.size === physical.pools.length ? 0 : 1;
  let terminalPartitionMismatchCount = terminals.size === physical.terminals.length ? 0 : 1;
  let invalidBodyLedgerCount = 0, invalidComponentLedgerCount = 0, invalidPoolLedgerCount = 0;
  let invalidClosureCount = 0, invalidTransferCount = 0, invalidPortCount = 0;
  let dryGroundMismatchCount = 0, nonascendingGroundViolationCount = 0, ordinaryDryLedgerMismatchCount = 0;
  const leaves = new Set<number>();
  if ([physical.waterSurface, physical.bodyId, physical.componentId, physical.basinId, potentialDemand, runoff, discharge,
    wet, landMask, elevation, flowDir, terminalType, baselineRainfall].some((grid) => grid.length !== size)) poolPartitionMismatchCount++;
  for (const pool of physical.pools) {
    if (!pool.leafIds.length || pool.poolId !== Math.min(...pool.leafIds)) poolPartitionMismatchCount++;
    for (const leaf of pool.leafIds) { if (leaves.has(leaf)) poolPartitionMismatchCount++; leaves.add(leaf); }
    for (const cell of pool.catchmentCells) {
      if (!inGrid(cell) || landMask[cell] !== 1 || poolAt[cell]) poolPartitionMismatchCount++;
      if (inGrid(cell)) poolAt[cell] = pool.poolId;
    }
    if (!sameMembers(pool.wetCells, pool.catchmentCells.filter((cell) => wet[cell] === 1))) poolPartitionMismatchCount++;
  }
  for (const body of physical.bodies) {
    if (!connected(body.wetCells) || body.bodyId !== Math.min(...body.wetCells) + 1 ||
      components.get(body.componentId)?.poolId !== body.poolId || !Number.isFinite(body.level)) bodyFootprintMismatchCount++;
    for (const cell of body.wetCells) {
      if (!inGrid(cell) || bodyAt[cell] || landMask[cell] !== 1 || wet[cell] !== 1 ||
        physical.bodyId[cell] !== body.bodyId || physical.waterSurface[cell] !== body.level ||
        elevation[cell]! >= body.level || poolAt[cell] !== body.poolId) bodyFootprintMismatchCount++;
      if (inGrid(cell)) bodyAt[cell] = body.bodyId;
    }
  }
  for (const component of physical.components) {
    const pool = pools.get(component.poolId);
    const expectedBodies = physical.bodies.filter((body) => body.componentId === component.componentId);
    if (!connected(component.memberCells) || component.componentId !== Math.min(...component.memberCells) + 1 ||
      !component.memberCells.includes(component.anchorCell) || !pool || pool.componentId !== component.componentId ||
      pool.state !== component.state || pool.level !== component.level ||
      !sameMembers(component.bodyIds, expectedBodies.map((body) => body.bodyId)) ||
      !sameMembers(pool.wetCells, expectedBodies.flatMap((body) => [...body.wetCells])) ||
      !sameMembers(component.junctionCells, component.memberCells.filter((cell) => !wet[cell])) ||
      expectedBodies.some((body) => body.level !== component.level)) componentPartitionMismatchCount++;
    for (const cell of component.memberCells) {
      if (!inGrid(cell) || componentAt[cell] || landMask[cell] !== 1 || physical.componentId[cell] !== component.componentId ||
        poolAt[cell] !== component.poolId || (wet[cell] && bodies.get(bodyAt[cell]!)?.componentId !== component.componentId) ||
        (!wet[cell] && component.bodyIds.length > 0 && elevation[cell] !== component.level)) componentPartitionMismatchCount++;
      if (inGrid(cell)) componentAt[cell] = component.componentId;
    }
    if ((component.state === "subtile" || component.state === "dry") !== (component.bodyIds.length === 0)) componentPartitionMismatchCount++;
  }

  type Edge = { from: number; to: number; amount: number };
  const external: Edge[] = [], internal: Edge[] = [];
  const boundaryAt = new Map<number, number>();
  const marineEdges = new Map<string, number>();
  for (const exit of physical.boundaryExits) {
    if (!inGrid(exit.fromCell) || landMask[exit.fromCell] !== 1 || !nonnegative(exit.discharge) || boundaryAt.has(exit.fromCell) ||
      Math.floor(exit.fromCell / width) !== (exit.side === "north" ? 0 : height - 1)) invalidPortCount++;
    boundaryAt.set(exit.fromCell, exit.discharge);
  }
  for (const exit of physical.marineExits) {
    const key = `${exit.fromCell}:${exit.marineCell}`;
    if (!adjacent(exit.fromCell, exit.marineCell) || landMask[exit.fromCell] !== 1 || landMask[exit.marineCell] !== 0 ||
      !nonnegative(exit.discharge) || marineEdges.has(key)) invalidPortCount++;
    marineEdges.set(key, exit.discharge);
  }
  for (const port of physical.ports) {
    const component = components.get(port.componentId);
    if (!component || componentAt[port.fromCell] !== port.componentId || !nonnegative(port.discharge) || port.discharge <= 0 ||
      component.state !== "open" || !close(port.discharge, component.outflow)) invalidPortCount++;
    if (port.kind === "adjacent") {
      const destination = !landMask[port.toCell] ? "marine" : componentAt[port.toCell] ? "component" : "dry-reach";
      if (!adjacent(port.fromCell, port.toCell) || componentAt[port.toCell] === port.componentId || port.destination !== destination ||
        port.destinationComponentId !== componentAt[port.toCell]) invalidPortCount++;
      external.push({ from: port.fromCell, to: port.toCell, amount: port.discharge });
    } else if (!close(boundaryAt.get(port.fromCell) ?? Number.NaN, port.discharge) ||
      !physical.boundaryExits.some((exit) => exit.fromCell === port.fromCell && exit.side === port.side)) invalidPortCount++;
  }
  const transferKeys = new Set<string>();
  for (const transfer of physical.transfers) {
    const { cellA, cellB, componentId, bodyA, bodyB, signedDischarge } = transfer;
    const key = `${cellA}:${cellB}`;
    if (!adjacent(cellA, cellB) || cellA >= cellB || transferKeys.has(key) || !Number.isFinite(signedDischarge) ||
      !components.has(componentId) || componentAt[cellA] !== componentId || componentAt[cellB] !== componentId ||
      bodyAt[cellA] !== bodyA || bodyAt[cellB] !== bodyB || (bodyA !== 0 && bodyA === bodyB)) invalidTransferCount++;
    transferKeys.add(key);
    internal.push(signedDischarge >= 0 ? { from: cellA, to: cellB, amount: signedDischarge }
      : { from: cellB, to: cellA, amount: -signedDischarge });
  }
  for (let cell = 0; cell < size; cell++) {
    if (bodyAt[cell] !== physical.bodyId[cell] || (bodyAt[cell]! > 0) !== (wet[cell] === 1)) bodyFootprintMismatchCount++;
    if (componentAt[cell] !== physical.componentId[cell]) componentPartitionMismatchCount++;
    if (!Number.isFinite(physical.waterSurface[cell]) || (!wet[cell] && physical.waterSurface[cell] !== elevation[cell])) dryGroundMismatchCount++;
    if (!landMask[cell]) {
      if (physical.basinId[cell] !== -1 || terminalType[cell] !== BASIN_TERMINAL.none || componentAt[cell] || bodyAt[cell]) terminalPartitionMismatchCount++;
      continue;
    }
    const terminal = terminals.get(physical.basinId[cell]!);
    if (!terminal || terminalType[cell] !== BASIN_TERMINAL[terminal.role] ||
      (componentAt[cell] && components.get(componentAt[cell]!)?.terminalId !== physical.basinId[cell])) terminalPartitionMismatchCount++;
    if (wet[cell]) {
      if (flowDir[cell] !== BASIN_INTERNAL_RECEIVER || discharge[cell] !== 0) invalidTransferCount++;
      continue;
    }
    const receiver = flowDir[cell]!;
    if (receiver >= 0) {
      if (!adjacent(cell, receiver) || elevation[receiver]! > elevation[cell]!) nonascendingGroundViolationCount++;
      if (landMask[receiver] && physical.basinId[receiver] !== physical.basinId[cell]) terminalPartitionMismatchCount++;
    } else if (componentAt[cell]) {
      if (receiver !== BASIN_INTERNAL_RECEIVER || discharge[cell] !== 0) nonascendingGroundViolationCount++;
    } else if (receiver !== -1 || !boundaryAt.has(cell) || terminal?.role !== "boundary-export" || terminal.anchorCell !== cell) {
      nonascendingGroundViolationCount++;
    }
    if (!nonnegative(discharge[cell]!) || !nonnegative(runoff[cell]!)) ordinaryDryLedgerMismatchCount++;
    if (!componentAt[cell] && receiver >= 0) external.push({ from: cell, to: receiver, amount: discharge[cell]! });
  }
  const incoming = (cells: ReadonlySet<number>, edges: readonly Edge[]) => edges.reduce((sum, edge) =>
    sum + (cells.has(edge.to) && !cells.has(edge.from) ? edge.amount : 0), 0);
  const outgoing = (cells: ReadonlySet<number>, edges: readonly Edge[]) => edges.reduce((sum, edge) =>
    sum + (cells.has(edge.from) && !cells.has(edge.to) ? edge.amount : 0), 0) +
    [...cells].reduce((sum, cell) => sum + (boundaryAt.get(cell) ?? 0), 0);
  const allEdges = [...external, ...internal];
  const externalIncoming = new Float64Array(size), externalOutgoing = new Float64Array(size);
  const internalIncoming = new Float64Array(size), internalOutgoing = new Float64Array(size);
  const attachments = new Map<number, Edge[]>();
  for (const edge of external) {
    if (inGrid(edge.from)) externalOutgoing[edge.from]! += edge.amount;
    if (inGrid(edge.to)) externalIncoming[edge.to]! += edge.amount;
  }
  for (const edge of internal) {
    if (inGrid(edge.from)) internalOutgoing[edge.from]! += edge.amount;
    if (inGrid(edge.to)) internalIncoming[edge.to]! += edge.amount;
  }
  for (const edge of allEdges) if (edge.amount > 0) {
    const candidates = attachments.get(edge.from) ?? [];
    candidates.push(edge); attachments.set(edge.from, candidates);
  }
  for (const [cell, amount] of boundaryAt) if (inGrid(cell)) externalOutgoing[cell]! += amount;

  // Trace terminals on the complete contracted DAG, not the possibly splitting
  // principal junction attachment, and reject cycles even when they carry zero.
  const vertexAt = new Int32Array(size).fill(-1);
  const vertices: { cells: readonly number[]; target: number; terminal: number }[] = [];
  for (const component of physical.components) {
    for (const cell of component.memberCells) if (inGrid(cell)) vertexAt[cell] = vertices.length;
    vertices.push({ cells: component.memberCells, target: -1,
      terminal: component.state === "open" ? 0 : component.anchorCell + 1 });
  }
  for (let cell = 0; cell < size; cell++) if (landMask[cell] && !componentAt[cell]) {
    vertexAt[cell] = vertices.length; vertices.push({ cells: [cell], target: -1, terminal: 0 });
  }
  const indegree = new Int32Array(vertices.length);
  for (const edge of external) {
    const vertex = vertices[vertexAt[edge.from]!];
    if (!vertex) continue;
    if (landMask[edge.to]) {
      const target = vertexAt[edge.to]!;
      if (target < 0 || vertex.target !== -1 || vertexAt[edge.from] === target) terminalPartitionMismatchCount++;
      else { vertex.target = target; indegree[target]!++; }
    } else vertex.terminal = edge.from + 1;
  }
  for (const cell of boundaryAt.keys()) {
    const vertex = vertices[vertexAt[cell]!];
    if (vertex) vertex.terminal = cell + 1;
  }
  const order = vertices.flatMap((_, index) => indegree[index] === 0 ? [index] : []);
  for (const index of order) {
    const target = vertices[index]!.target;
    if (target >= 0 && --indegree[target]! === 0) order.push(target);
  }
  const routingCycleVertexCount = vertices.length - order.length;
  for (const index of [...order].reverse()) {
    const vertex = vertices[index]!;
    if (vertex.target >= 0) vertex.terminal = vertices[vertex.target]!.terminal;
    if (!terminals.has(vertex.terminal) || vertex.cells.some((cell) => physical.basinId[cell] !== vertex.terminal)) terminalPartitionMismatchCount++;
  }
  const sourceFlux = (cells: readonly number[], incomingOverflow: number) => {
    let dryRunoff = 0, wetPrecipitation = 0, wetDemand = 0;
    for (const cell of cells) {
      if (wet[cell]) { wetPrecipitation += baselineRainfall[cell]!; wetDemand += potentialDemand[cell]!; }
      else dryRunoff += runoff[cell]!;
    }
    return { incomingOverflow, dryRunoff, wetPrecipitation, wetDemand,
      balance: incomingOverflow + dryRunoff + wetPrecipitation - wetDemand };
  };
  type Flux = (typeof physical.pools)[number]["flux"];
  const fluxMatches = (actual: Flux, expected: Flux) => Object.entries(expected).every(([key, value]) =>
    close(actual[key as keyof Flux], value)) && Object.entries(actual).every(([key, value]) =>
      Number.isFinite(value) && (key === "balance" || value >= 0));
  const ledgerMatches = (record: { flux: Flux; outflow: number; unresolvedResidual: number }, expected: Flux, outflow: number) =>
    fluxMatches(record.flux, expected) && nonnegative(record.outflow) && nonnegative(record.unresolvedResidual) &&
    close(record.outflow, outflow) && close(expected.balance, outflow + record.unresolvedResidual);
  for (const body of physical.bodies) {
    const cells = new Set(body.wetCells);
    if (!ledgerMatches(body, sourceFlux(body.wetCells, incoming(cells, allEdges)), outgoing(cells, allEdges))) invalidBodyLedgerCount++;
  }
  for (const component of physical.components) {
    const cells = new Set(component.memberCells), ports = physical.ports.filter((port) => port.componentId === component.componentId);
    const pool = pools.get(component.poolId);
    const node = (cell: number) => bodyAt[cell]! > 0 ? `body:${bodyAt[cell]}` : `junction:${cell}`;
    const nodes = new Set(component.memberCells.map(node)), reached = new Set<string>();
    const graph = new Map<string, string[]>();
    const componentTransfers = physical.transfers.filter((transfer) => transfer.componentId === component.componentId);
    for (const transfer of componentTransfers) {
      const a = node(transfer.cellA), b = node(transfer.cellB);
      graph.set(a, [...(graph.get(a) ?? []), b]); graph.set(b, [...(graph.get(b) ?? []), a]);
    }
    const queue = nodes.size ? [nodes.values().next().value!] : [];
    for (const next of queue) {
      if (reached.has(next)) continue;
      reached.add(next);
      for (const neighbor of graph.get(next) ?? []) if (!reached.has(neighbor)) queue.push(neighbor);
    }
    if (componentTransfers.length !== nodes.size - 1 || reached.size !== nodes.size) invalidTransferCount++;
    if (ports.length !== (component.state === "open" ? 1 : 0) ||
      (component.state === "open" ? component.outflow <= 0 || component.unresolvedResidual !== 0 : component.outflow !== 0)) invalidPortCount++;
    const bodyResidual = component.bodyIds.reduce((sum, id) => sum + (bodies.get(id)?.unresolvedResidual ?? Number.NaN), 0);
    if (!ledgerMatches(component, sourceFlux(component.memberCells, incoming(cells, external)), outgoing(cells, external)) ||
      !close(component.unresolvedResidual, pool?.unresolvedResidual ?? Number.NaN) ||
      (component.bodyIds.length > 0 && !close(bodyResidual, component.unresolvedResidual))) invalidComponentLedgerCount++;
    for (const cell of component.memberCells) {
      if (wet[cell]) continue;
      const retained = !component.bodyIds.length && cell === component.anchorCell ? component.unresolvedResidual : 0;
      if (!close(runoff[cell]! + externalIncoming[cell]! + internalIncoming[cell]!,
        externalOutgoing[cell]! + internalOutgoing[cell]! + retained)) invalidTransferCount++;
      const candidates = attachments.get(cell) ?? [];
      candidates.sort((a, b) => Number(!external.includes(a)) - Number(!external.includes(b)) || b.amount - a.amount || a.to - b.to);
      const principal = candidates[0];
      if (principal ? flowDir[cell] !== principal.to || !close(discharge[cell]!, principal.amount)
        : flowDir[cell] !== BASIN_INTERNAL_RECEIVER || discharge[cell] !== 0) invalidTransferCount++;
    }
  }
  for (let cell = 0; cell < size; cell++) {
    if (!landMask[cell] || componentAt[cell]) continue;
    if (!close(runoff[cell]! + externalIncoming[cell]!, externalOutgoing[cell]!)) ordinaryDryLedgerMismatchCount++;
    const receiver = flowDir[cell]!;
    if (!poolAt[cell] && receiver >= 0 && poolAt[receiver]) poolPartitionMismatchCount++;
    if (poolAt[cell] && receiver >= 0 && poolAt[cell] !== poolAt[receiver]) poolPartitionMismatchCount++;
  }
  for (const pool of physical.pools) {
    const cells = new Set(pool.catchmentCells), expected = sourceFlux(pool.catchmentCells, incoming(cells, external));
    if (!ledgerMatches(pool, expected, outgoing(cells, external))) invalidPoolLedgerCount++;
    const closure = pool.closure;
    if (pool.state === "open" || pool.state === "dry") {
      if (closure !== null || pool.unresolvedResidual !== 0) invalidClosureCount++;
    } else if (closure?.resolution === "exact-balance") {
      const { lower, upper, lowerInclusive, upperInclusive } = closure.levels;
      if (!(pool.level > lower || (lowerInclusive && pool.level === lower)) ||
        !(upper === null || pool.level < upper || (upperInclusive && pool.level === upper)) ||
        pool.unresolvedResidual !== 0 || !close(expected.balance, 0)) invalidClosureCount++;
    } else if (closure?.resolution === "shoreline-quantization") {
      const cohort = pool.catchmentCells.filter((cell) => elevation[cell] === closure.level);
      const after = { ...expected };
      for (const cell of cohort) { after.dryRunoff -= runoff[cell]!; after.wetPrecipitation += baselineRainfall[cell]!; after.wetDemand += potentialDemand[cell]!; }
      after.balance = after.incomingOverflow + after.dryRunoff + after.wetPrecipitation - after.wetDemand;
      if (closure.level !== pool.level || !sameMembers(closure.cohortCells, cohort) || !cohort.length ||
        !fluxMatches(closure.before, expected) || !fluxMatches(closure.after, after) || closure.before.balance <= 0 || closure.after.balance >= 0 ||
        !close(closure.jumpMagnitude, closure.before.balance - closure.after.balance) ||
        !close(closure.unresolvedResidual, closure.before.balance) || !close(pool.unresolvedResidual, closure.unresolvedResidual) ||
        closure.unresolvedResidual <= 0 || closure.unresolvedResidual > closure.jumpMagnitude) invalidClosureCount++;
    } else invalidClosureCount++;
    if (!sameMembers(pool.wetCells, pool.catchmentCells.filter((cell) => elevation[cell]! < pool.level))) invalidClosureCount++;
  }
  for (const terminal of physical.terminals) {
    const component = components.get(terminal.componentId);
    if (!inGrid(terminal.anchorCell) || terminal.terminalId !== terminal.anchorCell + 1 ||
      landMask[terminal.anchorCell] !== 1 || physical.basinId[terminal.anchorCell] !== terminal.terminalId ||
      componentAt[terminal.anchorCell] !== terminal.componentId) terminalPartitionMismatchCount++;
    if (terminal.role === "marine") {
      if (!physical.marineExits.some((exit) => exit.fromCell === terminal.anchorCell)) terminalPartitionMismatchCount++;
    } else if (terminal.role === "boundary-export") {
      if (!boundaryAt.has(terminal.anchorCell)) terminalPartitionMismatchCount++;
    } else if (!component || component.state !== (terminal.role === "closed-wet" ? "closed" : terminal.role) ||
      component.anchorCell !== terminal.anchorCell || component.outflow !== 0) terminalPartitionMismatchCount++;
  }
  const realizedMarine = external.filter((edge) => landMask[edge.to] === 0);
  if (realizedMarine.length !== marineEdges.size) invalidPortCount++;
  for (const edge of realizedMarine) if (!close(edge.amount, marineEdges.get(`${edge.from}:${edge.to}`) ?? Number.NaN)) invalidPortCount++;
  for (const cell of boundaryAt.keys()) {
    if (componentAt[cell] ? !physical.ports.some((port) => port.kind === "boundary-export" && port.fromCell === cell)
      : flowDir[cell] !== -1) invalidPortCount++;
  }
  const allLand = Array.from({ length: size }, (_, cell) => cell).filter((cell) => landMask[cell] === 1);
  const total = sourceFlux(allLand, 0);
  const marineDischarge = physical.marineExits.reduce((sum, exit) => sum + exit.discharge, 0);
  const boundaryDischarge = physical.boundaryExits.reduce((sum, exit) => sum + exit.discharge, 0);
  const externalDischarge = marineDischarge + boundaryDischarge;
  const unresolvedResidual = physical.pools.reduce((sum, pool) => sum + pool.unresolvedResidual, 0);
  const recomputedResidual = total.balance - externalDischarge - unresolvedResidual;
  const normalizedUnresolvedResidual = total.dryRunoff + total.wetPrecipitation ? unresolvedResidual / (total.dryRunoff + total.wetPrecipitation) : 0;
  const conservationValid = roundoffBoundValid && Object.entries(conservation).every(([key, value]) => Number.isFinite(value) && (key === "residual" || value >= 0)) &&
    close(conservation.residual, recomputedResidual) && close(recomputedResidual, 0) && close(conservation.residual, 0) &&
    close(total.dryRunoff, conservation.dryRunoff) && close(total.wetPrecipitation, conservation.wetPrecipitation) &&
    close(total.wetDemand, conservation.wetDemand) && close(marineDischarge, conservation.marineDischarge) &&
    close(boundaryDischarge, conservation.boundaryDischarge) && close(externalDischarge, conservation.externalDischarge) &&
    close(unresolvedResidual, conservation.unresolvedResidual) && close(normalizedUnresolvedResidual, conservation.normalizedUnresolvedResidual) &&
    invalidBodyLedgerCount === 0 && invalidComponentLedgerCount === 0 && invalidPoolLedgerCount === 0 && ordinaryDryLedgerMismatchCount === 0;
  return {
    poolCount: physical.pools.length, componentCount: physical.components.length, terminalCount: physical.terminals.length,
    bodyFootprintMismatchCount, componentPartitionMismatchCount, poolPartitionMismatchCount, terminalPartitionMismatchCount,
    invalidBodyLedgerCount, invalidComponentLedgerCount, invalidPoolLedgerCount, invalidClosureCount, invalidTransferCount, invalidPortCount,
    ordinaryDryLedgerMismatchCount, dryGroundMismatchCount, nonascendingGroundViolationCount, routingCycleVertexCount,
    reportedResidual: conservation.residual, recomputedResidual, roundoffBound: conservation.roundoffBound, roundoffBoundValid,
    unresolvedResidual, normalizedUnresolvedResidual, marineDischarge, boundaryDischarge, conservationValid,
    partitionsAndLedgersValid: poolPartitionMismatchCount === 0 && componentPartitionMismatchCount === 0 && terminalPartitionMismatchCount === 0 &&
      invalidBodyLedgerCount === 0 && invalidComponentLedgerCount === 0 && invalidPoolLedgerCount === 0 && invalidClosureCount === 0 &&
      invalidTransferCount === 0 && invalidPortCount === 0 && ordinaryDryLedgerMismatchCount === 0 && routingCycleVertexCount === 0,
    physicalFootprintsValid: bodyFootprintMismatchCount === 0 && componentPartitionMismatchCount === 0 && poolPartitionMismatchCount === 0 &&
      terminalPartitionMismatchCount === 0 && dryGroundMismatchCount === 0 && nonascendingGroundViolationCount === 0 && routingCycleVertexCount === 0,
  };
}
