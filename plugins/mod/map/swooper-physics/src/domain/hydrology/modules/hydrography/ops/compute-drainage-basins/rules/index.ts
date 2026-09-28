import { forEachHexNeighborOddQ } from "@swooper/mapgen-core/lib/grid";

type Input = Readonly<{
  width: number;
  height: number;
  elevation: ArrayLike<number>;
  landMask: ArrayLike<number>;
}>;
type Spill = {
  elevation: number;
  fromCell: number;
  toCell: number;
  targetLeafId: number;
};
type BasinNode = {
  id: number;
  kind: "leaf" | "merge";
  floorCell: number;
  floorElevation: number;
  baseElevation: number;
  parentId: number;
  children: number[];
  spill: Spill | null;
  cellStart: number;
  cellEnd: number;
  hypsometryStart: number;
  hypsometryEnd: number;
};
type Saddle = {
  leafA: number;
  leafB: number;
  cellA: number;
  cellB: number;
  elevation: number;
};
type Result = {
  rawReceiver: Int32Array;
  plateauId: Int32Array;
  leafId: Int32Array;
  nodes: BasinNode[];
  roots: number[];
  saddles: Saddle[];
  catchmentCells: Int32Array;
  externalCatchmentCells: Int32Array;
  hypsometry: Array<{ elevation: number; cellCount: number }>;
};
type Plateau = { id: number; cells: number[]; elevation: number };
type Connection = { neighbor: number; outward: Spill; inward: Spill };

/**
 * Builds raw plateau drainage and the depression forest described by Barnes et al. (2020),
 * sections 3.4 and 5, using the existing cylindrical Civ7 hex adjacency.
 *
 * External connections terminate a storage tree instead of merging it with the ocean's already
 * drained catchments. Saddle ties form one level, and shared cell/hypsometry ranges avoid copying
 * a catchment into each ancestor. Neither the input ground nor production routing is changed.
 *
 * @param input - Admitted Morphology ground, mask, and grid dimensions.
 * @param allowExternalEdgeOutlets - Whether north/south land edges may terminate externally.
 * @returns Raw receivers, leaves, saddle connections, containment, and exact area-height evidence.
 */
