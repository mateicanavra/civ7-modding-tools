import { describe, expect, it } from "bun:test";
import { getHexNeighborIndicesOddQ } from "@swooper/mapgen-core/lib/grid";

import hydrology from "../../../../../../src/domain/hydrology/router.js";

const { computeDrainageBasins, computeBasinWaterBudget, computeOpenBasinNetwork } = hydrology.hydrography.ops;
type Input = Parameters<typeof computeOpenBasinNetwork.run>[0];
const run = (input: Input) => computeOpenBasinNetwork.run(input, { strategy: "certified-sill-spill", config: {} });

function fixture(heights: number[], marine = [0], externalEdges = false) {
  const terrain = { width: heights.length, height: 1, elevation: Int16Array.from(heights), landMask: Uint8Array.from(heights.map((_, cell) => marine.includes(cell) ? 0 : 1)) };
  return {
    ...terrain,
    geometry: computeDrainageBasins.run(terrain, { strategy: "plateau-saddle-hierarchy", config: { allowExternalEdgeOutlets: externalEdges } }),
    localRunoff: Array.from(terrain.landMask),
    rainfall: new Uint8Array(heights.length).fill(10),
    potentialDemand: new Float32Array(heights.length).fill(1),
  };
}

function supported(input: Input) {
  const result = run(input);
  if (result.status !== "supported") throw new Error(JSON.stringify(result.witness));
  return result.plan;
}

function expectPlan(input: Input): void {
  const plan = supported(input);
  const wet = new Set(plan.bodies.flatMap(body => body.wetCells));
  const connectors = new Set(plan.bodies.flatMap(body => body.connectorCells));
  let dryRunoff = 0, wetPrecipitation = 0, wetDemand = 0;
  for (let cell = 0; cell < input.elevation.length; cell++) {
    expect(plan.wetMask[cell]).toBe(wet.has(cell) ? 1 : 0);
    if (!input.landMask[cell]) {
      expect(plan.receiver[cell]).toBe(-1);
      expect(plan.dryDischarge[cell]).toBe(0);
      continue;
    }
    if (wet.has(cell)) {
      wetPrecipitation += input.rainfall[cell]!; wetDemand += input.potentialDemand[cell]!;
      expect(plan.dryDischarge[cell]).toBe(0);
    } else {
      dryRunoff += input.localRunoff[cell]!;
      expect(plan.waterSurface[cell]).toBe(input.elevation[cell]);
      expect(input.elevation[plan.receiver[cell]!]!).toBeLessThanOrEqual(input.elevation[cell]!);
      if (!connectors.has(cell)) expect(plan.receiver[cell]).toBe(input.geometry.rawReceiver[cell]);
    }
    const visited = new Set<number>();
    let at = cell;
    while (input.landMask[at]) {
      expect(visited.has(at)).toBe(false); visited.add(at);
      const target = plan.receiver[at]!;
      expect(getHexNeighborIndicesOddQ(at % input.width, Math.floor(at / input.width), input.width, input.height)).toContain(target);
      expect(plan.waterSurface[target]!).toBeLessThanOrEqual(plan.waterSurface[at]!);
      expect(plan.terminalType[at]).toBe(input.landMask[target] ? 0 : 1);
      at = target;
    }
  }
  for (const body of plan.bodies) {
    const set = new Set(body.wetCells);
    expect(body.wetCells.filter(cell => !set.has(plan.receiver[cell]!))).toEqual([body.outletCell]);
    expect(body.connectorCells.every(cell => input.elevation[cell] === body.spillElevation && plan.wetMask[cell] === 0)).toBe(true);
    expect(body.flux.dryRunoff).toBe(0);
    expect(body.outflow).toBe(body.flux.balance);
    expect(body.outflow).toBeGreaterThanOrEqual(0);
    expect(body.flux.balance).toBe(body.flux.incomingOverflow + body.flux.wetPrecipitation - body.flux.wetDemand);
    for (const cell of body.wetCells) {
      expect(input.elevation[cell]!).toBeLessThan(body.spillElevation);
      expect(plan.bodyId[cell]).toBe(body.nodeId);
      expect(plan.waterSurface[cell]).toBe(body.spillElevation);
    }
  }
  expect(plan.conservation.dryRunoff).toBe(dryRunoff);
  expect(plan.conservation.wetPrecipitation).toBe(wetPrecipitation);
  expect(plan.conservation.wetDemand).toBe(wetDemand);
  expect(Math.abs(plan.conservation.residual)).toBeLessThanOrEqual(plan.conservation.roundoffBound);
  expect(plan.marineExits.reduce((sum, exit) => sum + exit.discharge, 0)).toBe(plan.conservation.externalDischarge);
}

