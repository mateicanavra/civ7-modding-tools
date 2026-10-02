import { describe, expect, it } from "bun:test";
import type { Static } from "@swooper/mapgen-core/authoring";
import { runAdmittedOperationForTest } from "@swooper/mapgen-core/testing";
import morphology from "../../../../../../src/domain/morphology/router.js";

const operation = morphology.erosion.ops.computeGeomorphicCycle;
type Fixture = Static<typeof operation.input>;
const selection = {
  strategy: "hillslope-diffusion",
  config: { geomorphology: { diffusion: { rate: 0.3 }, eras: 1 }, worldAge: "mature" },
} as const;
const run = (input: Fixture) => runAdmittedOperationForTest(operation, input, selection);

function profile(): Fixture {
  return {
    width: 3, height: 1, elevation: new Int16Array([0, 300, 0]), seaLevel: -1,
    landMask: new Uint8Array([1, 1, 1]), flowDir: new Int32Array([1, 2, -1]),
    flowAccum: new Float32Array([1, 2, 3]), erodibilityK: new Float32Array([0.1, 0.2, 0.3]),
    sedimentDepth: new Float32Array([-0, 5.125, 2.5]),
  };
}

describe("compute-geomorphic-cycle hillslope-diffusion", () => {
  it("registers an independent hillslope strategy without changing the existing default", () => {
    expect(operation.defaultStrategy).toBe("stream-power-diffusion");
    expect(operation.strategies["hillslope-diffusion"]).toBeDefined();
    expect(run(profile()).topography.elevation).toEqual(new Int16Array([30, 240, 30]));
  });

  it("uses synchronous local diffusion, world age, and compounded eras", () => {
    const input = profile();
    expect(run(input).deltas.elevationDelta).toEqual(new Float32Array([30, -60, 30]));
    const twice = runAdmittedOperationForTest(operation, input, {
      ...selection, config: { ...selection.config, geomorphology: { ...selection.config.geomorphology, eras: 2 } },
    });
    expect(twice.deltas.elevationDelta).toEqual(new Float32Array([51, -102, 51]));
    expect(twice.topography.elevation).toEqual(new Int16Array([51, 198, 51]));
    const old = runAdmittedOperationForTest(operation, input, {
      ...selection, config: { ...selection.config, worldAge: "old" },
    });
    expect(old.deltas.elevationDelta).toEqual(new Float32Array([39, -78, 39]));
  });

  it("does not consume routing or accumulation, or change substrate and sediment", () => {
    const input = profile(), alternate = structuredClone(input);
    alternate.flowDir.fill(-1);
    alternate.flowAccum.fill(100000);
    const output = run(input);
    expect(run(alternate)).toEqual(output);
    expect(output.substrate.erodibilityK).toEqual(input.erodibilityK);
    expect(output.substrate.sedimentDepth).toEqual(input.sedimentDepth);
    expect(Object.is(output.substrate.sedimentDepth[0], -0)).toBe(true);
    expect(output.deltas.sedimentDelta).toEqual(new Float32Array(3));
    expect(output.substrate.erodibilityK.buffer).not.toBe(input.erodibilityK.buffer);
    expect(output.substrate.sedimentDepth.buffer).not.toBe(input.sedimentDepth.buffer);
  });

  it("uses the existing identity and bathymetry publication rather than exposing or filling water", () => {
    const input = profile();
    input.elevation = new Int16Array([1, -100, -10]);
    input.landMask = new Uint8Array([1, 0, 0]);
    input.seaLevel = 0.25;
    const output = run(input);
    expect(output.topography.elevation).toEqual(new Int16Array([1, -100, -10]));
    expect(output.topography.landMask).toEqual(input.landMask);
    expect(output.topography.bathymetry).toEqual(new Int16Array([0, -100, -10]));
    expect(output.topography.seaLevel).toBe(0.25);
    expect(output.deltas.elevationDelta[0]).toBeCloseTo(-11.2, 5);
  });

  it("preserves a zero-rate integer surface and is immutable and deterministic", () => {
    const input = profile(), before = structuredClone(input);
    const first = run(input), second = run(input);
    expect(input).toEqual(before);
    expect(first).toEqual(second);
    expect(first.topography.elevation.buffer).not.toBe(input.elevation.buffer);
    expect(first.topography.landMask.buffer).not.toBe(input.landMask.buffer);
    const unchanged = runAdmittedOperationForTest(operation, input, {
      ...selection,
      config: { ...selection.config, geomorphology: { diffusion: { rate: 0 }, eras: 3 } },
    });
    expect(unchanged.topography.elevation).toEqual(input.elevation);
    expect(unchanged.deltas.elevationDelta).toEqual(new Float32Array(3));
    expect(unchanged.substrate.sedimentDepth).toEqual(input.sedimentDepth);
  });

  it("refuses nonfinite controls, malformed cardinality, invalid identity, and material values", () => {
    const input = profile();
    for (const invalid of [NaN, Infinity, -Infinity]) {
      const sea = structuredClone(input); sea.seaLevel = invalid;
      expect(() => run(sea)).toThrow();
      for (const field of ["erodibilityK", "sedimentDepth"] as const) {
        const material = structuredClone(input); material[field][0] = invalid;
        expect(() => run(material)).toThrow();
      }
    }
    const malformed = structuredClone(input); malformed.sedimentDepth = new Float32Array(2);
    expect(() => run(malformed)).toThrow();
    const identity = structuredClone(input); identity.landMask[0] = 2;
    expect(() => run(identity)).toThrow();
    const negative = structuredClone(input); negative.sedimentDepth[1] = -1;
    expect(() => run(negative)).toThrow();
    expect(() => runAdmittedOperationForTest(operation, input, {
      ...selection,
      config: { ...selection.config, geomorphology: { diffusion: { rate: NaN }, eras: 1 } },
    })).toThrow();
  });
});
