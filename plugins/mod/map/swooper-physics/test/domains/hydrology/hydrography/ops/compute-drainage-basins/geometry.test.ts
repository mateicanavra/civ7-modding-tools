import { describe, expect, it } from "bun:test";
import { getHexNeighborIndicesOddQ } from "@swooper/mapgen-core/lib/grid";
import { validateSchemaValueForTest } from "@swooper/mapgen-core/testing";

import hydrologyOpsPublic from "../../../../../../src/domain/hydrology/router.js";

const { computeDrainageBasins } = hydrologyOpsPublic.hydrography.ops;
type Input = Parameters<typeof computeDrainageBasins.run>[0];
type Result = ReturnType<typeof computeDrainageBasins.run>;
type Node = Result["nodes"][number];

function run(input: Input, allowExternalEdgeOutlets = false): Result {
  return computeDrainageBasins.run(input, {
    strategy: "plateau-saddle-hierarchy",
    config: { allowExternalEdgeOutlets },
  });
}

function syntheticProfile(heights: number[], marineCells = [0]) {
  const externalWaterMask = new Uint8Array(heights.length);
  for (const cell of marineCells) externalWaterMask[cell] = 1;
  return { width: heights.length, height: 1, elevation: Array.from(heights), externalWaterMask, externalWaterHead: 0 } satisfies Input;
}

function hydraulicElevation(input: Input, cell: number): number {
  return input.externalWaterMask[cell] ? input.externalWaterHead : input.elevation[cell]!;
}

function cellsOf(result: Result, node: Node): number[] {
  return [...result.catchmentCells.slice(node.cellStart, node.cellEnd)];
}

function volumeAt(result: Result, node: Node, level: number): number {
  return result.hypsometry
    .slice(node.hypsometryStart, node.hypsometryEnd)
    .reduce((total, bin) => total + bin.cellCount * Math.max(0, level - bin.elevation), 0);
}

