/** Exact finite forcing rows from refusal receipts, enclosed by explicit
 * zero-forcing finite barriers and a prescribed fixed-head outlet. */
import type { OperationInput, Static } from "@swooper/mapgen-core/authoring";
import { getHexNeighborIndicesOddQ } from "@swooper/mapgen-core/lib/grid";
import hydrologyOpsPublic from "../../../../../../../src/domain/hydrology/router.js";

const { computeBasinNetwork: contract, computeDrainageBasins: geometry } = hydrologyOpsPublic.hydrography.ops;

type Input = OperationInput<typeof contract.input>;
type Geometry = Static<typeof contract.input>["geometry"];
type Row = [cell: number, ground: number, runoff: number, rain: number, demand: number, receiver: number, plateau: number];

/** Frozen consumer-review-grid114 input, reconstructed without an opaque grid dump. */
export function largerGrid(startSeed = -1835942095) {
  let seed = startSeed;
  const random = () => ((seed = Math.imul(seed, 1664525) + 1013904223 | 0) >>> 0) / 2 ** 32;
  const width = 40, height = 30, size = width * height;
  const elevation = Int16Array.from({ length: size }, (_, cell) => cell < width ? -10 : Math.floor(random() * 9));
  const externalWaterMask = Uint8Array.from(elevation, value => value === -10 ? 1 : 0);
  const terrain = { width, height, elevation, externalWaterMask, externalWaterHead: -10 };
  const input = {
    ...terrain,
    geometry: geometry.run(terrain, { strategy: "plateau-saddle-hierarchy", config: { allowExternalEdgeOutlets: false } }),
    localRunoff: Array.from(externalWaterMask, prescribed => prescribed ? 0 : random() * 4),
    rainfall: Uint8Array.from({ length: size }, () => Math.floor(random() * 15)),
    potentialDemand: Float32Array.from({ length: size }, () => random() * 30),
  };
  return { input, nextSeed: seed };
}

function retained(width: number, height: number, groups: Array<{ rows: Row[]; from: number; to: number; target: number; sill: number }>): Static<typeof contract.input> {
  const size = width * height, elevation = new Int16Array(size).fill(1000), externalWaterMask = new Uint8Array(size), rainfall = new Uint8Array(size), potentialDemand = new Float32Array(size), localRunoff = new Array<number>(size).fill(0);
  const neighbors = (cell: number) => getHexNeighborIndicesOddQ(cell % width, Math.floor(cell / width), width, height);
  const rows = groups.flatMap(group => group.rows), rowCells = new Set(rows.map(row => row[0]));
  for (const [cell, ground, runoff, rain, demand] of rows) {
    elevation[cell] = ground; localRunoff[cell] = runoff; rainfall[cell] = rain; potentialDemand[cell] = demand;
  }
  for (const group of groups) if (!group.target) {
    elevation[group.to] = group.sill;
    const external = neighbors(group.to).filter(cell => !rowCells.has(cell) && cell !== group.to && !neighbors(cell).some(neighbor => rowCells.has(neighbor) && elevation[neighbor]! < group.sill)).sort((a, b) => a - b)[0];
    if (external === undefined) throw new Error("Retained fixture has no protected receiving-head outlet.");
    externalWaterMask[external] = 1; elevation[external] = -100;
  }
  const terrain = { width, height, elevation, externalWaterMask, externalWaterHead: 0 };
  const full = geometry.run(terrain, { strategy: "plateau-saddle-hierarchy", config: { allowExternalEdgeOutlets: false } });
  // Keep the retained source/edge attribution. New finite barrier rows carry
  // zero forcing and inherit the destination of their complete raw route.
  const { rawReceiver, plateauId } = full, leafId = new Int32Array(size).fill(-1);
  for (let cell = 0; cell < size; cell++) if (externalWaterMask[cell]) leafId[cell] = 0;
  for (const [index, group] of groups.entries()) for (const [cell, , , , , receiver, plateau] of group.rows) {
    rawReceiver[cell] = receiver; plateauId[cell] = plateau; leafId[cell] = index + 1;
  }
  for (let start = 0; start < size; start++) {
    let cell = start;
    const path: number[] = [];
    while (leafId[cell] === -1) {
      path.push(cell);
      const target = rawReceiver[cell]!;
      if (target < 0) { leafId[cell] = 0; break; }
      cell = target;
    }
    for (const member of path) leafId[member] = leafId[cell]!;
  }
  const nodes: Geometry["nodes"] = [], saddles: Geometry["saddles"] = [], hypsometry: Geometry["hypsometry"] = [], catchmentCells: number[] = [];
  for (const [index, group] of groups.entries()) {
    const id = index + 1, cellStart = catchmentCells.length, hypsometryStart = hypsometry.length, bins = new Map<number, number>();
    for (let cell = 0; cell < size; cell++) if (leafId[cell] === id) {
      catchmentCells.push(cell); bins.set(elevation[cell]!, (bins.get(elevation[cell]!) ?? 0) + 1);
    }
    hypsometry.push(...[...bins].sort(([a], [b]) => a - b).map(([elevation, cellCount]) => ({ elevation, cellCount })));
    nodes.push({ id, kind: "leaf", floorCell: group.rows[0]![0], floorElevation: group.rows[0]![1], baseElevation: group.rows[0]![1], parentId: -1, children: [],
      spill: { elevation: group.sill, fromCell: group.from, toCell: group.to, targetLeafId: group.target }, cellStart, cellEnd: catchmentCells.length, hypsometryStart, hypsometryEnd: hypsometry.length });
    saddles.push(group.target < id
      ? { leafA: group.target, leafB: id, cellA: group.to, cellB: group.from, elevation: group.sill }
      : { leafA: id, leafB: group.target, cellA: group.from, cellB: group.to, elevation: group.sill });
  }
  const externalCatchmentCells = Int32Array.from({ length: size }, (_, cell) => cell).filter(cell => !externalWaterMask[cell] && leafId[cell] === 0);
  return { ...terrain, localRunoff, rainfall, potentialDemand,
    geometry: { rawReceiver, plateauId, leafId, nodes, saddles, roots: nodes.map(node => node.id), catchmentCells: Int32Array.from(catchmentCells), externalCatchmentCells, hypsometry } } satisfies Input;
}

