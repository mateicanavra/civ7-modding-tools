import { describe, expect, it } from "bun:test";
import { normalizeOperationSelectionForTest } from "@swooper/mapgen-core/testing";
import hydrology from "../../../../../../src/domain/hydrology/router.js";

const op = hydrology.climate.ops.computeSeasonalSampling;
const input = {
  width: 4, height: 5, topLatitude: 90, bottomLatitude: -90,
  modeCount: 4 as const, axialTiltDeg: 23.44, rngSeed: 1018,
};
const periodic = (phaseCount: 12 | 24 | 48 | 96 = 24) => ({
  strategy: "periodic-cycle" as const, config: { phaseCount },
});

describe("hydrology/compute-seasonal-sampling", () => {
  it("defaults to periodic integration and refuses the retired selector", () => {
    expect(op.defaultConfig).toEqual(periodic());
    expect(op.run(input, op.defaultConfig).model).toBe("periodic-cycle");
    expect(() => normalizeOperationSelectionForTest(op, {
      strategy: "legacy-snapshots", config: {},
    })).toThrow();
  });

  it("keeps periodic exact poles, endpoint integration and observation subsets independent", () => {
    for (const phaseCount of [12, 24, 48, 96] as const) {
      const four = op.run(input, periodic(phaseCount));
      const two = op.run({ ...input, modeCount: 2 }, periodic(phaseCount));
      expect(four.latitudeByRow[0]).toBe(90);
      expect(four.latitudeByRow.at(-1)).toBe(-90);
      expect(four.phases).toEqual(Array.from({ length: phaseCount }, (_, i) => i / phaseCount));
      expect(four.weights.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 13);
      expect(four.observationIndices).toEqual([0, phaseCount / 4, phaseCount / 2, 3 * phaseCount / 4]);
      expect(two.observationIndices).toEqual([phaseCount / 4, 3 * phaseCount / 4]);
      expect(two.phases).toEqual(four.phases);
      expect(two.weights).toEqual(four.weights);
      expect(two.frames).toEqual(four.frames);
      expect(two.latitudeByRow).toEqual(four.latitudeByRow);
    }
    expect(op.run({ ...input, height: 1, topLatitude: 80, bottomLatitude: 40 }, periodic()).latitudeByRow).toEqual(new Float32Array([60]));
  });

  it("uses rational phase identity rather than sample index for weather across resolutions", () => {
    const dense = op.run(input, periodic(96));
    for (const n of [12, 24, 48] as const) {
      const sparse = op.run(input, periodic(n));
      for (const frame of sparse.frames) {
        expect(frame).toEqual(dense.frames[Math.round(frame.phase * 96)]);
      }
    }
    expect(op.run(input, periodic()).frames).not.toEqual(op.run({ ...input, rngSeed: input.rngSeed + 256 }, periodic()).frames);
    const zero = op.run({ ...input, axialTiltDeg: 0 }, periodic());
    expect(zero.frames.every((frame) => frame.transientSalt === 0)).toBeTrue();
    for (const frame of zero.frames) expect(frame.thermalLatitude).toEqual(zero.frames[0]!.thermalLatitude);
  });

  it("refuses malformed dimensions, angles, mode, seeds and unsupported resolutions", () => {
    for (const bad of [
      { width: 0 }, { height: 1.5 }, { topLatitude: NaN }, { bottomLatitude: 91 },
      { axialTiltDeg: -1 }, { axialTiltDeg: Infinity }, { modeCount: 3 }, { rngSeed: -1 },
    ]) expect(() => op.run({ ...input, ...bad } as never, periodic())).toThrow();
    expect(() => op.run(input, { strategy: "periodic-cycle", config: { phaseCount: 20 } } as never)).toThrow();
    expect(op.run(input, periodic())).toEqual(op.run(input, periodic()));
  });
});