function expectGeometry(input: Input, result: Result, allowExternalEdgeOutlets = false): void {
  const { width, height, elevation, externalWaterMask } = input;
  const neighbors = (cell: number): number[] =>
    getHexNeighborIndicesOddQ(cell % width, Math.floor(cell / width), width, height);
  const land = [...externalWaterMask.keys()].filter((cell) => externalWaterMask[cell] === 0);
  expect([...result.catchmentCells, ...result.externalCatchmentCells].sort((a, b) => a - b)).toEqual(land);
  expect(result.roots).toEqual(result.nodes.filter((node) => node.parentId === -1).map((node) => node.id));

  for (let cell = 0; cell < elevation.length; cell++) {
    const receiver = result.rawReceiver[cell]!;
    if (receiver >= 0) {
      expect(neighbors(cell)).toContain(receiver);
      expect(hydraulicElevation(input, receiver)).toBeLessThanOrEqual(elevation[cell]!);
      expect(result.leafId[receiver]).toBe(result.leafId[cell]);
    }
    const seen = new Set<number>();
    let terminal = cell;
    while (result.rawReceiver[terminal]! >= 0) {
      expect(seen.has(terminal)).toBe(false);
      seen.add(terminal);
      terminal = result.rawReceiver[terminal]!;
    }
    if (result.leafId[cell]! > 0) {
      expect(terminal).toBe(result.nodes[result.leafId[cell]! - 1]!.floorCell);
    } else if (externalWaterMask[terminal] === 0) {
      expect(allowExternalEdgeOutlets).toBe(true);
      expect([0, height - 1]).toContain(Math.floor(terminal / width));
    }
  }

  for (const node of result.nodes) {
    expect(result.nodes[node.id - 1]).toBe(node);
    const members = cellsOf(result, node);
    expect(members).toContain(node.floorCell);
    expect(node.floorElevation).toBe(Math.min(...members.map((cell) => elevation[cell]!)));
    expect(
      result.hypsometry.slice(node.hypsometryStart, node.hypsometryEnd).reduce((area, bin) => area + bin.cellCount, 0)
    ).toBe(members.length);
    if (node.parentId !== -1) {
      expect(node.parentId).toBeGreaterThan(node.id);
      const parent = result.nodes[node.parentId - 1]!;
      expect(parent.children).toContain(node.id);
      expect(node.spill?.elevation).toBe(parent.baseElevation);
      expect(node.baseElevation).toBeLessThan(parent.baseElevation);
    }
    if (node.kind === "merge") {
      expect(node.children.length).toBeGreaterThanOrEqual(2);
      expect(node.children.flatMap((id) => cellsOf(result, result.nodes[id - 1]!))).toEqual(members);
    } else {
      expect(node.children).toEqual([]);
      expect(node.baseElevation).toBe(node.floorElevation);
      expect(members.every((cell) => result.leafId[cell] === node.id)).toBe(true);
    }
    if (node.spill) {
      expect(members).toContain(node.spill.fromCell);
      expect(members).not.toContain(node.spill.toCell);
      expect(neighbors(node.spill.fromCell)).toContain(node.spill.toCell);
      expect(node.spill.elevation).toBe(Math.max(hydraulicElevation(input, node.spill.fromCell), hydraulicElevation(input, node.spill.toCell)));
      expect(node.spill.targetLeafId).toBe(result.leafId[node.spill.toCell]);
      expect(node.spill.elevation).toBeGreaterThanOrEqual(node.baseElevation);
    } else {
      expect(node.parentId).toBe(-1);
    }
  }

  // Root-to-root overflow is directed toward an already external component, never back uphill.
  for (const id of result.roots) {
    let root = result.nodes[id - 1]!;
    const seen = new Set<number>();
    while (root.spill && root.spill.targetLeafId !== 0) {
      expect(seen.has(root.id)).toBe(false);
      seen.add(root.id);
      const spillHeight = root.spill.elevation;
      let target = result.nodes[root.spill.targetLeafId - 1]!;
      while (target.parentId !== -1) target = result.nodes[target.parentId - 1]!;
      expect(target.spill).not.toBeNull();
      expect(target.spill!.elevation).toBeLessThanOrEqual(spillHeight);
      root = target;
    }
  }
}

function expectThresholdComponents(input: Input, result: Result, level: number, externalEdges: boolean): void {
  const { width, height, elevation, externalWaterMask } = input;
  const expected = new Map<number, number[]>();
  const seen = new Set<number>();
  for (let start = 0; start < elevation.length; start++) {
    if (hydraulicElevation(input, start) > level || seen.has(start)) continue;
    const cells = [start];
    seen.add(start);
    let external = false;
    for (let head = 0; head < cells.length; head++) {
      const cell = cells[head]!;
      const y = Math.floor(cell / width);
      if (externalWaterMask[cell] === 1 || (externalEdges && (y === 0 || y === height - 1))) external = true;
      for (const neighbor of getHexNeighborIndicesOddQ(cell % width, y, width, height)) {
        if (hydraulicElevation(input, neighbor) > level || seen.has(neighbor)) continue;
        seen.add(neighbor);
        cells.push(neighbor);
      }
    }
    const key = external ? -1 : start;
    expected.set(key, [...(expected.get(key) ?? []), ...cells]);
  }

  const actual = new Map<number, number[]>();
  for (let cell = 0; cell < elevation.length; cell++) {
    if (hydraulicElevation(input, cell) > level) continue;
    let key = result.leafId[cell]!;
    if (key !== 0) {
      let node = result.nodes[key - 1]!;
      while (node.parentId !== -1 && result.nodes[node.parentId - 1]!.baseElevation <= level) {
        node = result.nodes[node.parentId - 1]!;
      }
      key = node.parentId === -1 && node.spill && node.spill.elevation <= level ? 0 : node.id;
    }
    const members = actual.get(key);
    if (members) members.push(cell);
    else actual.set(key, [cell]);
  }
  const canonical = (groups: Map<number, number[]>): number[][] =>
    [...groups.values()].map((cells) => cells.sort((a, b) => a - b)).sort((a, b) => a[0]! - b[0]!);
  expect(canonical(actual)).toEqual(canonical(expected));
}

