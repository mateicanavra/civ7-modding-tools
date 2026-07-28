import { describe, expect, it } from "bun:test";
import ecology from "../../../../../../src/domain/ecology/router.js";
import {
  RIVER_CLASS_MAJOR,
  RIVER_CLASS_MINOR,
} from "../../../../../../src/domain/hydrology/modules/hydrography/model/policy/river-class.js";
import { normalizeOperationSelectionForTest } from "@swooper/mapgen-core/testing";
import { TEST_MAP_SIZE } from "../../../../../setup.js";

describe("ecology feature substrate", () => {
  it("separates minor river adjacency from projected navigable terrain", () => {
    const syntheticDimensions = { width: 3, height: 3 } as const;
    const { width, height } = syntheticDimensions;
    const size = width * height;
    const riverClass = new Uint8Array(size);
    const navigableRiverMask = new Uint8Array(size);
    riverClass[1] = RIVER_CLASS_MINOR;
    navigableRiverMask[4] = 1;

    const selection = normalizeOperationSelectionForTest(
      ecology.features.ops.computeFeatureSubstrate,
      ecology.features.ops.computeFeatureSubstrate.defaultConfig
    );
    const result = ecology.features.ops.computeFeatureSubstrate.run(
      {
        width,
        height,
        riverClass,
        navigableRiverMask,
        landMask: new Uint8Array(size).fill(1),
        elevation: new Int16Array(size).fill(40),
        seaLevel: 0,
        discharge: new Float32Array(size).fill(100),
        sinkMask: new Uint8Array(size),
      },
      selection
    );

    expect(result.navigableRiverMask[1]).toBe(0);
    expect(result.navigableRiverMask[4]).toBe(1);
    expect(result.nearRiverMask[1]).toBe(1);
  });

  it("withholds floodplain substrate below its discharge floor", () => {
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const size = width * height;
    const riverClass = new Uint8Array(size);
    riverClass[Math.floor(height / 2) * width + Math.floor(width / 2)] = RIVER_CLASS_MAJOR;

    const selection = normalizeOperationSelectionForTest(
      ecology.features.ops.computeFeatureSubstrate,
      {
        ...ecology.features.ops.computeFeatureSubstrate.defaultConfig,
        config: {
          ...ecology.features.ops.computeFeatureSubstrate.defaultConfig.config,
          lowlandMaxElevationAboveSeaM: 80,
          floodplainDischargeMin: 96,
        },
      }
    );
    const result = ecology.features.ops.computeFeatureSubstrate.run(
      {
        width,
        height,
        riverClass,
        navigableRiverMask: new Uint8Array(size),
        landMask: new Uint8Array(size).fill(1),
        elevation: new Int16Array(size).fill(24),
        seaLevel: 0,
        discharge: new Float32Array(size).fill(8),
        sinkMask: new Uint8Array(size),
      },
      selection
    );

    expect(result.floodplainMask).toEqual(new Uint8Array(size));
  });

  it("admits lowland high-discharge navigable major rivers as floodplain substrate", () => {
    const { width, height } = TEST_MAP_SIZE.dimensions;
    const size = width * height;
    const riverIndex = Math.floor(height / 2) * width + Math.floor(width / 2);
    const riverClass = new Uint8Array(size);
    const navigableRiverMask = new Uint8Array(size);
    const discharge = new Float32Array(size);
    riverClass[riverIndex] = RIVER_CLASS_MAJOR;
    navigableRiverMask[riverIndex] = 1;
    discharge[riverIndex] = 160;

    const selection = normalizeOperationSelectionForTest(
      ecology.features.ops.computeFeatureSubstrate,
      {
        ...ecology.features.ops.computeFeatureSubstrate.defaultConfig,
        config: {
          ...ecology.features.ops.computeFeatureSubstrate.defaultConfig.config,
          lowlandMaxElevationAboveSeaM: 80,
          floodplainDischargeMin: 96,
        },
      }
    );
    const result = ecology.features.ops.computeFeatureSubstrate.run(
      {
        width,
        height,
        riverClass,
        navigableRiverMask,
        landMask: new Uint8Array(size).fill(1),
        elevation: new Int16Array(size).fill(24),
        seaLevel: 0,
        discharge,
        sinkMask: new Uint8Array(size),
      },
      selection
    );

    expect(result.floodplainMask[riverIndex]).toBe(1);
  });
});