export function computeDrainageBasins(input: Input, allowExternalEdgeOutlets: boolean): Result {
  const { width, height, elevation, landMask } = input;
  const size = width * height;
  const plateauId = new Int32Array(size).fill(-1);
  const rawReceiver = new Int32Array(size).fill(-1);
  const leafId = new Int32Array(size);
  const nodes: BasinNode[] = [];
  const plateaus: Plateau[] = [];
  const neighbors = (cell: number, visit: (neighbor: number) => void): void => {
    forEachHexNeighborOddQ(cell % width, Math.floor(cell / width), width, height, (x, y) => {
      visit(y * width + x);
    });
  };

  for (let start = 0; start < size; start++) {
    if (landMask[start] !== 1 || plateauId[start] !== -1) continue;
    const plateau: Plateau = { id: start, cells: [start], elevation: elevation[start]! };
    plateauId[start] = start;
    for (let head = 0; head < plateau.cells.length; head++) {
      neighbors(plateau.cells[head]!, (neighbor) => {
        if (
          landMask[neighbor] === 1 &&
          plateauId[neighbor] === -1 &&
          elevation[neighbor] === plateau.elevation
        ) {
          plateauId[neighbor] = start;
          plateau.cells.push(neighbor);
        }
      });
    }
    plateaus.push(plateau);
  }

  // Strict descent orders plateau dependencies; flats get an adjacent BFS tree, not index jumps.
  plateaus.sort((a, b) => a.elevation - b.elevation || a.id - b.id);
  const routed = new Uint8Array(size);
  const queue = new Int32Array(size);
  for (const plateau of plateaus) {
    let source = plateau.id;
    let receiver = -1;
    let edgeExit = -1;
    for (const cell of plateau.cells) {
      const y = Math.floor(cell / width);
      if (allowExternalEdgeOutlets && (y === 0 || y === height - 1)) {
        if (edgeExit === -1 || cell < edgeExit) edgeExit = cell;
      }
      neighbors(cell, (neighbor) => {
        const lower = elevation[neighbor]! < plateau.elevation;
        const levelWater = landMask[neighbor] === 0 && elevation[neighbor] === plateau.elevation;
        if (!lower && !levelWater) return;
        if (
          receiver === -1 ||
          elevation[neighbor]! < elevation[receiver]! ||
          (elevation[neighbor] === elevation[receiver] &&
            (neighbor < receiver || (neighbor === receiver && cell < source)))
        ) {
          source = cell;
          receiver = neighbor;
        }
      });
    }

    let label = 0;
    if (edgeExit !== -1) {
      source = edgeExit;
      receiver = -1;
    } else if (receiver !== -1) {
      label = leafId[receiver]!;
    } else {
      label = nodes.length + 1;
      nodes.push(makeNode(label, "leaf", plateau.id, plateau.elevation, plateau.elevation, []));
    }

    let head = 0;
    let tail = 1;
    queue[0] = source;
    routed[source] = 1;
    rawReceiver[source] = receiver;
    leafId[source] = label;
    while (head < tail) {
      const cell = queue[head++]!;
      neighbors(cell, (neighbor) => {
        if (plateauId[neighbor] !== plateau.id || routed[neighbor] === 1) return;
        routed[neighbor] = 1;
        rawReceiver[neighbor] = cell;
        leafId[neighbor] = label;
        queue[tail++] = neighbor;
      });
    }
  }

  const byLeafPair = new Map<string, Saddle>();
  for (let cell = 0; cell < size; cell++) {
    neighbors(cell, (neighbor) => {
      if (neighbor <= cell || leafId[cell] === leafId[neighbor]) return;
      const forward = leafId[cell]! < leafId[neighbor]!;
      const cellA = forward ? cell : neighbor;
      const cellB = forward ? neighbor : cell;
      const saddle: Saddle = {
        leafA: leafId[cellA]!,
        leafB: leafId[cellB]!,
        cellA,
        cellB,
        elevation: Math.max(elevation[cell]!, elevation[neighbor]!),
      };
      const key = `${saddle.leafA}:${saddle.leafB}`;
      const previous = byLeafPair.get(key);
      if (!previous || compareSaddles(saddle, previous) < 0) byLeafPair.set(key, saddle);
    });
  }
  const saddles = [...byLeafPair.values()].sort(compareSaddles);
  buildHierarchy(nodes, saddles);
  const roots = nodes.filter((node) => node.parentId === -1).map((node) => node.id);
  const membership = collectMembership(nodes, roots, leafId, elevation, landMask);
  return { rawReceiver, plateauId, leafId, nodes, roots, saddles, ...membership };
}

function makeNode(
  id: number,
  kind: BasinNode["kind"],
  floorCell: number,
  floorElevation: number,
  baseElevation: number,
  children: number[]
): BasinNode {
  return {
    id,
    kind,
    floorCell,
    floorElevation,
    baseElevation,
    parentId: -1,
    children,
    spill: null,
    cellStart: 0,
    cellEnd: 0,
    hypsometryStart: 0,
    hypsometryEnd: 0,
  };
}

function compareSaddles(a: Saddle, b: Saddle): number {
  return (
    a.elevation - b.elevation ||
    Math.min(a.cellA, a.cellB) - Math.min(b.cellA, b.cellB) ||
    Math.max(a.cellA, a.cellB) - Math.max(b.cellA, b.cellB)
  );
}

