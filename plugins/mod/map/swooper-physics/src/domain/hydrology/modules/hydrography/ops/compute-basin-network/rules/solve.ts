import { computeBasinWaterBudget, type BasinWaterBudgetResponse } from "../../../model/policy/basin-water-budget.js";
import { requireValid, type NetworkInput } from "./types.js";

export type Crossing = { elevation: number; fromCell: number; toCell: number };
export type Pool = {
  id: number; generation: number; leaves: number[]; base: number; cells: number[];
  junctions: Set<number>; response: BasinWaterBudgetResponse; level: number;
  frontier: Crossing | null; port: { fromCell: number; toCell: number } | null;
};
export type Solved = { pools: Pool[]; owner: Int32Array };

export function sum(values: Iterable<number>): number {
  let total = 0, correction = 0;
  for (const value of values) {
    const adjusted = value - correction, next = total + adjusted;
    correction = (next - total) - adjusted; total = next;
  }
  requireValid(Number.isFinite(total), "nonfinite sum");
  return total;
}

/** Exact next binary64, not a tolerance or a fractional stationary root. */
export function nextUp(value: number): number {
  if (value === 0) return Number.MIN_VALUE;
  const view = new DataView(new ArrayBuffer(8));
  view.setFloat64(0, value);
  const bits = view.getBigUint64(0);
  view.setBigUint64(0, value > 0 ? bits + 1n : bits - 1n);
  return view.getFloat64(0);
}

export function responseLevel(response: BasinWaterBudgetResponse, base: number): number {
  if ("level" in response) return response.level;
  if (response.state === "closed") {
    const { lower, lowerInclusive, upper, upperInclusive } = response.levels;
    const level = lowerInclusive ? lower : nextUp(lower);
    requireValid(Number.isFinite(level) && (upper === null || level < upper || level === upper && upperInclusive), "empty exact-balance interval");
    return level;
  }
  return base;
}

export function budgetRows(input: NetworkInput, cells: readonly number[]) {
  return cells.map(cell => ({ cell, ground: input.elevation[cell]!, localRunoff: input.localRunoff[cell]!, precipitation: input.rainfall[cell]!, potentialDemand: input.potentialDemand[cell]! }));
}

/** Independent check of the geometry's root overflow order, not reciprocal sibling pointers. */
function validateRootDag(input: NetworkInput): Map<number, number> {
  const g = input.geometry, rootOf = new Map<number, number>();
  for (const node of g.nodes) if (node.kind === "leaf") {
    let root = node;
    while (root.parentId !== -1) root = g.nodes[root.parentId - 1]!;
    rootOf.set(node.id, root.id);
  }
  const state = new Map<number, number>();
  const visit = (id: number): void => {
    requireValid(state.get(id) !== 1, `cyclic root overflow dependency at ${id}`);
    if (state.get(id) === 2) return;
    state.set(id, 1);
    const leaf = g.nodes[id - 1]!.spill?.targetLeafId ?? 0;
    if (leaf) {
      const target = rootOf.get(leaf)!;
      requireValid(target !== id, `internal root spill at ${id}`);
      visit(target);
    }
    state.set(id, 2);
  };
  for (const root of g.roots) visit(root);
  const indegree = new Map(g.roots.map(id => [id, 0])), target = new Map<number, number>();
  for (const id of g.roots) {
    const leaf = g.nodes[id - 1]!.spill?.targetLeafId ?? 0;
    if (leaf) { const to = rootOf.get(leaf)!; target.set(id, to); indegree.set(to, indegree.get(to)! + 1); }
  }
  const queue = g.roots.filter(id => indegree.get(id) === 0), ranks = new Map<number, number>();
  for (let index = 0; index < queue.length; index++) {
    const id = queue[index]!; ranks.set(id, index);
    const to = target.get(id);
    if (to !== undefined) { indegree.set(to, indegree.get(to)! - 1); if (indegree.get(to) === 0) queue.push(to); }
  }
  return new Map([...rootOf].map(([leaf, root]) => [leaf, ranks.get(root)!]));
}

/**
 * Absolute deliveries on the current quotient. A new generation either admits a
 * finite sill plateau or contracts saturated pools. Between these events every
 * response graph is a DAG; repeated identical deliveries do not enqueue work.
 */
