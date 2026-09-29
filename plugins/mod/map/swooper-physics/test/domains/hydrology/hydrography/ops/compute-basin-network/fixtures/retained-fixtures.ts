/** Exact rows promoted from the 2026-09-29 refusal receipts, with only the two
 * outside receiving reaches replaced by inert original-marine boundary stubs. */
import type { OperationInput, Static } from "@swooper/mapgen-core/authoring";
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
  const landMask = Uint8Array.from(elevation, value => value === -10 ? 0 : 1);
  const terrain = { width, height, elevation, landMask };
  const input = {
    ...terrain,
    geometry: geometry.run(terrain, { strategy: "plateau-saddle-hierarchy", config: { allowExternalEdgeOutlets: false } }),
    localRunoff: Array.from(landMask, land => land ? random() * 4 : 0),
    rainfall: Uint8Array.from({ length: size }, () => Math.floor(random() * 15)),
    potentialDemand: Float32Array.from({ length: size }, () => random() * 30),
  };
  return { input, nextSeed: seed };
}

function retained(width: number, height: number, groups: Array<{ rows: Row[]; from: number; to: number; target: number; sill: number }>): Static<typeof contract.input> {
  const size = width * height, elevation = new Int16Array(size).fill(1000), landMask = new Uint8Array(size), rainfall = new Uint8Array(size), potentialDemand = new Float32Array(size), localRunoff = new Array<number>(size).fill(0);
  const rawReceiver = new Int32Array(size).fill(-1), leafId = new Int32Array(size), plateauId = new Int32Array(size).fill(-1), catchmentCells: number[] = [];
  const nodes: Geometry["nodes"] = [], hypsometry: Geometry["hypsometry"] = [], saddles: Geometry["saddles"] = [];
  for (const [index, group] of groups.entries()) {
    const id = index + 1, cellStart = catchmentCells.length, hypsometryStart = hypsometry.length, bins = new Map<number, number>();
    for (const [cell, ground, runoff, rain, demand, receiver, plateau] of group.rows) {
      elevation[cell] = ground; landMask[cell] = 1; localRunoff[cell] = runoff; rainfall[cell] = rain; potentialDemand[cell] = demand;
      rawReceiver[cell] = receiver; leafId[cell] = id; plateauId[cell] = plateau; catchmentCells.push(cell); bins.set(ground, (bins.get(ground) ?? 0) + 1);
    }
    hypsometry.push(...[...bins].sort(([a], [b]) => a - b).map(([elevation, cellCount]) => ({ elevation, cellCount })));
    nodes.push({ id, kind: "leaf", floorCell: group.rows[0]![0], floorElevation: group.rows[0]![1], baseElevation: group.rows[0]![1], parentId: -1, children: [],
      spill: { elevation: group.sill, fromCell: group.from, toCell: group.to, targetLeafId: group.target }, cellStart, cellEnd: catchmentCells.length, hypsometryStart, hypsometryEnd: hypsometry.length });
    if (!group.target) elevation[group.to] = group.sill;
    saddles.push(group.target < id
      ? { leafA: group.target, leafB: id, cellA: group.to, cellB: group.from, elevation: group.sill }
      : { leafA: id, leafB: group.target, cellA: group.from, cellB: group.to, elevation: group.sill });
  }
  return { width, height, elevation, landMask, localRunoff, rainfall, potentialDemand,
    geometry: { rawReceiver, leafId, plateauId, nodes, roots: nodes.map(node => node.id), saddles, catchmentCells: Int32Array.from(catchmentCells), externalCatchmentCells: new Int32Array(), hypsometry } } satisfies Input;
}

export const hugeRoot17 = () => retained(106, 3, [{ from: 43, to: 148, target: 0, sill: 25, rows: [
  [43, 22, 4.8860423529411765, 6, 18.69264793395996, -1, 43],
  [149, 24, 4.8860423529411765, 6, 19.32852554321289, 43, 149],
  [44, 26, 7.297228235294119, 9, 18.534313201904297, 43, 44],
  [254, 27, 8.108031372549021, 10, 19.72927474975586, 255, 254],
  [255, 27, 7.303595294117648, 9, 19.78775978088379, 149, 254],
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
