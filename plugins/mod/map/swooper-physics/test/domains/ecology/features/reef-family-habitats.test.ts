import { describe, expect, it } from "bun:test";
import ecology from "../../../../src/domain/ecology/router.js";
import { normalizeOperationSelectionForTest } from "@swooper/mapgen-core/testing";
import { TEST_MAP_SIZE } from "../../../setup.js";

describe("ecology reef-family habitats", () => {
  it("partitions reefs by shelf, coast distance, temperature, depth, and lake state", () => {
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const size = width * height;
    const landMask = new Uint8Array(size);
    const warm = new Float32Array(size).fill(28);
    const cold = new Float32Array(size).fill(8);
    const shallow = new Int16Array(size).fill(-10);
    const coldReefDepth = new Int16Array(size).fill(-300);
    const shelfMask = new Uint8Array(size);
    shelfMask[0] = 1;
    shelfMask[2] = 1;
    shelfMask[3] = 1;
    const openOceanMask = new Uint8Array(size);
    openOceanMask[1] = 1;
    const lakeMask = new Uint8Array(size);
    lakeMask[0] = 1;
    const coastalWater = new Uint8Array(size);
    coastalWater[0] = 1;
    coastalWater[2] = 1;
    coastalWater[3] = 1;
    const distanceToCoast = new Uint16Array(size).fill(5);
    distanceToCoast[0] = 1;
    distanceToCoast[2] = 1;
    distanceToCoast[3] = 1;

    const reef = ecology.features.ops.scoreReef.run(
      {
        width,
        height,
        landMask,
        surfaceTemperature: warm,
        bathymetry: shallow,
        shelfMask,
        coastalWater,
        distanceToCoast,
      },
      normalizeOperationSelectionForTest(
        ecology.features.ops.scoreReef,
        ecology.features.ops.scoreReef.defaultConfig
      )
    ).score01;
    const atoll = ecology.features.ops.scoreReefAtoll.run(
      {
        width,
        height,
        landMask,
        surfaceTemperature: warm,
        bathymetry: shallow,
        shelfMask,
        openOceanMask,
        coastalWater,
        distanceToCoast,
      },
      normalizeOperationSelectionForTest(
        ecology.features.ops.scoreReefAtoll,
        ecology.features.ops.scoreReefAtoll.defaultConfig
      )
    ).score01;
    const lotus = ecology.features.ops.scoreReefLotus.run(
      {
        width,
        height,
        landMask,
        surfaceTemperature: warm,
        bathymetry: shallow,
        lakeMask,
        shelfMask,
        coastalWater,
        distanceToCoast,
      },
      normalizeOperationSelectionForTest(
        ecology.features.ops.scoreReefLotus,
        ecology.features.ops.scoreReefLotus.defaultConfig
      )
    ).score01;
    const coldReef = ecology.features.ops.scoreColdReef.run(
      {
        width,
        height,
        landMask,
        surfaceTemperature: cold,
        bathymetry: coldReefDepth,
        shelfMask,
        coastalWater,
        distanceToCoast,
      },
      normalizeOperationSelectionForTest(ecology.features.ops.scoreColdReef, {
        ...ecology.features.ops.scoreColdReef.defaultConfig,
        config: {
          ...ecology.features.ops.scoreColdReef.defaultConfig.config,
          minDepthM: 120,
          peakDepthM: 300,
          maxDepthM: 520,
        },
      })
    ).score01;
    const abyssalColdReef = ecology.features.ops.scoreColdReef.run(
      {
        width,
        height,
        landMask,
        surfaceTemperature: cold,
        bathymetry: new Int16Array(size).fill(-2000),
        shelfMask,
        coastalWater,
        distanceToCoast,
      },
      normalizeOperationSelectionForTest(
        ecology.features.ops.scoreColdReef,
        ecology.features.ops.scoreColdReef.defaultConfig
      )
    ).score01;

    expect(reef[0]).toBeGreaterThan(0.5);
    expect(reef[1]).toBe(0);
    expect(atoll[0]).toBe(0);
    expect(atoll[1]).toBeGreaterThan(0.5);
    expect(lotus[0]).toBeGreaterThan(0.5);
    expect(lotus[1]).toBe(0);
    expect(coldReef[0]).toBeGreaterThan(0.5);
    expect(abyssalColdReef[0]).toBe(0);
  });
});