describe("hydrology/compute-drainage-basins", () => {
  it("retains fractional floor, merge, spill, saddle and hypsometry heights through atom admission", () => {
    const input = syntheticProfile([-5, 8.25, 0.125, 3.375, 1.25, 7.75, 2.5, 16, 20]);
    const before = structuredClone(input), result = run(input);
    expect(result.nodes.filter(node => node.kind === "merge").map(node => node.baseElevation)).toEqual([3.375, 7.75]);
    const root = result.nodes[result.roots[0]! - 1]!;
    expect(root.floorElevation).toBe(0.125);
    expect(root.spill?.elevation).toBe(8.25);
    expect(result.saddles.some(saddle => saddle.elevation === 3.375)).toBe(true);
    expect(result.hypsometry.some(bin => bin.elevation === 0.125)).toBe(true);
    expect(validateSchemaValueForTest(computeDrainageBasins.output, result, "/preciseGeometry")).toEqual(result);
    expectGeometry(input, result);
    for (const level of [0.125, 1.25, 2.5, 3.375, 7.75, 8.25]) expectThresholdComponents(input, result, level, false);
    expect(run(input)).toEqual(result);
    expect(input).toEqual(before);
  });

  it("distinguishes sub-integer plateaus instead of rounding them into one pit", () => {
    const input = syntheticProfile([1.125, 1.25, 1.125, 1.25], []);
    const result = run(input);
    expect(result.nodes.filter(node => node.kind === "leaf")).toHaveLength(2);
    expect(result.nodes.at(-1)?.baseElevation).toBe(1.25);
    expect(run({ ...input, elevation: input.elevation.map(Math.round) }).nodes.filter(node => node.kind === "leaf")).toHaveLength(1);
    expectGeometry(input, result);
  });

  it("keeps Number-scale saddle differences that Float32 would collapse", () => {
    const saddle = 1 + 2 ** -30;
    const input = syntheticProfile([1, saddle, 1, saddle], []);
    const result = run(input);
    expect(result.nodes.filter(node => node.kind === "leaf")).toHaveLength(2);
    expect(result.nodes.at(-1)?.baseElevation).toBe(saddle);
    expect(run({ ...input, elevation: input.elevation.map(Math.fround) }).nodes).toHaveLength(1);
    expect(validateSchemaValueForTest(computeDrainageBasins.output, result, "/numberScaleGeometry")).toEqual(result);
    expectGeometry(input, result);
  });

  it("refuses nonfinite and out-of-range precise ground before geometry is produced", () => {
    const input = syntheticProfile([-5, 8, 0, 3, 1, 7, 2]);
    for (const invalid of [NaN, Infinity, -Infinity, -32768.25, 32767.25]) {
      const malformed = structuredClone(input);
      malformed.elevation[2] = invalid;
      expect(() => run(malformed)).toThrow();
    }
  });

  it("keeps published integer fixtures exactly identical after widening working storage", () => {
    const input = syntheticProfile([-5, 8, 0, 3, 1, 7, 2, 16, 20]);
    expect(run({ ...input, elevation: Array.from(Int16Array.from(input.elevation)) })).toEqual(run(input));
  });

  it("keeps every finite hydraulic result invariant under fixed-footprint external bathymetry", () => {
    const input = syntheticProfile([-200, 5, 1, 3, 0, 8, -50], [0, 6]);
    const before = structuredClone(input), first = run(input);
    const alternate = structuredClone(input);
    alternate.elevation[0] = 32767;
    alternate.elevation[6] = -32768;
    expect(run(alternate)).toEqual(first);
    expect(input).toEqual(before);
    expectGeometry(input, first);
    expectGeometry(alternate, first);
    for (const bin of first.hypsometry) expect(bin.elevation).toBeGreaterThanOrEqual(0);
  });

  it("uses the receiving head in raw descent and admits below-head and exact-head outlets", () => {
    const input = syntheticProfile([-100, 5, 2, 7]);
    const low = run(input);
    const higher = run({ ...input, externalWaterHead: 4.5 });
    const equal = run({ ...input, externalWaterHead: 5 });
    expect(low.rawReceiver[1]).toBe(0);
    expect(higher.rawReceiver[1]).toBe(2);
    expect(equal.rawReceiver[1]).toBe(2);
    expect(higher.nodes[0]!.spill).toEqual({ elevation: 5, fromCell: 1, toCell: 0, targetLeafId: 0 });
    expect(equal.nodes[0]!.spill).toEqual(higher.nodes[0]!.spill);
    expect(higher.hypsometry).toEqual(equal.hypsometry);
    expectGeometry({ ...input, externalWaterHead: 4.5 }, higher);
    expectGeometry({ ...input, externalWaterHead: 5 }, equal);
  });

  it("refuses above-ground receiving heads with explicit inward-exchange facts, without changing ground", () => {
    const input = { ...syntheticProfile([-100, 5, 2, 7]), externalWaterHead: 6 };
    const before = structuredClone(input);
    expect(() => run(input)).toThrow(/Unsupported external inundation.*"externalCell":0.*"finiteCell":1.*"finiteGround":5.*"externalWaterHead":6/);
    expect(input).toEqual(before);
  });

  it("admits only complete finite-head, exact-binary declarations", () => {
    const input = syntheticProfile([-100, 5, 2, 7]);
    expect(() => run({ ...input, externalWaterHead: NaN })).toThrow();
    expect(() => run({ ...input, externalWaterHead: Infinity })).toThrow();
    const malformed = structuredClone(input);
    malformed.externalWaterMask[1] = 2;
    expect(() => run(malformed)).toThrow();
    const { externalWaterHead: _head, ...missing } = input;
    // @ts-expect-error The required receiving head is deliberately absent.
    expect(() => run(missing)).toThrow();
  });

  it("handles aliased neighbors on a one-column grid and an entirely marine grid", () => {
    const syntheticDimensions = { width: 1, height: 3 };
    const input = { ...syntheticDimensions, elevation: [4, 1, 3], externalWaterMask: new Uint8Array(3), externalWaterHead: 0 };
    const result = run(input);
    expect([...result.rawReceiver]).toEqual([1, -1, 1]);
    expect(result.nodes).toHaveLength(1);
    expectGeometry(input, result);
    const marineInput = { ...input, externalWaterMask: new Uint8Array(3).fill(1) };
    const marine = run(marineInput);
    expect(marine.nodes).toEqual([]);
    expect(marine.saddles).toEqual([]);
    expect(marine.catchmentCells.length).toBe(0);
    expectGeometry(marineInput, marine);
  });

  it("collapses a minimum flat to one pit and adjacent acyclic receiver tree", () => {
    const syntheticDimensions = { width: 4, height: 3 };
    const input = { ...syntheticDimensions, elevation: new Array<number>(12).fill(5), externalWaterMask: new Uint8Array(12), externalWaterHead: 0 };
    const result = run(input);
    expect(result.nodes).toHaveLength(1);
    expect(result.nodes[0]!.floorCell).toBe(0);
    expect(result.nodes[0]!.spill).toBeNull();
    expect([...result.plateauId]).toEqual(Array(12).fill(0));
    expect([...result.leafId]).toEqual(Array(12).fill(1));
    expect([...result.rawReceiver].filter((receiver) => receiver === -1)).toHaveLength(1);
    expect(result.hypsometry).toEqual([{ elevation: 5, cellCount: 12 }]);
    expectGeometry(input, result);
  });

  it("routes a level coastal flat to water without inventing a flat depression", () => {
    const input = { ...syntheticProfile([2, 2, 2, 2], [0]), externalWaterHead: 2 };
    const result = run(input);
    expect(result.nodes).toEqual([]);
    expect([...result.leafId]).toEqual([0, 0, 0, 0]);
    expect([...result.externalCatchmentCells]).toEqual([1, 2, 3]);
    expectGeometry(input, result);
  });

  it("retains nested bowls, true merge heights, and uplands above the inundation sill", () => {
    const input = syntheticProfile([-5, 8, 0, 3, 1, 7, 2, 16, 20]);
    const result = run(input);
    const merges = result.nodes.filter((node) => node.kind === "merge");
    expect(merges.map((node) => node.baseElevation)).toEqual([3, 7]);
    expect(merges[0]!.children).toEqual([result.leafId[2]!, result.leafId[4]!]);
    const root = result.nodes[result.roots[0]! - 1]!;
    expect(result.roots).toHaveLength(1);
    expect(root.floorElevation).toBe(0);
    expect(root.spill?.elevation).toBe(8);
    expect(cellsOf(result, root)).toContain(7);
    expect(cellsOf(result, root).filter((cell) => input.elevation[cell]! < 8).sort((a, b) => a - b)).toEqual([2, 3, 4, 5, 6]);
    expect(volumeAt(result, root, 8)).toBe(27);
    const nonoverlappingStorage = result.nodes.reduce((total, node) => {
      return total + volumeAt(result, node, node.spill!.elevation) - volumeAt(result, node, node.baseElevation);
    }, 0);
    expect(nonoverlappingStorage).toBe(27);
    expectGeometry(input, result);
  });

  it("spills a high bowl into an already drained low valley without making a false containing lake", () => {
    const input = syntheticProfile([-5, 3, 0, 8, 1, 12]);
    const result = run(input);
    const low = result.nodes[result.leafId[2]! - 1]!;
    const high = result.nodes[result.leafId[4]! - 1]!;
    expect(result.nodes).toHaveLength(2);
    expect(result.roots).toEqual([low.id, high.id]);
    expect(low.spill?.elevation).toBe(3);
    expect(high.spill).toEqual({ elevation: 8, fromCell: 4, toCell: 3, targetLeafId: low.id });
    expect(cellsOf(result, low)).toContain(3);
    expect(volumeAt(result, low, 3)).toBe(3);
    expectGeometry(input, result);
  });

  it("keeps the lowest competing saddle and its actual adjacent endpoints", () => {
    const input = syntheticProfile([-5, 9, 1, 5, -5], [0, 4]);
    const result = run(input);
    expect(result.saddles).toHaveLength(1);
    expect(result.nodes[0]!.spill).toEqual({ elevation: 5, fromCell: 2, toCell: 3, targetLeafId: 0 });
    expectGeometry(input, result);
  });

  it("preserves separate coastal spill endpoints even when the exterior sentinel is shared", () => {
    const input = syntheticProfile([-5, 3, 0, 9, 1, 4]);
    const result = run(input);
    expect(result.roots).toHaveLength(2);
    expect(result.nodes.map((node) => node.spill?.toCell)).toEqual([1, 5]);
    expect(result.nodes.map((node) => node.spill?.targetLeafId)).toEqual([0, 0]);
    expectGeometry(input, result);
  });

  it("connects equal-height cells and spills across the cylindrical seam", () => {
    const syntheticDimensions = { width: 5, height: 3 };
    const elevation = [9, 9, 9, 9, 9, 1, 7, -5, 4, 1, 9, 9, 9, 9, 9];
    const externalWaterMask = new Uint8Array(15);
    externalWaterMask[7] = 1;
    const input = { ...syntheticDimensions, elevation, externalWaterMask, externalWaterHead: 0 };
    const result = run(input);
    expect(result.plateauId[9]).toBe(5);
    expect(result.rawReceiver[9]).toBe(5);
    expect(result.nodes[0]!.spill).toEqual({ elevation: 4, fromCell: 9, toCell: 8, targetLeafId: 0 });
    expectGeometry(input, result);
  });

  it("retains finite internal merges but no invented spill for an outlet-free map", () => {
    const input = syntheticProfile([8, 0, 3, 1, 7, 2, 9], []);
    const result = run(input);
    expect(result.nodes.filter((node) => node.kind === "merge").map((node) => node.baseElevation)).toEqual([3, 7]);
    const root = result.nodes[result.roots[0]! - 1]!;
    expect(root.spill).toBeNull();
    expect(root.cellEnd - root.cellStart).toBe(input.elevation.length);
    expect(result.externalCatchmentCells.length).toBe(0);
    expectGeometry(input, result);
  });

  it("opens only explicitly permitted north/south edge outlets", () => {
    const syntheticDimensions = { width: 3, height: 3 };
    const elevation = new Array<number>(9).fill(5);
    elevation[4] = 1;
    const input = { ...syntheticDimensions, elevation, externalWaterMask: new Uint8Array(9), externalWaterHead: 0 };
    const closed = run(input);
    const open = run(input, true);
    expect(closed.nodes[0]!.spill).toBeNull();
    expect(open.nodes[0]!.spill?.elevation).toBe(5);
    expect(open.nodes[0]!.spill?.targetLeafId).toBe(0);
    expect(open.externalCatchmentCells.length).toBe(8);
    expectGeometry(input, closed);
    expectGeometry(input, open, true);
  });

  it("makes one multifurcation for equal-height sibling saddles, without fake storage levels", () => {
    const input = syntheticProfile([-5, 8, 0, 4, 1, 4, 2, 8]);
    const result = run(input);
    expect(result.nodes).toHaveLength(4);
    const parent = result.nodes[3]!;
    expect(parent.children).toEqual([1, 2, 3]);
    expect(parent.baseElevation).toBe(4);
    expect(parent.spill?.elevation).toBe(8);
    expectGeometry(input, result);
  });

  it("directs a saddle tie with the exterior outward instead of introducing a zero-depth parent", () => {
    const input = syntheticProfile([-5, 4, 0, 4, 1, 4, 2, 4]);
    const result = run(input);
    expect(result.nodes).toHaveLength(3);
    expect(result.roots).toHaveLength(3);
    expect(result.nodes.every((node) => node.kind === "leaf" && node.spill?.elevation === 4)).toBe(true);
    expectGeometry(input, result);
  });

  it("is deterministic at tied heights and leaves the exact input buffers untouched", () => {
    const input = syntheticProfile([-5, 4, 0, 4, 1, 4, 2, 4]);
    const ground = input.elevation.slice();
    const external = input.externalWaterMask.slice();
    const first = run(input);
    const second = run({ ...input, elevation: input.elevation.slice(), externalWaterMask: input.externalWaterMask.slice() });
    expect(first).toEqual(second);
    expect(input.elevation).toEqual(ground);
    expect(input.externalWaterMask).toEqual(external);
    expectGeometry(input, first);
  });

  it("matches independent sublevel-set connectivity at every terrain level across tied hex fixtures", () => {
    const syntheticDimensions = { width: 5, height: 4 };
    for (let sample = 0; sample < 12; sample++) {
      const elevation = Array.from({ length: 20 }, (_, cell) =>
        (cell * 17 + sample * 13 + cell * cell * 7 + ((cell * sample) % 11)) % 7
      );
      const externalWaterMask = new Uint8Array(20);
      const allowExternalEdgeOutlets = sample % 3 === 2;
      if (sample % 3 === 0) {
        externalWaterMask[0] = 1;
        elevation[0] = -1;
      }
      const input = { ...syntheticDimensions, elevation, externalWaterMask, externalWaterHead: -1 };
      const result = run(input, allowExternalEdgeOutlets);
      expectGeometry(input, result, allowExternalEdgeOutlets);
      for (let level = 0; level <= 7; level++) {
        expectThresholdComponents(input, result, level, allowExternalEdgeOutlets);
      }
    }
  });
});