describe("hydrology/compute-open-basin-network", () => {
  it("registers one bounded strategy with no policy knobs", () => {
    expect(computeOpenBasinNetwork.id).toBe("hydrology/compute-open-basin-network");
    expect(computeOpenBasinNetwork.defaultStrategy).toBe("certified-sill-spill");
    expect(computeOpenBasinNetwork.defaultConfig.config).toEqual({});
  });

  it("admits a purely marine grid and an ordinary dry coast without inventing bodies", () => {
    for (const input of [fixture([-1, -1], [0, 1]), fixture([-1, 0, 1, 2])]) {
      expect(supported(input).bodies).toEqual([]);
      expectPlan(input);
    }
  });

  it("preserves nested raw upland drainage and routes one exact outward connection per root", () => {
    const input = fixture([-5, 8, 0, 3, 1, 7, 2, 16, 20]);
    const before = structuredClone(input), first = supported(input);
    expect(first.certificates).toHaveLength(input.geometry.nodes.length);
    expect(first.bodies).toHaveLength(input.geometry.roots.length);
    expect(run(input)).toEqual({ status: "supported", plan: first });
    expect(input).toEqual(before);
    expectPlan(input);
  });

  it("mixes a negative wet-cell source with its whole body instead of clamping a BFS branch", () => {
    const input = fixture([-1, 4, 0, 0, 5, -1], [0, 5]);
    input.rainfall[2] = 0; input.potentialDemand[2] = 9;
    input.rainfall[3] = 10; input.potentialDemand[3] = 0;
    const plan = supported(input);
    expect(plan.bodies).toHaveLength(1);
    expect(plan.bodies[0]!.wetCells).toEqual([2, 3]);
    expect(plan.bodies[0]!.flux.wetPrecipitation).toBe(10);
    expect(plan.bodies[0]!.flux.wetDemand).toBe(9);
    expect(plan.bodies[0]!.outflow).toBe(1);
    expectPlan(input);
  });

  it("keeps supplied Number runoff precision rather than reconstructing or rounding it", () => {
    const input = fixture([-1, 1, 2, 0, 3, -1], [0, 5]);
    input.localRunoff[2] = 1 + 2 ** -30;
    input.rainfall[3] = 2;
    const plan = supported(input);
    expect(plan.bodies[0]!.connectorCells).toEqual([2]);
    expect(plan.receiver[2]).toBe(1);
    expect(plan.dryDischarge[2]).toBe(2 + 2 ** -30);
    expect(plan.dryDischarge[2]).not.toBe(Math.fround(plan.dryDischarge[2]!));
    expectPlan(input);
  });

  it("retains the certified dry-sill runoff bypass as an unsupported body, with no partial plan", () => {
    const input = fixture([-1, 1, 2, 0, 3, -1], [0, 5]);
    input.localRunoff.fill(0); input.localRunoff[2] = 20.5;
    input.rainfall.fill(0); input.rainfall[2] = 25;
    input.potentialDemand.fill(0); input.potentialDemand[3] = 10;
    const node = input.geometry.nodes[0]!;
    const raw = computeBasinWaterBudget.run({
      cells: Array.from(input.geometry.catchmentCells).map(cell => ({ cell, ground: input.elevation[cell]!, localRunoff: input.localRunoff[cell]!, precipitation: input.rainfall[cell]!, potentialDemand: input.potentialDemand[cell]! })),
      incomingOverflow: 0, attainedLevel: node.baseElevation, spillElevation: node.spill!.elevation,
    }, { strategy: "elevation-cohorts", config: {} });
    expect(raw.state).toBe("open");
    expect(raw.flux.balance).toBe(10.5);
    const result = run(input);
    expect(result).toEqual({ status: "unsupported", witness: { kind: "negative-body-outflow", nodeId: 1, wetCells: [3], flux: { incomingOverflow: 0, dryRunoff: 0, wetPrecipitation: 0, wetDemand: 10, balance: -10 } } });
    expect("plan" in result).toBe(false);
  });

  it("does not promote a later positive sill balance past an earlier nonpositive cohort", () => {
    const input = fixture([-1, 5, 0, 1, 2, 6, -1], [0, 6]);
    input.rainfall.fill(0); input.potentialDemand.fill(0);
    input.potentialDemand[2] = 10; input.rainfall[4] = 100;
    const result = run(input);
    expect(result.status).toBe("unsupported");
    if (result.status !== "unsupported") throw new Error("Expected unsupported certificate.");
    expect(result.witness.kind).toBe("uncertified-node");
    expect("plan" in result).toBe(false);
  });

  it("reports zero-source, outlet-free, and admitted external-edge inputs without fallback", () => {
    const zero = fixture([-1, 5, 0, 5]); zero.localRunoff.fill(0);
    const inputs = [zero, fixture([3, 0, 2], []), fixture([3, 2, 1], [], true)];
    const kinds = ["uncertified-node", "outlet-free-root", "external-land-terminal"] as const;
    for (const [index, input] of inputs.entries()) {
      const result = run(input);
      expect(result.status).toBe("unsupported");
      if (result.status !== "unsupported") throw new Error("Expected unsupported domain.");
      expect(result.witness.kind).toBe(kinds[index]!);
      expect("plan" in result).toBe(false);
    }
  });

  it("handles equal-height cylindrical connections and varied finite basin hierarchies", () => {
    for (let sample = 0; sample < 20; sample++) {
      const width = 8, height = 5, elevation = Int16Array.from({ length: width * height }, (_, cell) => cell < width ? -10 : (cell * 17 + sample * 7 + cell * cell) % 13);
      const landMask = Uint8Array.from(elevation, z => z === -10 ? 0 : 1);
      const geometry = computeDrainageBasins.run({ width, height, elevation, landMask }, { strategy: "plateau-saddle-hierarchy", config: { allowExternalEdgeOutlets: false } });
      expectPlan({ width, height, elevation, landMask, geometry, localRunoff: Array.from(landMask), rainfall: new Uint8Array(width * height).fill(10), potentialDemand: new Float32Array(width * height).fill(1) });
    }
  });

  it("rejects nonfinite, negative, mismatched, or misattributed forcing before support checks", () => {
    for (const value of [-1, NaN, Infinity, -Infinity]) {
      const input = fixture([3, 0, 2], []);
      input.localRunoff[0] = value;
      expect(() => run(input)).toThrow();
      input.localRunoff[0] = 1; input.potentialDemand[0] = value;
      expect(() => run(input)).toThrow();
    }
    const input = fixture([-1, 5, 0, 5]);
    expect(() => run({ ...input, localRunoff: [1] })).toThrow();
    input.localRunoff[0] = 1;
    expect(() => run(input)).toThrow("marine runoff");
    input.localRunoff[0] = 0; input.landMask[1] = 2;
    expect(() => run(input)).toThrow("binary land mask");
  });

  it("rejects contradictory supplied geometry rather than repairing it", () => {
    const original = fixture([-1, 5, 0, 0, 5, -1], [0, 5]);
    const edits: Array<(input: ReturnType<typeof fixture>) => void> = [
      input => { input.geometry.nodes[0]!.spill!.elevation++; },
      input => { input.geometry.nodes[0]!.spill!.fromCell = 0; },
      input => { input.geometry.nodes[0]!.floorElevation++; },
      input => { input.geometry.catchmentCells[1] = input.geometry.catchmentCells[0]!; },
      input => { input.geometry.rawReceiver[2] = 3; input.geometry.rawReceiver[3] = 2; },
      input => { input.geometry.leafId[2] = 0; },
      input => { input.geometry.hypsometry[0]!.cellCount++; },
      input => { input.geometry.roots.push(input.geometry.roots[0]!); },
    ];
    for (const edit of edits) {
      const input = structuredClone(original); edit(input);
      expect(() => run(input)).toThrow();
    }
    expectPlan(original);
  });
});
