import { finite, requireValid, type NetworkInput } from "./types.js";

/** Checks the geometry this consumer relies on, not the upstream minimal-saddle optimization. */
export function validateNetworkInput(input: NetworkInput, neighbors: readonly number[][]): void {
  const { width, height, elevation: ground, landMask, geometry: g } = input;
  const size = width * height;
  requireValid(Number.isSafeInteger(width) && width > 0 && Number.isSafeInteger(height) && height > 0 && Number.isSafeInteger(size), "grid dimensions");
  for (const [name, values] of Object.entries({ ground, landMask, localRunoff: input.localRunoff, rainfall: input.rainfall, potentialDemand: input.potentialDemand, rawReceiver: g.rawReceiver, plateauId: g.plateauId, leafId: g.leafId })) {
    requireValid(values.length === size, `${name} cardinality`);
  }
  const validCell = (cell: number) => Number.isSafeInteger(cell) && cell >= 0 && cell < size;
  const validNode = (id: number) => Number.isSafeInteger(id) && id >= 1 && id <= g.nodes.length;
  const indegree = new Int32Array(size), landCells: number[] = [];
  for (let cell = 0; cell < size; cell++) {
    requireValid(landMask[cell] === 0 || landMask[cell] === 1, `binary land mask at ${cell}`);
    for (const [name, value] of [["localRunoff", input.localRunoff[cell]!], ["potentialDemand", input.potentialDemand[cell]!]] as const) {
      requireValid(finite(value, `${name} at ${cell}`) >= 0, `negative ${name} at ${cell}`);
    }
    if (!landMask[cell]) {
      requireValid(input.localRunoff[cell] === 0, `marine runoff at ${cell}`);
      requireValid(g.rawReceiver[cell] === -1 && g.leafId[cell] === 0 && g.plateauId[cell] === -1, `marine geometry at ${cell}`);
      continue;
    }
    landCells.push(cell);
    const leaf = g.leafId[cell]!, plateau = g.plateauId[cell]!, target = g.rawReceiver[cell]!;
    requireValid(leaf === 0 || validNode(leaf) && g.nodes[leaf - 1]!.kind === "leaf", `leaf label at ${cell}`);
    requireValid(validCell(plateau) && landMask[plateau] === 1 && ground[plateau] === ground[cell], `plateau at ${cell}`);
    if (target === -1) {
      requireValid(leaf === 0 ? cell < width || cell >= size - width : g.nodes[leaf - 1]!.floorCell === cell, `untyped raw terminal ${cell}`);
    } else {
      requireValid(validCell(target) && neighbors[cell]!.includes(target), `nonadjacent raw receiver at ${cell}`);
      requireValid(ground[target]! <= ground[cell]!, `ascending raw receiver at ${cell}`);
      requireValid(g.leafId[target] === leaf, `raw receiver changes leaf at ${cell}`);
      if (landMask[target]) indegree[target]++;
    }
  }
  const order = landCells.filter(cell => indegree[cell] === 0);
  for (let head = 0; head < order.length; head++) {
    const target = g.rawReceiver[order[head]!]!;
    if (target >= 0 && landMask[target] && --indegree[target] === 0) order.push(target);
  }
  requireValid(order.length === landCells.length, "cyclic raw receivers");

  const covered = new Uint8Array(size), expectedRoots: number[] = [];
  for (const [index, node] of g.nodes.entries()) {
    requireValid(node.id === index + 1, "node identity/index mismatch");
    requireValid(node.cellStart >= 0 && node.cellStart < node.cellEnd && node.cellEnd <= g.catchmentCells.length, `catchment range for node ${node.id}`);
    requireValid(node.hypsometryStart >= 0 && node.hypsometryStart < node.hypsometryEnd && node.hypsometryEnd <= g.hypsometry.length, `hypsometry range for node ${node.id}`);
    if (node.parentId === -1) expectedRoots.push(node.id);
    else requireValid(validNode(node.parentId) && node.parentId > node.id && g.nodes[node.parentId - 1]!.children.includes(node.id), `parent link for node ${node.id}`);
    const members = Array.from(g.catchmentCells.slice(node.cellStart, node.cellEnd));
    const membership = new Set(members);
    requireValid(membership.size === members.length && members.every(c => validCell(c) && landMask[c] === 1), `catchment membership for node ${node.id}`);
    const floor = members.reduce((a, b) => ground[a]! < ground[b]! || ground[a] === ground[b] && a < b ? a : b);
    requireValid(node.floorCell === floor && node.floorElevation === ground[floor] && node.baseElevation >= node.floorElevation, `floor/base for node ${node.id}`);
    if (node.spill === null) requireValid(node.parentId === -1, `outlet-free nonroot ${node.id}`);
    else {
      const spill = node.spill;
      requireValid(membership.has(spill.fromCell) && validCell(spill.toCell) && !membership.has(spill.toCell) && neighbors[spill.fromCell]!.includes(spill.toCell), `spill endpoints for node ${node.id}`);
      requireValid(spill.elevation === Math.max(ground[spill.fromCell]!, ground[spill.toCell]!) && spill.elevation > node.baseElevation, `spill height for node ${node.id}`);
      requireValid(spill.targetLeafId === g.leafId[spill.toCell], `spill target leaf for node ${node.id}`);
    }
    if (node.kind === "leaf") {
      requireValid(node.children.length === 0 && node.baseElevation === node.floorElevation && g.rawReceiver[floor] === -1, `leaf structure for node ${node.id}`);
      const histogram = new Map<number, number>();
      for (const cell of members) {
        requireValid(covered[cell] === 0 && g.leafId[cell] === node.id, `duplicate/wrong leaf membership at ${cell}`);
        covered[cell] = 1;
        histogram.set(ground[cell]!, (histogram.get(ground[cell]!) ?? 0) + 1);
      }
      const bins = [...histogram].sort(([a], [b]) => a - b), actual = g.hypsometry.slice(node.hypsometryStart, node.hypsometryEnd);
      requireValid(actual.length === bins.length && actual.every((bin, i) => bin.elevation === bins[i]![0] && bin.cellCount === bins[i]![1]), `hypsometry for node ${node.id}`);
    } else {
      requireValid(node.children.length >= 2 && new Set(node.children).size === node.children.length, `merge children for node ${node.id}`);
      let cellEnd = node.cellStart, binEnd = node.hypsometryStart;
      for (const childId of node.children) {
        requireValid(validNode(childId) && childId < node.id, `child identity for node ${node.id}`);
        const child = g.nodes[childId - 1]!;
        requireValid(child.parentId === node.id && child.spill?.elevation === node.baseElevation && child.cellStart === cellEnd && child.hypsometryStart === binEnd, `child partition for node ${node.id}`);
        cellEnd = child.cellEnd; binEnd = child.hypsometryEnd;
      }
      requireValid(cellEnd === node.cellEnd && binEnd === node.hypsometryEnd, `merge partition for node ${node.id}`);
    }
  }
  requireValid(g.roots.length === expectedRoots.length && g.roots.every((root, i) => root === expectedRoots[i]), "forest roots");
  let cellEnd = 0, binEnd = 0;
  for (const rootId of g.roots) {
    const root = g.nodes[rootId - 1]!;
    requireValid(root.cellStart === cellEnd && root.hypsometryStart === binEnd, "root partition");
    cellEnd = root.cellEnd; binEnd = root.hypsometryEnd;
  }
  requireValid(cellEnd === g.catchmentCells.length && binEnd === g.hypsometry.length, "unused catchment/hypsometry data");
  for (const cell of g.externalCatchmentCells) {
    requireValid(validCell(cell) && landMask[cell] === 1 && covered[cell] === 0 && g.leafId[cell] === 0, "external catchment partition");
    covered[cell] = 1;
  }
  requireValid(landCells.every(cell => covered[cell] === 1), "uncovered land");
  for (const saddle of g.saddles) {
    requireValid(validCell(saddle.cellA) && validCell(saddle.cellB) && neighbors[saddle.cellA]!.includes(saddle.cellB), "saddle adjacency");
    requireValid(saddle.leafA < saddle.leafB && saddle.leafA === g.leafId[saddle.cellA] && saddle.leafB === g.leafId[saddle.cellB] && saddle.elevation === Math.max(ground[saddle.cellA]!, ground[saddle.cellB]!), "saddle labels/height");
  }
}