function buildHierarchy(nodes: BasinNode[], saddles: Saddle[]): void {
  // Union representatives are active storage roots, or 0 for any already external component.
  // This is intentionally distinct from the permanent containment parent in the output nodes.
  const representative = [0, ...nodes.map((node) => node.id)];
  const find = (id: number): number => {
    let root = id;
    while (representative[root] !== root) root = representative[root]!;
    while (id !== root) {
      const next = representative[id]!;
      representative[id] = root;
      id = next;
    }
    return root;
  };

  let start = 0;
  while (start < saddles.length) {
    const elevation = saddles[start]!.elevation;
    let end = start + 1;
    while (end < saddles.length && saddles[end]!.elevation === elevation) end++;
    const connections = new Map<number, Connection[]>();
    const add = (root: number, connection: Connection): void => {
      const existing = connections.get(root);
      if (existing) existing.push(connection);
      else connections.set(root, [connection]);
    };
    for (let i = start; i < end; i++) {
      const saddle = saddles[i]!;
      const a = find(saddle.leafA);
      const b = find(saddle.leafB);
      if (a === b) continue;
      const outward: Spill = {
        elevation,
        fromCell: saddle.cellA,
        toCell: saddle.cellB,
        targetLeafId: saddle.leafB,
      };
      const inward: Spill = {
        elevation,
        fromCell: saddle.cellB,
        toCell: saddle.cellA,
        targetLeafId: saddle.leafA,
      };
      add(a, { neighbor: b, outward, inward });
      add(b, { neighbor: a, outward: inward, inward: outward });
    }

    // Freeze each level's components before any union. Otherwise edge order can manufacture
    // zero-depth parents, or merge a higher bowl with a valley that already drains to the ocean.
    const seen = new Set<number>();
    for (const seed of [...connections.keys()].sort((a, b) => a - b)) {
      if (seen.has(seed)) continue;
      const group = [seed];
      seen.add(seed);
      for (let head = 0; head < group.length; head++) {
        for (const connection of connections.get(group[head]!)!) {
          if (seen.has(connection.neighbor)) continue;
          seen.add(connection.neighbor);
          group.push(connection.neighbor);
          if (seed === 0) {
            // A level-tied external batch is oriented toward the external BFS frontier, so
            // separate storage roots cannot acquire circular external spill dependencies.
            nodes[connection.neighbor - 1]!.spill = connection.inward;
          }
        }
      }
      if (seed === 0) {
        for (const id of group) representative[id] = 0;
        continue;
      }

      group.sort((a, b) => a - b);
      let floor = nodes[group[0]! - 1]!;
      for (const id of group) {
        const node = nodes[id - 1]!;
        if (
          node.floorElevation < floor.floorElevation ||
          (node.floorElevation === floor.floorElevation && node.floorCell < floor.floorCell)
        ) {
          floor = node;
        }
      }
      const parent = makeNode(
        nodes.length + 1,
        "merge",
        floor.floorCell,
        floor.floorElevation,
        elevation,
        group
      );
      nodes.push(parent);
      representative.push(parent.id);
      for (const id of group) {
        const child = nodes[id - 1]!;
        child.parentId = parent.id;
        child.spill = connections.get(id)![0]!.outward;
        representative[id] = parent.id;
      }
    }
    start = end;
  }
}

function collectMembership(
  nodes: BasinNode[],
  roots: number[],
  leafId: Int32Array,
  elevation: Input["elevation"],
  landMask: Input["landMask"]
): Pick<Result, "catchmentCells" | "externalCatchmentCells" | "hypsometry"> {
  const leafCells = new Map<number, number[]>();
  const external: number[] = [];
  for (let cell = 0; cell < leafId.length; cell++) {
    if (landMask[cell] !== 1) continue;
    const id = leafId[cell]!;
    if (id === 0) {
      external.push(cell);
      continue;
    }
    const existing = leafCells.get(id);
    if (existing) existing.push(cell);
    else leafCells.set(id, [cell]);
  }

  const cells: number[] = [];
  const hypsometry: Result["hypsometry"] = [];
  const stack = [...roots].reverse();
  while (stack.length > 0) {
    const entry = stack.pop()!;
    const node = nodes[Math.abs(entry) - 1]!;
    if (entry < 0) {
      node.cellEnd = cells.length;
      node.hypsometryEnd = hypsometry.length;
      continue;
    }
    node.cellStart = cells.length;
    node.hypsometryStart = hypsometry.length;
    stack.push(-entry);
    if (node.kind === "merge") {
      for (let i = node.children.length - 1; i >= 0; i--) stack.push(node.children[i]!);
      continue;
    }
    const members = leafCells.get(node.id)!;
    members.sort((a, b) => elevation[a]! - elevation[b]! || a - b);
    for (const cell of members) {
      cells.push(cell);
      const previous = hypsometry.length > node.hypsometryStart ? hypsometry.at(-1) : undefined;
      if (previous?.elevation === elevation[cell]) previous.cellCount++;
      else hypsometry.push({ elevation: elevation[cell]!, cellCount: 1 });
    }
  }
  return {
    catchmentCells: Int32Array.from(cells),
    externalCatchmentCells: Int32Array.from(external),
    hypsometry,
  };
}
