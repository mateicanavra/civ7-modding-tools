import { describe, expect, it } from "bun:test";
import morphology from "../../../../../../src/domain/morphology/router.js";
import hydrology from "../../../../../../src/domain/hydrology/router.js";
import type { Static } from "@swooper/mapgen-core/authoring";
import { runAdmittedOperationForTest } from "@swooper/mapgen-core/testing";

const { computeChannelIncision: operation } = morphology.erosion.ops;
type Input = Parameters<typeof operation.run>[0];
type Fixture = Static<typeof operation.input>;
type Config = typeof operation.defaultConfig.config;
const selection = { strategy: "implicit-stream-power", config: { rate: 1, m: 0.5, n: 1 } } as const;
const run = (input: Input, config: Config = selection.config) => runAdmittedOperationForTest(operation, input, { ...selection, config });

function profile(elevation: number[], receiver: number[], dryDischarge: number[]): Fixture {
  return {
    width: 1, height: elevation.length, elevation: elevation.slice(),
    initialElevation: Int16Array.from(elevation),
    originalLandMask: new Uint8Array(elevation.length).fill(1),
    externalWaterMask: new Uint8Array(elevation.length),
    exposedLandMask: new Uint8Array(elevation.length).fill(1),
    wetMask: new Uint8Array(elevation.length),
    receiver: Int32Array.from(receiver), dryDischarge: dryDischarge.slice(),
    waterSurface: elevation.slice(), seaLevel: 0,
    erodibilityK: new Float32Array(elevation.length).fill(1),
  };
}