export const hugeRoot17 = () => retained(106, 3, [{ from: 43, to: 148, target: 0, sill: 25, rows: [
  [43, 22, 4.8860423529411765, 6, 18.69264793395996, -1, 43],
  [149, 24, 4.8860423529411765, 6, 19.32852554321289, 43, 149],
  [44, 26, 7.297228235294119, 9, 18.534313201904297, 43, 44],
  [254, 27, 8.108031372549021, 10, 19.72927474975586, 255, 254],
  [255, 27, 7.303595294117648, 9, 19.78775978088379, 149, 254],
] }]);

/** Retains Desert Huge leaf19's original forcing and dry delivery arithmetic. */
export const desertHugeRoot19 = () => retained(106, 30, [{ from: 2529, to: 2424, target: 0, sill: 31, rows: [
  [2740, 28, 41.29666666666666, 52, 137.93092346191406, -1, 2740],
  [2423, 32, 42.04666666666667, 53, 134.73797607421875, 2528, 2423],
  [2527, 32, 41.29666666666666, 52, 136.0644989013672, 2528, 2527],
  [2528, 30, 41.29666666666666, 52, 136.23646545410156, 2634, 2528],
  [2529, 30, 41.29666666666666, 52, 136.17955017089844, 2528, 2528],
  [2530, 30, 43.541666666666664, 55, 135.2156219482422, 2529, 2528],
  [2632, 32, 41.29666666666666, 52, 136.9273223876953, 2738, 2632],
  [2633, 31, 41.29666666666666, 52, 137.0323028564453, 2739, 2633],
  [2634, 30, 41.29666666666666, 52, 137.16908264160156, 2740, 2528],
  [2635, 29, 41.29666666666666, 52, 137.2032928466797, 2740, 2635],
  [2636, 29, 42.75, 54, 136.30142211914062, 2635, 2635],
  [2637, 30, 44.24, 56, 135.75296020507812, 2530, 2528],
  [2737, 32, 41.29666666666666, 52, 137.7677764892578, 2632, 2632],
  [2738, 30, 41.29666666666666, 52, 137.74497985839844, 2739, 2738],
  [2739, 29, 41.29666666666666, 52, 137.86134338378906, 2740, 2739],
  [2741, 28, 41.29666666666666, 52, 137.81570434570312, 2740, 2740],
  [2742, 28, 44.28666666666667, 56, 136.6878204345703, 2741, 2740],
  [2743, 30, 47.83416666666667, 61, 134.65322875976562, 2637, 2528],
  [2843, 32, 41.29666666666666, 52, 138.6335906982422, 2737, 2632],
  [2844, 30, 41.29666666666666, 52, 138.58714294433594, 2738, 2738],
  [2845, 29, 41.29666666666666, 52, 138.70327758789062, 2739, 2739],
  [2846, 28, 41.339999999999996, 52, 138.80641174316406, 2740, 2740],
  [2847, 28, 42.795, 54, 138.07980346679688, 2740, 2740],
  [2848, 28, 43.541666666666664, 55, 137.70852661132812, 2741, 2740],
  [2849, 29, 47.150000000000006, 60, 135.8705596923828, 2742, 2849],
  [2948, 32, 40.5875, 51, 139.61679077148438, 2843, 2632],
  [2949, 31, 41.339999999999996, 52, 139.38417053222656, 2844, 2949],
  [2950, 30, 41.29666666666666, 52, 139.30308532714844, 2844, 2738],
  [2951, 29, 41.29666666666666, 52, 139.33819580078125, 2845, 2739],
  [2952, 29, 41.29666666666666, 52, 139.3379669189453, 2951, 2739],
  [2953, 29, 42.75, 54, 138.50221252441406, 2952, 2739],
  [2954, 30, 45.675, 58, 136.94757080078125, 2848, 2954],
  [2955, 32, 47.83416666666667, 61, 135.9169921875, 2849, 2955],
  [3055, 32, 40.545, 51, 139.99806213378906, 2948, 2632],
  [3056, 32, 41.339999999999996, 52, 139.84637451171875, 3055, 2632],
  [3057, 31, 41.339999999999996, 52, 139.881103515625, 2951, 3057],
  [3058, 31, 41.339999999999996, 52, 139.91725158691406, 3057, 3057],
  [3059, 31, 42.795, 54, 139.15972900390625, 3058, 3057],
  [3060, 32, 45.72333333333333, 58, 137.71652221679688, 2953, 3060],
  [3160, 34, 40.5875, 51, 140.62657165527344, 3055, 3160],
  [3163, 32, 41.29666666666666, 52, 140.00732421875, 3057, 3163],
  [3164, 32, 42.04666666666667, 53, 139.86782836914062, 3163, 3163],
] }]);

