import { describe, expect, it } from "bun:test";
import ecology from "@mapgen/domain/ecology/ops";
import {
  RIVER_CLASS_MAJOR,
  RIVER_CLASS_MINOR,
} from "@mapgen/domain/hydrology/model/policy/river-class.js";
import { normalizeOperationSelectionForTest } from "@swooper/mapgen-core/testing";

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
      ecology.ops.computeFeatureSubstrate,
      ecology.ops.computeFeatureSubstrate.defaultConfig
    );
    const result = ecology.ops.computeFeatureSubstrate.run(
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
    const syntheticDimensions = { width: 5, height: 3 } as const;
    const { width, height } = syntheticDimensions;
    const size = width * height;
    const riverClass = new Uint8Array(size);
    riverClass[7] = RIVER_CLASS_MAJOR;

    const selection = normalizeOperationSelectionForTest(ecology.ops.computeFeatureSubstrate, {
      ...ecology.ops.computeFeatureSubstrate.defaultConfig,
      config: {
        ...ecology.ops.computeFeatureSubstrate.defaultConfig.config,
        lowlandMaxElevationAboveSeaM: 80,
        floodplainDischargeMin: 96,
      },
    });
    const result = ecology.ops.computeFeatureSubstrate.run(
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
});
