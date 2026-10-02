import { describe, expect, it } from "bun:test";
import { getHexNeighborIndicesOddQ } from "@swooper/mapgen-core/lib/grid";
import hydrologyOpsPublic from "../../../../../../src/domain/hydrology/router.js";
import { desertHugeRoot19, hugeRoot17, largerGrid, standardRoots37And39 } from "./fixtures/retained-fixtures.js";

const { computeBasinNetwork: network, computeDrainageBasins: geometry } = hydrologyOpsPublic.hydrography.ops;

type Input = Parameters<typeof network.run>[0];
const run = (input: Input) => network.run(input, { strategy: "stationary-sill-spill", config: {} });
function supported(input: Input) {
  const output = run(input);
  if (output.status !== "supported") throw new Error(JSON.stringify(output));
  return output.plan;
}
function fixture(heights: number[], marine = [0], externalEdges = false, externalWaterHead = 0) {
  const terrain = { width: heights.length, height: 1, elevation: Int16Array.from(heights), externalWaterMask: Uint8Array.from(heights.map((_, cell) => marine.includes(cell) ? 1 : 0)), externalWaterHead };
  return { ...terrain, geometry: geometry.run(terrain, { strategy: "plateau-saddle-hierarchy", config: { allowExternalEdgeOutlets: externalEdges } }),
    localRunoff: Array.from(terrain.externalWaterMask, (prescribed): number => prescribed ? 0 : 1), rainfall: new Uint8Array(heights.length).fill(10), potentialDemand: new Float32Array(heights.length).fill(1) } satisfies Input;
}
function verify(input: Input) {
  const before = structuredClone(input), plan = supported(input);
  expect(input).toEqual(before);
  const sources = plan.pools.flatMap(pool => pool.catchmentCells);
  expect(new Set(sources).size).toBe(sources.length);
  const wet = plan.bodies.flatMap(body => body.wetCells);
  expect(new Set(wet).size).toBe(wet.length);
  for (let cell = 0; cell < input.elevation.length; cell++) {
    expect(plan.wetMask[cell]).toBe(wet.includes(cell) ? 1 : 0);
    expect(Number.isFinite(plan.waterSurface[cell])).toBe(true);
    if (!input.externalWaterMask[cell]) { expect(plan.terminalId[cell]).toBeGreaterThan(0); expect(plan.terminalType[cell]).toBeGreaterThan(0); }
    expect(plan.exposedLandMask[cell]).toBe(!input.externalWaterMask[cell] && !plan.wetMask[cell] ? 1 : 0);
    if (plan.wetMask[cell]) { expect(plan.waterSurface[cell]!).toBeGreaterThan(input.elevation[cell]!); expect(plan.dryDischarge[cell]).toBe(0); }
    else expect(plan.waterSurface[cell]).toBe(input.externalWaterMask[cell] ? input.externalWaterHead : input.elevation[cell]);
    const receiver = plan.receiver[cell]!;
    if (receiver >= 0) {
      expect(getHexNeighborIndicesOddQ(cell % input.width, Math.floor(cell / input.width), input.width, input.height)).toContain(receiver);
      if (!plan.wetMask[cell]) expect(input.externalWaterMask[receiver] ? input.externalWaterHead : input.elevation[receiver]!).toBeLessThanOrEqual(input.elevation[cell]!);
    }
    if (!input.externalWaterMask[cell] && !plan.componentId[cell]) expect(receiver).toBe(input.geometry.rawReceiver[cell]);
  }
  for (const component of plan.components) {
    expect(component.componentId).toBe(Math.min(...component.memberCells) + 1);
    expect(Math.abs(component.flux.balance - component.outflow - component.unresolvedResidual)).toBeLessThanOrEqual(plan.conservation.roundoffBound);
  }
  for (const transfer of plan.transfers) {
    expect(transfer.cellA).toBeLessThan(transfer.cellB);
    expect(getHexNeighborIndicesOddQ(transfer.cellA % input.width, Math.floor(transfer.cellA / input.width), input.width, input.height)).toContain(transfer.cellB);
  }
  expect(Math.abs(plan.conservation.residual)).toBeLessThanOrEqual(plan.conservation.roundoffBound);
  return plan;
}