export function solvePools(input: NetworkInput, neighbors: readonly number[][]): Solved {
  const { geometry: g, elevation: z, landMask } = input, size = z.length;
  const rootRank = validateRootDag(input);
  const nodeLeaves = new Map<number, number[]>();
  for (const node of g.nodes) nodeLeaves.set(node.id, node.kind === "leaf" ? [node.id] : node.children.flatMap(id => nodeLeaves.get(id)!).sort((a, b) => a - b));
  const nodeByLeaves = new Map(g.nodes.map(node => [nodeLeaves.get(node.id)!.join(","), node]));
  let generation = 0;
  let pools: Pool[] = g.nodes.filter(node => node.kind === "leaf").map(node => ({
    id: node.id, generation, leaves: [node.id], base: node.floorElevation,
    cells: Array.from(g.catchmentCells.slice(node.cellStart, node.cellEnd)), junctions: new Set<number>(),
    response: { state: "dry", wetCells: [], flux: { incomingOverflow: 0, dryRunoff: 0, wetPrecipitation: 0, wetDemand: 0, balance: 0 }, overflow: 0, unresolvedResidual: 0 },
    level: node.floorElevation, frontier: null, port: null,
  }));
  let owner = new Int32Array(size);
  const partitions = new Set<string>();
  const compare = (a: Crossing, b: Crossing) => a.elevation - b.elevation || Math.min(a.fromCell, a.toCell) - Math.min(b.fromCell, b.toCell) || Math.max(a.fromCell, a.toCell) - Math.max(b.fromCell, b.toCell);
  const merge = (members: Pool[], head: number): void => {
    const ids = new Set(members.map(pool => pool.id));
    const leaves = members.flatMap(pool => pool.leaves).sort((a, b) => a - b);
    const leafSet = new Set(leaves), junctions = new Set(members.flatMap(pool => [...pool.junctions]));
    for (const saddle of g.saddles) if (saddle.elevation === head && leafSet.has(saddle.leafA) && leafSet.has(saddle.leafB)) {
      for (const cell of [saddle.cellA, saddle.cellB]) if (z[cell] === head) junctions.add(cell);
    }
    pools = pools.filter(pool => !ids.has(pool.id));
    pools.push({ ...members[0]!, id: leaves[0]!, generation: ++generation, leaves, base: head,
      cells: members.flatMap(pool => pool.cells).sort((a, b) => a - b),
      junctions, frontier: null, port: null });
    pools.sort((a, b) => a.id - b.id);
  };
  for (;;) {
    const partition = pools.map(pool => `${pool.leaves.join(",")}:${pool.base}:${[...pool.junctions].sort((a, b) => a - b).join(",")}`).join(";");
    requireValid(!partitions.has(partition), `repeated current partition without a new finite event: ${partition}`);
    partitions.add(partition);
    generation++;
    const byId = new Map(pools.map(pool => [pool.id, pool]));
    const byLeaf = new Map(pools.flatMap(pool => pool.leaves.map(leaf => [leaf, pool] as const)));
    const junctionOwner = new Int32Array(size);
    for (const pool of pools) for (const cell of pool.junctions) {
      requireValid(junctionOwner[cell] === 0 || junctionOwner[cell] === pool.id, "shared uncontracted junction");
      junctionOwner[cell] = pool.id;
    }
    owner = new Int32Array(size).fill(-1);
    for (let cell = 0; cell < size; cell++) if (!landMask[cell]) owner[cell] = 0;
    const resolveOwner = (start: number): number => {
      let cell = start;
      const path: number[] = [];
      while (owner[cell] === -1) {
        if (junctionOwner[cell]) { owner[cell] = junctionOwner[cell]!; break; }
        path.push(cell);
        const target = g.rawReceiver[cell]!;
        if (target < 0) { owner[cell] = byLeaf.get(g.leafId[cell]!)?.id ?? 0; break; }
        cell = target;
      }
      const id = owner[cell]!;
      for (const member of path) owner[member] = id;
      return id;
    };
    for (let cell = 0; cell < size; cell++) if (landMask[cell]) resolveOwner(cell);
    for (const pool of pools) { pool.cells = []; pool.frontier = null; pool.port = null; pool.generation = generation; }
    for (let cell = 0; cell < size; cell++) if (owner[cell]! > 0) byId.get(owner[cell]!)!.cells.push(cell);
    for (const saddle of g.saddles) {
      const a = byLeaf.get(saddle.leafA), b = byLeaf.get(saddle.leafB);
      if (a === b) continue;
      for (const [pool, fromCell, toCell] of [[a, saddle.cellA, saddle.cellB], [b, saddle.cellB, saddle.cellA]] as const) {
        if (!pool) continue;
        const crossing = { elevation: saddle.elevation, fromCell, toCell };
        requireValid(crossing.elevation >= pool.base, `frontier below attained pool ${pool.id}`);
        if (!pool.frontier || compare(crossing, pool.frontier) < 0) pool.frontier = crossing;
      }
    }
    // A complete geometry node keeps its recorded directed outlet. Equal-height
    // alternate crossings are connectivity evidence, not new upstream supply.
    for (const pool of pools) {
      const node = nodeByLeaves.get(pool.leaves.join(","));
      if (node) pool.frontier = node.spill ? { elevation: node.spill.elevation, fromCell: node.spill.fromCell, toCell: node.spill.toCell } : null;
    }
    type Delivery = { generation: number; target: number; fromCell: number; toCell: number; amount: number };
    const deliveries = new Map<number, Delivery>();
    const evaluated = new Set<number>();
    const queued = new Set<number>(pools.map(pool => pool.id));
    const queue = pools.map(pool => ({ id: pool.id, generation }));
    let restart = false;
    let delivering = false;
    for (let index = 0; index < queue.length; index++) {
      const rank = (id: number) => Math.max(...byId.get(id)!.leaves.map(leaf => rootRank.get(leaf)!));
      const tail = queue.splice(index).sort((a, b) => rank(a.id) - rank(b.id) || (byId.get(a.id)?.frontier?.elevation ?? Infinity) - (byId.get(b.id)?.frontier?.elevation ?? Infinity) || a.id - b.id);
      queue.push(...tail);
      const event = queue[index]!;
      if (event.generation !== generation || !queued.delete(event.id)) continue;
      const pool = byId.get(event.id)!;
      const incoming = sum([...deliveries.values()].filter(value => value.target === pool.id).map(value => value.amount));
      requireValid(pool.cells.length > 0, `empty active pool ${pool.id}`);
      pool.response = computeBasinWaterBudget({ cells: budgetRows(input, pool.cells), incomingOverflow: incoming, attainedLevel: pool.base, spillElevation: pool.frontier?.elevation ?? null });
      pool.level = responseLevel(pool.response, pool.base);
      evaluated.add(pool.id);

      // Saturated sibling and cross-root contacts contract before their reciprocal
      // contributions can circulate. This also absorbs a previously final response.
      const contacts = new Set<Pool>([pool]);
      const contactQueue = [pool];
      for (const member of contactQueue) for (const saddle of g.saddles) {
        const a = byLeaf.get(saddle.leafA), b = byLeaf.get(saddle.leafB);
        if (!a || !b || a === b || !evaluated.has(a.id) || !evaluated.has(b.id) || a.level !== b.level || a.level !== saddle.elevation) continue;
        if (a.response.state === "infeasible-attained-state" || b.response.state === "infeasible-attained-state") continue;
        const other = a === member ? b : b === member ? a : null;
        if (other && !contacts.has(other)) { contacts.add(other); contactQueue.push(other); }
      }
      if (contacts.size > 1) { merge([...contacts], pool.level); restart = true; break; }

      if (pool.response.state === "open") {
        const head = pool.level, plateau: number[] = [];
        const seen = new Set<number>();
        // Admit the selected sill's plateau, not every unrelated shoreline
        // plateau touching the reservoir; other raw tributaries stay untouched.
        const seeds = [...pool.junctions, ...(pool.frontier ? [pool.frontier.fromCell, pool.frontier.toCell] : [])];
        for (const cell of seeds) if (landMask[cell] && z[cell] === head && !seen.has(cell)) { seen.add(cell); plateau.push(cell); }
        for (let at = 0; at < plateau.length; at++) for (const neighbor of neighbors[plateau[at]!]!) {
          if (landMask[neighbor] && z[neighbor] === head && !seen.has(neighbor)) { seen.add(neighbor); plateau.push(neighbor); }
        }
        const touched = new Set<Pool>([pool]);
        for (const cell of plateau) {
          const other = junctionOwner[cell] ? byId.get(junctionOwner[cell]!) : undefined;
          if (other && other !== pool) touched.add(other);
          for (const neighbor of neighbors[cell]!) {
            const neighborPool = byLeaf.get(g.leafId[neighbor]!);
            if (neighborPool && neighborPool !== pool && evaluated.has(neighborPool.id) && neighborPool.level === head && neighborPool.response.wetCells.includes(neighbor)) touched.add(neighborPool);
          }
        }
        if (touched.size > 1) { for (const cell of plateau) pool.junctions.add(cell); merge([...touched], head); restart = true; break; }
        if (plateau.some(cell => !pool.junctions.has(cell))) {
          for (const cell of plateau) pool.junctions.add(cell);
          generation++; restart = true; break;
        }
        const membership = new Set([...pool.response.wetCells, ...pool.junctions]);
        let recordedPort = pool.frontier ? { fromCell: pool.frontier.fromCell, toCell: pool.frontier.toCell } : null;
        const traced = new Set<number>();
        while (recordedPort && recordedPort.toCell >= 0 && membership.has(recordedPort.toCell)) {
          requireValid(!traced.has(recordedPort.toCell), "cyclic recorded plateau receiver");
          traced.add(recordedPort.toCell);
          recordedPort = { fromCell: recordedPort.toCell, toCell: g.rawReceiver[recordedPort.toCell]! };
        }
        const candidates: Array<{ fromCell: number; toCell: number }> = [];
        for (const fromCell of membership) {
          if (g.rawReceiver[fromCell] === -1 && g.leafId[fromCell] === 0) candidates.push({ fromCell, toCell: -1 });
          for (const toCell of neighbors[fromCell]!) if (!membership.has(toCell) && z[toCell]! <= head && owner[toCell] !== pool.id) candidates.push({ fromCell, toCell });
        }
        candidates.sort((a, b) => {
          const preferred = (edge: typeof a) => edge.fromCell === recordedPort?.fromCell && edge.toCell === recordedPort.toCell ? 0 : 1;
          return preferred(a) - preferred(b) || a.fromCell - b.fromCell || a.toCell - b.toCell;
        });
        requireValid(candidates.length > 0, `attained sill without external port for pool ${pool.id}`);
        pool.port = candidates[0]!;
      } else pool.port = null;
      // Resolve independently sustained equal-head groups before publishing their
      // exports. Otherwise a later union can redirect provisional supply after a
      // lower receiver has already committed an irreversible attained merger.
      if (!delivering) {
        if (index === queue.length - 1) {
          delivering = true;
          for (const candidate of pools) {
            queued.add(candidate.id);
            queue.push({ id: candidate.id, generation });
          }
        }
        continue;
      }
      const old = deliveries.get(pool.id);
      const amount = pool.response.state === "open" ? pool.response.overflow : 0;
      const target = pool.port && pool.port.toCell >= 0 ? owner[pool.port.toCell]! : 0;
      const next = { generation, target, fromCell: pool.port?.fromCell ?? -1, toCell: pool.port?.toCell ?? -1, amount };
      if (old && old.target === target && old.amount === amount && old.fromCell === next.fromCell && old.toCell === next.toCell) continue;
      deliveries.set(pool.id, next);
      // A nonzero external-contribution cycle must be one equal-head event.
      let cursor = pool.id;
      const path: number[] = [], position = new Map<number, number>();
      while (cursor && deliveries.get(cursor)?.amount) {
        if (position.has(cursor)) {
          const cycle = path.slice(position.get(cursor)! ).map(id => byId.get(id)!);
          requireValid(cycle.every(member => member.level === pool.level), "unequal-head contribution cycle");
          merge(cycle, pool.level); restart = true; break;
        }
        position.set(cursor, path.length); path.push(cursor); cursor = deliveries.get(cursor)!.target;
      }
      if (restart) break;
      for (const id of new Set([old?.target ?? 0, target])) if (id && !queued.has(id)) { queued.add(id); queue.push({ id, generation }); }
    }
    if (restart) continue;
    // A downstream equal-head contraction can absorb an already delivered
    // upstream response. Retire that response's obsolete, above-head junctions
    // only after its replacement incoming ledger has completely settled.
    for (const pool of pools) for (const cell of pool.junctions) if (z[cell]! > pool.level) {
      pool.junctions.delete(cell); restart = true;
    }
    if (restart) continue;
    for (const pool of pools) requireValid(pool.response.state !== "infeasible-attained-state", `unsustainable attained merger ${pool.id}: ${JSON.stringify(pool.response)}`);
    return { pools, owner };
  }
}