describe("morphology/compute-channel-incision", () => {
  it("registers the pure analytic linear-slope operation without legacy routing inputs", () => {
    expect(operation.id).toBe("morphology/compute-channel-incision");
    expect(operation.defaultStrategy).toBe("implicit-stream-power");
    expect(operation.defaultConfig.config.n).toBe(1);
    expect("flowAccum" in operation.input.properties).toBe(false);
    expect("sedimentDepth" in operation.output.properties).toBe(false);
  });

  it("matches the downstream-first analytic descending update and reports only surface removal", () => {
    const input = profile([300, 200, 100], [1, 2, -1], [4, 4, 0]);
    const output = run(input);
    expect(output.elevation[2]).toBe(100);
    expect(output.elevation[1]).toBeCloseTo(400 / 3, 12);
    expect(output.elevation[0]).toBeCloseTo(1700 / 9, 12);
    for (let cell = 0; cell < 2; cell++) {
      expect(output.elevation[cell]!).toBeGreaterThanOrEqual(output.elevation[input.receiver[cell]!]!);
      expect(output.incisionDepth[cell]).toBe(input.elevation[cell]! - output.elevation[cell]!);
    }
  });

  it("propagates downstream lowering through a supplied flat connector", () => {
    const input = profile([100, 100, 0], [1, 2, -1], [1, 1, 0]);
    const output = run(input);
    expect(output.elevation).toEqual([75, 50, 0]);
    expect(output.incisionDepth).toEqual([25, 50, 0]);
  });

  it("holds wet floors and initial water while incising a dry inlet and outlet against hydraulic heads", () => {
    const input = profile([-400, 100, 20, 200, 200, 300], [-1, 0, 1, 2, 3, 4], [0, 4, 0, 4, 4, 4]);
    input.originalLandMask[0] = 0;
    input.originalLandMask[4] = 0;
    input.externalWaterMask[0] = 1;
    input.exposedLandMask[0] = 0;
    input.exposedLandMask[2] = 0;
    input.wetMask[2] = 1;
    input.waterSurface[0] = 10;
    input.waterSurface[2] = 100;
    input.seaLevel = 10;
    const before = structuredClone(input), output = run(input);
    expect(output.elevation[0]).toBe(-400);
    expect(output.elevation[1]).toBeCloseTo(40, 12);
    expect(output.elevation[2]).toBe(20);
    expect(output.elevation[3]).toBeCloseTo(400 / 3, 12);
    expect(output.elevation[4]).toBe(200);
    expect(output.elevation[5]).toBeCloseTo(700 / 3, 12);
    expect(output.incisionDepth[0]).toBe(0);
    expect(output.incisionDepth[2]).toBe(0);
    expect(output.incisionDepth[4]).toBe(0);
    const alternate = structuredClone(input);
    alternate.elevation[0] = -30000;
    const deep = run(alternate);
    expect(deep.elevation.slice(1)).toEqual(output.elevation.slice(1));
    expect(input).toEqual(before);
  });

  it("leaves zero discharge, rate and erodibility exact, including zero-discharge exponent zero", () => {
    const input = profile([200.25, 100.125, 0], [1, 2, -1], [0, 0, 0]);
    expect(run(input).elevation).toEqual(input.elevation);
    expect(run(input, { rate: 1, m: 0, n: 1 }).elevation).toEqual(input.elevation);
    input.dryDischarge[0] = 1;
    expect(run(input, { rate: 0, m: 0.5, n: 1 }).elevation).toEqual(input.elevation);
    input.erodibilityK.fill(0);
    expect(run(input).elevation).toEqual(input.elevation);
  });

  it("preserves initially submerged exposed land but keeps initially eligible ground active below sea", () => {
    const input = profile([-1, -2, -3], [1, 2, -1], [1, 1, 0]);
    input.initialElevation[1] = 5;
    const output = run(input);
    expect(output.elevation).toEqual([-1, -2.5, -3]);
    expect(output.incisionDepth).toEqual([0, 0.5, 0]);
    expect(input.initialElevation).toEqual(Int16Array.of(-1, 5, -3));
  });

  it("is deterministic, preserves every input and keeps full Number fractions", () => {
    const input = profile([100 + 2 ** -30, 100, 0], [1, 2, -1], [1, 1, 0]);
    const before = structuredClone(input), first = run(input), second = run(input);
    expect(first).toEqual(second);
    expect(first.elevation[0]).not.toBe(Math.fround(first.elevation[0]!));
    expect(first.elevation).not.toBe(input.elevation);
    expect(input).toEqual(before);
  });

  it("depends on local discharge rather than a maximum elsewhere in the map", () => {
    const input = profile([300, 200, 100], [1, 2, -1], [1, 1, 0]);
    const first = run(input);
    input.dryDischarge[0] = 10000;
    expect(run(input).elevation[1]).toBe(first.elevation[1]);
  });

  it("accepts actual certified fractional evidence and leaves the next solve conservative", () => {
    const { computeDrainageBasins: geometry, computeBasinNetwork: network } = hydrology.hydrography.ops;
    const terrain = { width: 7, height: 1, elevation: [-100, 5.25, 1.125, 3.375, 0.125, 8.5, -50], externalWaterMask: new Uint8Array([1, 0, 0, 0, 0, 0, 1]), externalWaterHead: 0 };
    const forcing = { localRunoff: [0, 1, 1, 1, 1, 1, 0], rainfall: new Uint8Array(7).fill(10), potentialDemand: new Float32Array(7).fill(1) };
    const solve = (elevation: number[]) => {
      const surface = { ...terrain, elevation };
      return network.run({ ...surface, ...forcing, geometry: geometry.run(surface, geometry.defaultConfig) }, network.defaultConfig);
    };
    const first = solve(terrain.elevation);
    if (first.status !== "supported") throw new Error(JSON.stringify(first));
    const output = run({
      width: terrain.width, height: terrain.height, elevation: terrain.elevation,
      initialElevation: Int16Array.from(terrain.elevation),
      originalLandMask: Uint8Array.from(terrain.externalWaterMask, value => value ? 0 : 1),
      externalWaterMask: terrain.externalWaterMask,
      exposedLandMask: first.plan.exposedLandMask, wetMask: first.plan.wetMask,
      receiver: first.plan.receiver, dryDischarge: first.plan.dryDischarge,
      waterSurface: first.plan.waterSurface, seaLevel: terrain.externalWaterHead,
      erodibilityK: new Float32Array(7).fill(1),
    });
    expect(output.incisionDepth[1]!).toBeGreaterThan(0);
    for (const cell of [0, 2, 3, 4, 6]) expect(output.elevation[cell]).toBe(terrain.elevation[cell]);
    const next = solve(output.elevation);
    if (next.status !== "supported") throw new Error(JSON.stringify(next));
    expect(Math.abs(next.plan.conservation.residual)).toBeLessThanOrEqual(next.plan.conservation.roundoffBound);
  });

  it("refuses nonfinite evidence, malformed masks, cycles, uphill and nonadjacent supplied receivers", () => {
    const input = profile([100, 100, 0], [1, 2, -1], [1, 1, 0]);
    for (const invalid of [NaN, Infinity, -Infinity]) {
      for (const field of ["elevation", "dryDischarge", "waterSurface", "erodibilityK"] as const) {
        const malformed = structuredClone(input);
        malformed[field][0] = invalid;
        expect(() => run(malformed)).toThrow();
      }
    }
    const cycle = structuredClone(input); cycle.receiver[1] = 0;
    expect(() => run(cycle)).toThrow(/cyclic supplied dry receivers/);
    const uphill = profile([10, 100, 0], [1, 2, -1], [1, 1, 0]);
    expect(() => run(uphill)).toThrow(/ascending certified receiver/);
    const nonadjacent = structuredClone(input); nonadjacent.receiver[0] = 2;
    expect(() => run(nonadjacent)).toThrow(/adjacent receiver/);
    const mask = structuredClone(input); mask.originalLandMask[0] = 2;
    expect(() => run(mask)).toThrow(/binary originalLandMask/);
    // @ts-expect-error Only the reviewed analytic n=1 law is admitted.
    expect(() => run(input, { rate: 1, m: 0.5, n: 2 })).toThrow();
  });
});
