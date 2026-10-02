import { describe, expect, it } from "bun:test";
import type { Static } from "@swooper/mapgen-core/authoring";
import { runAdmittedOperationForTest } from "@swooper/mapgen-core/testing";
import morphology from "../../../../../../src/domain/morphology/router.js";
import hydrology from "../../../../../../src/domain/hydrology/router.js";

const operation = morphology.erosion.ops.computeChannelTopography;
type Fixture = Static<typeof operation.input>;
const run = (input: Fixture) => runAdmittedOperationForTest(operation, input, operation.defaultConfig);

function profile(elevation: number[], seaLevel = 0): Fixture {
  return {
    width: 1, height: elevation.length, elevation: elevation.slice(),
    initialElevation: Int16Array.from(elevation),
    originalLandMask: Uint8Array.from(elevation, value => value > seaLevel ? 1 : 0),
    externalWaterMask: new Uint8Array(elevation.length), seaLevel,
    bathymetry: Int16Array.from(elevation, value => value > seaLevel ? 0 : Math.min(0, value - seaLevel)),
  };
}

describe("morphology/compute-channel-topography", () => {
  it("registers a control-free publication operation using the five field atoms", () => {
    expect(operation.id).toBe("morphology/compute-channel-topography");
    expect(operation.defaultStrategy).toBe("original-identity");
    expect(operation.defaultConfig.config).toEqual({});
    expect(Object.keys(operation.output.properties.topography.properties)).toEqual([
      "elevation", "seaLevel", "landMask", "externalWaterMask", "bathymetry",
    ]);
  });

  it("preserves zero-change integer input and every identity field with copied buffers", () => {
    const input = profile([300, 5, 0, -500]);
    input.originalLandMask[2] = 1;
    input.externalWaterMask[3] = 1;
    const before = structuredClone(input), first = run(input), second = run(input);
    expect(first).toEqual(second);
    expect(input).toEqual(before);
    expect(first.topography.elevation).toEqual(input.initialElevation);
    expect(first.topography.landMask).toEqual(input.originalLandMask);
    expect(first.topography.externalWaterMask).toEqual(input.externalWaterMask);
    expect(first.topography.bathymetry).toEqual(input.bathymetry);
    expect(first.topography.seaLevel).toBe(input.seaLevel);
    expect(first.roundingDelta).toEqual([0, 0, 0, 0]);
    expect(first.clampDelta).toEqual([0, 0, 0, 0]);
    expect(first.topography.elevation.buffer).not.toBe(input.initialElevation.buffer);
    expect(first.topography.landMask.buffer).not.toBe(input.originalLandMask.buffer);
    expect(first.topography.externalWaterMask.buffer).not.toBe(input.externalWaterMask.buffer);
    expect(first.topography.bathymetry.buffer).not.toBe(input.bathymetry.buffer);
  });

  it("applies Math.round ties once and accounts independently for bounds and the eligible land floor", () => {
    const input = profile([10, 10, 10, 10], -10.25);
    input.elevation = [2.5, -1.5, -10.6, 40000.25];
    const output = run(input);
    expect(output.topography.elevation).toEqual(new Int16Array([3, -1, -10, 32767]));
    expect(output.roundingDelta).toEqual([0.5, 0.5, -0.40000000000000036, -0.25]);
    expect(output.clampDelta).toEqual([0, 0, 1, -7233]);
    for (let i = 0; i < input.elevation.length; i++) {
      expect(input.elevation[i]! + output.roundingDelta[i]! + output.clampDelta[i]!).toBe(output.topography.elevation[i]!);
    }
    const low = profile([0], -32768.5); low.elevation = [-40000.5];
    const bounded = run(low);
    expect(bounded.topography.elevation[0]).toBe(-32768);
    expect(bounded.roundingDelta).toEqual([0.5]);
    expect(bounded.clampDelta).toEqual([7232]);
  });

  it("keeps every representable integer exact, including submerged original-land identity", () => {
    const values = Array.from({ length: 65536 }, (_, index) => index - 32768);
    const input = profile(values);
    input.originalLandMask.fill(1);
    const output = run(input);
    expect(output.topography.elevation).toEqual(input.initialElevation);
    expect(output.topography.landMask).toEqual(input.originalLandMask);
    expect(output.topography.bathymetry).toEqual(input.bathymetry);
    expect(output.roundingDelta.every(value => value === 0)).toBe(true);
    expect(output.clampDelta.every(value => value === 0)).toBe(true);
  });

  it("preserves submerged original land and initial water exactly rather than clamping either upward", () => {
    const input = profile([-20, -200, 20], 5);
    input.originalLandMask[0] = 1;
    input.externalWaterMask[1] = 1;
    expect(run(input).topography.elevation).toEqual(input.initialElevation);
    for (const cell of [0, 1]) {
      const changed = structuredClone(input); changed.elevation[cell]! += 0.125;
      expect(() => run(changed)).toThrow(/initially submerged or non-original-land ground changed/);
    }
    const nonOriginal = profile([20], 5); nonOriginal.originalLandMask[0] = 0;
    expect(run(nonOriginal).topography.elevation[0]).toBe(20);
    nonOriginal.elevation[0] = 19;
    expect(() => run(nonOriginal)).toThrow(/non-original-land ground changed/);
  });

  it("refuses an unrepresentable eligible land floor but admits unchanged all-water ground at a high datum", () => {
    const low = profile([0], -32770);
    expect(() => run(low)).toThrow(/floor is not representable/);
    const high = profile([-10], 40000);
    high.bathymetry[0] = -32768;
    expect(run(high).topography.elevation).toEqual(high.initialElevation);
    expect(run(high).clampDelta).toEqual([0]);
  });

  it("refuses nonfinite heights, sea, malformed cardinality, and changed or invalid identity", () => {
    for (const invalid of [NaN, Infinity, -Infinity]) {
      const ground = profile([10]); ground.elevation[0] = invalid;
      expect(() => run(ground)).toThrow();
      const sea = profile([10]); sea.seaLevel = invalid;
      expect(() => run(sea)).toThrow();
    }
    const cardinality = profile([10, 20]); cardinality.bathymetry = new Int16Array(1);
    expect(() => run(cardinality)).toThrow();
    const mask = profile([10]); mask.originalLandMask[0] = 2;
    expect(() => run(mask)).toThrow();
    const external = profile([10]); external.externalWaterMask[0] = 1;
    expect(() => run(external)).toThrow();
  });

  it("feeds the certified geometry owner sealed integers, not the precise pre-publication surface", () => {
    const input = profile([-100, 5, 1, 3, 0, 8, -50]);
    input.width = 7; input.height = 1;
    input.originalLandMask.fill(1); input.originalLandMask[0] = 0; input.originalLandMask[6] = 0;
    input.externalWaterMask[0] = 1; input.externalWaterMask[6] = 1;
    input.elevation[1] = 4.6; input.elevation[2] = 1.125; input.elevation[3] = 2.6;
    const output = run(input), geometry = hydrology.hydrography.ops.computeDrainageBasins;
    const certified = geometry.run({
      width: input.width, height: input.height, elevation: Array.from(output.topography.elevation),
      externalWaterMask: output.topography.externalWaterMask, externalWaterHead: output.topography.seaLevel,
    }, geometry.defaultConfig);
    expect(certified.rawReceiver.length).toBe(input.elevation.length);
    expect(certified.hypsometry.every(bin => Number.isInteger(bin.elevation))).toBe(true);
    expect(output.topography.elevation).toEqual(new Int16Array([-100, 5, 1, 3, 0, 8, -50]));
    expect(output.roundingDelta[2]).toBe(-0.125);
  });
});