export const standardRoots37And39 = () => retained(84, 5, [
  { from: 312, to: 396, target: 0, sill: 40, rows: [
    [60, 37, 4.075239215686275, 5, 19.282018661499023, -1, 60],
    [144, 37, 4.8860423529411765, 6, 20.292221069335938, 60, 60],
    [228, 38, 5.695430588235294, 7, 21.25021743774414, 144, 228],
    [143, 39, 4.890287058823529, 6, 20.310468673706055, 60, 143],
    [59, 40, 4.0787764705882354, 5, 19.281856536865234, 60, 59],
    [312, 40, 7.303595294117648, 9, 22.130849838256836, 228, 312],
    [61, 41, 4.8860423529411765, 6, 19.226497650146484, 60, 61],
    [227, 42, 4.8860423529411765, 6, 21.295568466186523, 228, 227],
    [229, 43, 7.297228235294119, 9, 21.073827743530273, 144, 229],
    [145, 46, 5.695430588235294, 7, 20.185640335083008, 144, 145],
    [62, 47, 7.303595294117648, 9, 19.03816795349121, 61, 62],
    [146, 52, 10.503653333333332, 13, 19.853715896606445, 145, 146],
  ] },
  { from: 58, to: 59, target: 1, sill: 40, rows: [
    [58, 39, 4.075239215686275, 5, 19.264612197875977, -1, 58],
    [142, 41, 4.890287058823529, 6, 20.303485870361328, 58, 142],
    [57, 43, 5.690478431372549, 7, 19.122236251831055, 58, 57],
    [141, 47, 5.695430588235294, 7, 20.19474983215332, 58, 141],
    [226, 48, 4.8860423529411765, 6, 21.28952407836914, 142, 226],
  ] },
]);
