import { describe, expect, it } from "bun:test";

import morphology from "../../../../../../src/domain/morphology/router.js";
import { runAdmittedOperationForTest } from "@swooper/mapgen-core/testing";
import { TEST_MAP_SIZE } from "../../../../../setup.js";

const { computeGeomorphicCycle } = morphology.erosion.ops;

describe("compute-geomorphic-cycle surface coherence", () => {
  it("returns a deterministic nonaliasing product while preserving admitted land-water identity", () => {
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const size = width * height;
    const elevation = new Int16Array(size).fill(-5);
    const landMask = new Uint8Array(size);
    const erodibilityK = new Float32Array(size);
    const sedimentDepth = new Float32Array(size);

    elevation[0] = 1;
    elevation[1] = -100;
    landMask[0] = 1;
    erodibilityK[0] = 1;
    sedimentDepth[0] = 0.2;

    const input = {
      width,
      height,
      elevation,
      seaLevel: 0,
      landMask,
      erodibilityK,
      sedimentDepth,
    };
    const inputSnapshots = {
      elevation: elevation.slice(),
      landMask: landMask.slice(),
      erodibilityK: erodibilityK.slice(),
      sedimentDepth: sedimentDepth.slice(),
    };
    const selection = {
      ...computeGeomorphicCycle.defaultConfig,
      config: {
        ...computeGeomorphicCycle.defaultConfig.config,
        worldAge: "old",
        geomorphology: {
          ...computeGeomorphicCycle.defaultConfig.config.geomorphology,
          diffusion: {
            ...computeGeomorphicCycle.defaultConfig.config.geomorphology.diffusion,
            rate: 1,
          },
          eras: 1,
        },
      },
    } as const;

    const first = runAdmittedOperationForTest(computeGeomorphicCycle, input, selection);
    const second = runAdmittedOperationForTest(computeGeomorphicCycle, input, selection);

    expect(elevation).toEqual(inputSnapshots.elevation);
    expect(landMask).toEqual(inputSnapshots.landMask);
    expect(erodibilityK).toEqual(inputSnapshots.erodibilityK);
    expect(sedimentDepth).toEqual(inputSnapshots.sedimentDepth);

    expect(first.topography.elevation).not.toBe(elevation);
    expect(first.topography.landMask).not.toBe(landMask);
    expect(first.substrate.erodibilityK).not.toBe(erodibilityK);
    expect(first.substrate.sedimentDepth).not.toBe(sedimentDepth);
    expect(first.topography.landMask).toEqual(landMask);
    expect(first.topography.seaLevel).toBe(0);
    expect(first.topography.elevation[0]).toBe(1);
    expect(first.substrate.sedimentDepth.every((value) => value >= 0)).toBe(true);
    expect(first.substrate.erodibilityK).toEqual(erodibilityK);
    expect(
      first.topography.elevation.every((value, index) =>
        landMask[index] === 1
          ? value > first.topography.seaLevel
          : value <= first.topography.seaLevel
      )
    ).toBe(true);
    expect(
      first.topography.bathymetry.every((value, index) =>
        landMask[index] === 1
          ? value === 0
          : value === first.topography.elevation[index] - first.topography.seaLevel
      )
    ).toBe(true);

    expect(first.topography.elevation).toEqual(second.topography.elevation);
    expect(first.topography.landMask).toEqual(second.topography.landMask);
    expect(first.topography.bathymetry).toEqual(second.topography.bathymetry);
    expect(first.substrate.erodibilityK).toEqual(second.substrate.erodibilityK);
    expect(first.substrate.sedimentDepth).toEqual(second.substrate.sedimentDepth);
    expect(first.deltas.elevationDelta).toEqual(second.deltas.elevationDelta);
    expect(first.substrate.sedimentDepth).toEqual(sedimentDepth);
    expect("sedimentDelta" in first.deltas).toBe(false);
  });
});