describe("hydrology/compute-basin-network", () => {
  it("keeps full finite storage, transport, exposure and conservation independent of external beds", () => {
    const input = fixture([-100, 5, 1, 3, 0, 8, -50], [0, 6]);
    const before = structuredClone(input), plan = verify(input), alternate = structuredClone(input);
    alternate.elevation[0] = 32767;
    alternate.elevation[6] = -32768;
    const { width, height, elevation, externalWaterMask, externalWaterHead } = alternate;
    alternate.geometry = geometry.run({ width, height, elevation, externalWaterMask, externalWaterHead }, geometry.defaultConfig);
    expect(alternate.geometry).toEqual(input.geometry);
    expect(verify(alternate)).toEqual(plan);
    expect(input).toEqual(before);
    expect(plan.conservation.marineDischarge).toBeGreaterThan(0);
    for (const exit of plan.marineExits) {
      expect(plan.waterSurface[exit.marineCell]).toBe(input.externalWaterHead);
      const component = plan.components.find(item => item.memberCells.includes(exit.fromCell));
      expect(component?.level ?? input.elevation[exit.fromCell]!).toBeGreaterThanOrEqual(input.externalWaterHead);
    }
  });

  it("resolves hydraulic geometry at lower and tied receiving heads without exporting uphill", () => {
    const low = fixture([-100, 5, 2, 7], [0], false, 0);
    const below = fixture([-100, 5, 2, 7], [0], false, 4.5);
    const equal = fixture([-100, 5, 2, 7], [0], false, 5);
    expect(low.geometry.rawReceiver[1]).toBe(0);
    expect(below.geometry.rawReceiver[1]).toBe(2);
    const belowPlan = verify(below), equalPlan = verify(equal);
    expect(equalPlan.pools).toEqual(belowPlan.pools);
    for (const input of [low, below, equal]) {
      const plan = verify(input);
      for (const exit of plan.marineExits) expect(plan.waterSurface[exit.fromCell]!).toBeGreaterThanOrEqual(input.externalWaterHead);
    }
  });

  it("returns an explicit unsupported inward connection rather than lifting its sill or exporting uphill", () => {
    const input = fixture([-100, 5, 2, 7]);
    input.externalWaterHead = 6;
    const before = structuredClone(input);
    expect(run(input)).toEqual({ status: "unsupported-external-inundation", witness: { kind: "below-head-connection", externalCell: 0, finiteCell: 1, finiteGround: 5, externalWaterHead: 6 } });
    expect(input).toEqual(before);
    input.elevation[0] = 1000;
    expect(run(input)).toEqual(run(before));
  });

  it("validates saddle and outlet heights against receiving head, never the reservoir bed", () => {
    const input = fixture([-100, 5, 2, 7], [0], false, 5);
    expect(input.geometry.nodes[0]!.spill?.elevation).toBe(5);
    const wrongSaddle = structuredClone(input);
    wrongSaddle.geometry.saddles[0]!.elevation = 100;
    expect(() => run(wrongSaddle)).toThrow(/saddle labels\/height/);
    const wrongOutlet = structuredClone(input);
    wrongOutlet.geometry.nodes[0]!.spill!.elevation = 100;
    expect(() => run(wrongOutlet)).toThrow(/spill height/);
    const nonbinary = structuredClone(input);
    nonbinary.externalWaterMask[0] = 2;
    expect(() => run(nonbinary)).toThrow();
    expect(() => run({ ...input, externalWaterHead: NaN })).toThrow();
  });

  it("does not commit a lower merger against an unsettled higher-sill export", () => {
    const { input, nextSeed } = largerGrid();
    expect(nextSeed).toBe(-397855455);
    const plan = verify(input);
    const upstream = plan.pools.find(pool => pool.leafIds.includes(78))!;
    const receiver = plan.pools.find(pool => pool.leafIds.includes(82))!;
    const terminal = plan.pools.find(pool => pool.leafIds.includes(86))!;
    expect(upstream.leafIds).toEqual([60, 78, 85, 93, 121, 137]);
    expect(upstream.outflow).toBe(8.979684541001916);
    expect(receiver.leafIds).toEqual([82]);
    expect(receiver.flux.incomingOverflow).toBe(upstream.outflow);
    expect(receiver.outflow).toBe(6.516185967251658);
    expect(terminal.leafIds).toEqual([86]);
    expect(terminal.state).toBe("subtile");
    expect(terminal.level).toBe(0);
    expect(terminal.wetCells).toEqual([]);
    expect(plan.wetMask[1091]).toBe(0);
    expect(terminal.unresolvedResidual).toBe(13.48288746085018);
    if (terminal.closure?.resolution !== "shoreline-quantization") throw new Error("Missing closed cohort");
    // The old attained deficit is now the rejected next cohort, not retained wet demand.
    expect(terminal.closure.after.balance).toBe(-11.585683768615127);
    expect(plan.conservation.residual).toBe(0);
    const reordered = structuredClone(input);
    reordered.geometry.saddles.reverse();
    expect(supported(reordered)).toEqual(plan);
  });
  it("registers only the stationary policy with no numerical controls", () => {
    expect(network.id).toBe("hydrology/compute-basin-network");
    expect(network.defaultStrategy).toBe("stationary-sill-spill");
    expect(network.defaultConfig.config).toEqual({});
  });
  it("retains Huge root17's exact whole-cell bracket and explicit unresolved surplus", () => {
    const plan = verify(hugeRoot17()), pool = plan.pools[0]!;
    expect(pool.state).toBe("closed"); expect(pool.wetCells).toEqual([43]); expect(pool.level).toBe(24);
    expect(pool.outflow).toBe(0); expect(pool.unresolvedResidual).toBe(14.902249320942005);
    expect(pool.closure?.resolution).toBe("shoreline-quantization");
    if (pool.closure?.resolution !== "shoreline-quantization") throw new Error("Missing bracket");
    expect(pool.closure.cohortCells).toEqual([149]); expect(pool.closure.after.balance).toBe(-3.3123185752120605);
    expect(plan.ports).toEqual([]); expect(plan.terminalType[43]).toBe(3);
  });
  it("retains Desert root19's original Number delivery and quantized unresolved supply", () => {
    const input = desertHugeRoot19(), plan = verify(input), pool = plan.pools[0]!;
    expect(Array.isArray(input.localRunoff)).toBe(true);
    expect(input.localRunoff[2740]).not.toBe(Math.fround(input.localRunoff[2740]!));
    expect(input.potentialDemand).toBeInstanceOf(Float32Array);
    expect(plan.pools).toHaveLength(1); expect(pool.leafIds).toEqual([1]);
    expect(pool.catchmentCells.filter(cell => input.elevation[cell]! < 1000)).toHaveLength(42);
    expect(pool.state).toBe("closed"); expect(pool.level).toBe(30);
    expect(pool.wetCells).toEqual([2635, 2636, 2739, 2740, 2741, 2742, 2845, 2846, 2847, 2848, 2849, 2951, 2952, 2953]);
    expect(pool.outflow).toBe(0); expect(pool.unresolvedResidual).toBe(3.2292057291665515);
    expect(pool.flux).toEqual({ incomingOverflow: 0, dryRunoff: 1184.3766666666666, wetPrecipitation: 749, wetDemand: 1930.1474609375, balance: 3.2292057291665515 });
    expect(pool.closure).toEqual({ resolution: "shoreline-quantization", level: 30,
      cohortCells: [2528, 2529, 2530, 2634, 2637, 2738, 2743, 2844, 2950, 2954],
      before: pool.flux,
      after: { incomingOverflow: 0, dryRunoff: 755.3058333333332, wetPrecipitation: 1291, wetDemand: 3297.9371490478516, balance: -1251.6313157145182 },
      jumpMagnitude: 1254.8605214436848, unresolvedResidual: pool.unresolvedResidual });
    expect(plan.bodies).toHaveLength(1); expect(plan.components).toHaveLength(1);
    const body = plan.bodies[0]!, component = plan.components[0]!;
    expect(body.bodyId).toBe(2636); expect(component.componentId).toBe(2636);
    expect(body.wetCells).toEqual(pool.wetCells); expect(component.memberCells).toEqual(pool.wetCells);
    expect(body.flux).toEqual({ incomingOverflow: 1184.3766666666668, dryRunoff: 0, wetPrecipitation: 749, wetDemand: 1930.1474609375, balance: 3.229205729166779 });
    expect(component.flux).toEqual(body.flux);
    for (const record of [body, component]) {
      expect(record.outflow).toBe(0); expect(record.unresolvedResidual).toBe(pool.unresolvedResidual);
      expect(record.flux.balance - record.outflow - record.unresolvedResidual).toBe(2 ** -42);
    }
    // The original source/edge oracle sums exactly to this binary64-representable dyadic.
    expect(227235151852769 * 2 ** -46 - pool.unresolvedResidual).toBe(2 ** -46);
    expect(plan.ports).toEqual([]); expect(plan.transfers).toEqual([]);
  });
  it("absorbs the root39 delivery once and supports root37 inward at dry junction312", () => {
    const input = standardRoots37And39(), plan = verify(input);
    expect(plan.pools).toHaveLength(1); expect(plan.pools[0]!.leafIds).toEqual([1, 2]);
    expect(plan.pools[0]!.outflow).toBeCloseTo(1.7170643127800531, 12);
    expect(plan.bodies).toHaveLength(2);
    const exchange = plan.transfers.find(edge => edge.cellA === 228 && edge.cellB === 312)!;
    expect(exchange.signedDischarge).toBeCloseTo(-5.586530981337614, 12);
    expect(plan.receiver[312]).toBe(228); expect(plan.dryDischarge[312]).toBeCloseTo(5.586530981337614, 12);
    expect(plan.receiver[396]).toBe(395); expect(plan.dryDischarge[396]).toBe(plan.pools[0]!.outflow);
    expect(plan.bodies.find(body => body.wetCells.includes(228))!.outflow).toBe(0);
    const reversed = structuredClone(input); reversed.geometry.saddles.reverse();
    expect(supported(reversed)).toEqual(plan); expect(supported(input)).toEqual(plan);
  });
  it("admits the dry-sill bypass without inventing an outward reservoir edge", () => {
    const input = fixture([-1, 1, 2, 0, 3, -1], [0, 5]);
    input.localRunoff.fill(0); input.localRunoff[2] = 20.5; input.rainfall.fill(0); input.potentialDemand.fill(0); input.potentialDemand[3] = 10;
    const plan = verify(input);
    expect(plan.bodies[0]!.outflow).toBe(0); expect(plan.bodies[0]!.flux.incomingOverflow).toBe(10);
    expect(plan.dryDischarge[2]).toBe(10.5); expect(plan.transfers[0]!.signedDischarge).toBe(10);
  });
  it("keeps Number runoff and mixes a negative wet source without per-cell clipping", () => {
    const input = fixture([-1, 4, 0, 0, 5, -1], [0, 5]);
    input.localRunoff[1] = 1 + 2 ** -30;
    input.rainfall[2] = 0; input.potentialDemand[2] = 9;
    input.rainfall[3] = 10; input.potentialDemand[3] = 0;
    const plan = verify(input);
    expect(plan.bodies[0]!.wetCells).toEqual([2, 3]);
    expect(plan.bodies[0]!.flux.wetDemand).toBe(9);
    expect(plan.dryDischarge[1]).toBe(3 + 2 ** -30);
    expect(plan.dryDischarge[1]).not.toBe(Math.fround(plan.dryDischarge[1]!));
  });
  it("keeps a saturated partial multifurcation below its unsaturated sibling", () => {
    const input = fixture([-1, 6, 0, 3, 0, 3, 0, 7, -1], [0, 8]);
    input.localRunoff.fill(0); for (const cell of [2, 4, 6]) input.localRunoff[cell] = 1;
    input.rainfall.fill(0); input.potentialDemand.fill(0); input.rainfall[2] = 5; input.potentialDemand[4] = 1; input.potentialDemand[6] = 100;
    const plan = verify(input);
    expect(plan.pools.some(pool => pool.leafIds.length === 2 && pool.level === 3)).toBe(true);
    expect(plan.pools.some(pool => pool.state === "subtile")).toBe(true);
    expect(plan.wetMask[6]).toBe(0); expect(plan.conservation.externalDischarge).toBe(0);
  });
  it("represents zero intervals with the next exact Number, and never jumps an early closed cohort", () => {
    const exact = fixture([-1, 5, 0, 1, 6, -1], [0, 5]);
    exact.rainfall.fill(0); exact.potentialDemand.fill(0); exact.potentialDemand[2] = 1;
    const plan = verify(exact), pool = plan.pools[0]!;
    expect(pool.state).toBe("closed"); expect(pool.closure?.resolution).toBe("exact-balance");
    expect(pool.level).toBe(Number.MIN_VALUE); expect(plan.wetMask[2]).toBe(1); expect(plan.waterSurface[2]).not.toBe(Math.round(plan.waterSurface[2]!));
    const nonmonotone = fixture([-1, 5, 0, 1, 2, 6, -1], [0, 6]);
    nonmonotone.rainfall.fill(0); nonmonotone.potentialDemand.fill(0); nonmonotone.potentialDemand[2] = 10; nonmonotone.rainfall[4] = 100;
    expect(verify(nonmonotone).pools[0]!.state).toBe("subtile");
  });
  it("distinguishes no-source dry, balanced outlet-free and persistent surplus", () => {
    const dry = fixture([-1, 5, 0, 5]); dry.localRunoff.fill(0);
    expect(verify(dry).pools[0]!.state).toBe("dry");
    const balanced = fixture([3, 0, 2], []); balanced.rainfall.fill(0); balanced.potentialDemand.fill(0); balanced.potentialDemand[1] = 2;
    expect(verify(balanced).pools[0]!.state).toBe("closed");
    const result = run(fixture([3, 0, 2], []));
    expect(result.status).toBe("no-stationary-solution"); expect("plan" in result).toBe(false);
  });
  it("retains boundary exports separately, with no imaginary principal native edge", () => {
    const plan = verify(fixture([3, 2, 1], [], true));
    expect(plan.conservation.boundaryDischarge).toBe(3); expect(plan.conservation.marineDischarge).toBe(0);
    expect(plan.boundaryExits.length).toBeGreaterThan(0);
    for (const exit of plan.boundaryExits) { expect(plan.receiver[exit.fromCell]).toBe(-1); expect(plan.dryDischarge[exit.fromCell]).toBe(0); expect(plan.terminalType[exit.fromCell]).toBe(2); }
  });
  it("gives a boundary-connected hydraulic component a port without a receiver", () => {
    const terrain = { width: 3, height: 3, elevation: Int16Array.from([2, 2, 2, 2, 0, 2, 2, 2, 2]), externalWaterMask: new Uint8Array(9), externalWaterHead: 0 };
    const plan = verify({ ...terrain, geometry: geometry.run(terrain, { strategy: "plateau-saddle-hierarchy", config: { allowExternalEdgeOutlets: true } }), localRunoff: new Array(9).fill(1), rainfall: new Uint8Array(9).fill(10), potentialDemand: new Float32Array(9).fill(1) });
    expect(plan.ports).toHaveLength(1); expect(plan.ports[0]!.kind).toBe("boundary-export");
    expect("toCell" in plan.ports[0]!).toBe(false);
    expect(plan.dryDischarge[plan.ports[0]!.fromCell]).toBe(0);
    expect(plan.conservation.boundaryDischarge).toBe(17);
  });
  it("handles marine grids and deterministic varied wet, closed and wrapped-hex hierarchies", () => {
    expect(verify(fixture([-1, -1], [0, 1])).pools).toEqual([]);
    for (let sample = 0; sample < 40; sample++) {
      const width = 8, height = 5, elevation = Int16Array.from({ length: 40 }, (_, cell) => cell < 8 ? -10 : (cell * 17 + sample * 7 + cell * cell) % 13), externalWaterMask = Uint8Array.from(elevation, value => value === -10 ? 1 : 0);
      const terrain = { width, height, elevation, externalWaterMask, externalWaterHead: -10 };
      verify({ ...terrain, geometry: geometry.run(terrain, { strategy: "plateau-saddle-hierarchy", config: { allowExternalEdgeOutlets: false } }), localRunoff: Array.from(externalWaterMask, (_, cell) => externalWaterMask[cell] ? 0 : 1 + (cell * sample) % 7), rainfall: Uint8Array.from({ length: 40 }, (_, cell) => (sample + cell) % 21), potentialDemand: Float32Array.from({ length: 40 }, (_, cell) => (sample * cell) % 30) });
    }
  });
  it("rejects malformed forcing, duplicate sources and root dependency cycles", () => {
    const input = hugeRoot17();
    input.localRunoff[43] = NaN; expect(() => run(input)).toThrow();
    const duplicate = hugeRoot17(); duplicate.geometry.catchmentCells[1] = 43; expect(() => run(duplicate)).toThrow();
    const malformed = standardRoots37And39(); malformed.geometry.nodes[0]!.spill!.targetLeafId = 2; expect(() => run(malformed)).toThrow();
  });
  it("settles upstream generations before dependent mergers across adversarial plateau partitions", () => {
    let seed = 19219;
    const random = () => ((seed = Math.imul(seed, 1664525) + 1013904223 | 0) >>> 0) / 2 ** 32;
    for (let sample = 0; sample < 4000; sample++) {
      const width = 8, height = 7, elevation = Int16Array.from({ length: 56 }, (_, cell) => cell < 8 ? -10 : Math.floor(random() * 9)), externalWaterMask = Uint8Array.from(elevation, value => value === -10 ? 1 : 0);
      const terrain = { width, height, elevation, externalWaterMask, externalWaterHead: -10 };
      const input = { ...terrain, geometry: geometry.run(terrain, { strategy: "plateau-saddle-hierarchy", config: { allowExternalEdgeOutlets: false } }), localRunoff: Array.from(externalWaterMask, value => value ? 0 : random() * 4), rainfall: Uint8Array.from({ length: 56 }, () => Math.floor(random() * 15)), potentialDemand: Float32Array.from({ length: 56 }, () => random() * 30) };
      const plan = supported(input);
      expect(Math.abs(plan.conservation.residual)).toBeLessThanOrEqual(plan.conservation.roundoffBound);
      // These exact generations found stale response, unrelated shoreline, and
      // recorded-plateau outlet bugs during the independent partition checks.
      if ([12, 85, 113, 1877, 3551].includes(sample)) verify(input);
    }
  });
  it("settles independent hydraulic groups across larger source partitions", () => {
    let seed = 919121;
    for (let sample = 0; sample < 24; sample++) {
      const { input, nextSeed } = largerGrid(seed);
      seed = nextSeed;
      const before = structuredClone(input), plan = supported(input);
      expect(input).toEqual(before);
      expect(Math.abs(plan.conservation.residual)).toBeLessThanOrEqual(plan.conservation.roundoffBound);
      for (const pool of plan.pools) {
        expect(pool.flux.balance).toBeGreaterThanOrEqual(0);
        expect(Math.abs(pool.flux.balance - pool.outflow - pool.unresolvedResidual)).toBeLessThanOrEqual(plan.conservation.roundoffBound);
      }
    }
  }, 30_000);
});
