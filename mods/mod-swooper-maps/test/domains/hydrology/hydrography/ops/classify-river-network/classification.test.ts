import { describe, expect, it } from "bun:test";
import {
  RIVER_CLASS_MAJOR,
  RIVER_CLASS_MINOR,
} from "@mapgen/domain/hydrology/modules/hydrography/model/policy/river-class.js";
import {
  HYDROLOGY_FLOW_DRY,
  HYDROLOGY_FLOW_EPHEMERAL,
  HYDROLOGY_FLOW_INTERMITTENT,
  HYDROLOGY_FLOW_PERENNIAL,
  HYDROLOGY_MOUTH_ACCEPTED_LAKE,
  HYDROLOGY_MOUTH_CLOSED_BASIN,
  HYDROLOGY_MOUTH_OCEAN,
  HYDROLOGY_MOUTH_SPILL_PATH,
  HYDROLOGY_SLOPE_FLAT,
} from "@mapgen/domain/hydrology/modules/hydrography/model/policy/river-network-classification.js";
import hydrology from "@mapgen/domain/hydrology/router";
import { runAdmittedOperationForTest } from "@swooper/mapgen-core/testing";

const { classifyRiverNetwork } = hydrology.hydrography.ops;
const selection = {
  ...classifyRiverNetwork.defaultConfig,
  config: { ...classifyRiverNetwork.defaultConfig.config },
};

describe("hydrology river-network classification", () => {
  it("derives upstream area, stream hierarchy, and accepted-lake mouths", () => {
    const syntheticDimensions = { width: 3, height: 2 } as const;
    const { width, height } = syntheticDimensions;
    const size = width * height;
    const lakeMask = new Uint8Array(size);
    lakeMask[5] = 1;

    const result = runAdmittedOperationForTest(
      classifyRiverNetwork,
      {
        width,
        height,
        landMask: new Uint8Array(size).fill(1),
        elevation: new Int16Array([12, 11, 10, 12, 11, 9]),
        routingElevation: new Float32Array([12, 11, 10, 12, 11, 9]),
        depressionDepth: new Float32Array(size),
        discharge: new Float32Array([2, 4, 3, 2, 4, 15]),
        riverClass: new Uint8Array([
          0,
          RIVER_CLASS_MINOR,
          RIVER_CLASS_MINOR,
          0,
          RIVER_CLASS_MINOR,
          RIVER_CLASS_MAJOR,
        ]),
        flowDir: new Int32Array([1, 5, 5, 4, 5, -1]),
        terminalType: new Uint8Array(size),
        lakeMask,
      },
      selection
    );

    expect(Array.from(result.upstreamArea)).toEqual([1, 2, 1, 1, 2, 6]);
    expect(Array.from(result.streamOrderProxy)).toEqual([0, 1, 1, 0, 1, 2]);
    expect(Array.from(result.mouthType)).toEqual(
      new Array(size).fill(HYDROLOGY_MOUTH_ACCEPTED_LAKE)
    );
    expect(result.slopeClass[5]).toBe(HYDROLOGY_SLOPE_FLAT);
    expect(Array.from(result.flowPermanenceProxy)).toEqual([
      HYDROLOGY_FLOW_DRY,
      HYDROLOGY_FLOW_EPHEMERAL,
      HYDROLOGY_FLOW_INTERMITTENT,
      HYDROLOGY_FLOW_DRY,
      HYDROLOGY_FLOW_EPHEMERAL,
      HYDROLOGY_FLOW_INTERMITTENT,
    ]);
  });

  it("propagates a closed-basin terminal through the drainage network", () => {
    const syntheticDimensions = { width: 5, height: 1 } as const;
    const { width, height } = syntheticDimensions;
    const size = width * height;
    const terminalType = new Uint8Array(size);
    terminalType[4] = 2;

    const result = runAdmittedOperationForTest(
      classifyRiverNetwork,
      {
        width,
        height,
        landMask: new Uint8Array(size).fill(1),
        elevation: new Int16Array([20, 16, 12, 8, 4]),
        routingElevation: new Float32Array([20, 16, 12, 8, 4]),
        depressionDepth: new Float32Array(size),
        discharge: new Float32Array([3, 6, 9, 12, 15]),
        riverClass: new Uint8Array([
          0,
          RIVER_CLASS_MINOR,
          RIVER_CLASS_MINOR,
          RIVER_CLASS_MAJOR,
          RIVER_CLASS_MAJOR,
        ]),
        flowDir: new Int32Array([1, 2, 3, 4, -1]),
        terminalType,
        lakeMask: new Uint8Array(size),
      },
      selection
    );

    expect(Array.from(result.mouthType)).toEqual(
      new Array(size).fill(HYDROLOGY_MOUTH_CLOSED_BASIN)
    );
    expect(result.upstreamArea[4]).toBe(5);
  });

  it("keeps wet headwater channels first-order before a major perennial trunk", () => {
    const syntheticDimensions = { width: 7, height: 3 } as const;
    const { width, height } = syntheticDimensions;
    const size = width * height;
    const outletWater = 20;
    const trunkA = 13;
    const trunkB = 19;
    const landMask = new Uint8Array(size).fill(1);
    landMask[outletWater] = 0;
    const discharge = new Float32Array(size);
    const riverClass = new Uint8Array(size);
    const flowDir = new Int32Array(size).fill(-1);
    const terminalType = new Uint8Array(size);
    terminalType[trunkB] = 1;

    for (const index of [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 16, 17, 18]) {
      riverClass[index] = RIVER_CLASS_MINOR;
      discharge[index] = 5;
    }
    for (const index of [trunkA, trunkB]) riverClass[index] = RIVER_CLASS_MAJOR;
    discharge[trunkA] = 65;
    discharge[trunkB] = 100;
    flowDir.set([
      1,
      2,
      3,
      10,
      11,
      12,
      12,
      8,
      9,
      10,
      11,
      12,
      trunkA,
      trunkB,
      15,
      16,
      17,
      18,
      trunkB,
      outletWater,
      -1,
    ]);

    const result = runAdmittedOperationForTest(
      classifyRiverNetwork,
      {
        width,
        height,
        landMask,
        elevation: new Int16Array([
          30, 28, 26, 24, 26, 28, 30, 28, 26, 24, 22, 20, 18, 12, 30, 28, 26, 24, 20, 10, 0,
        ]),
        routingElevation: new Float32Array([
          30, 28, 26, 24, 26, 28, 30, 28, 26, 24, 22, 20, 18, 12, 30, 28, 26, 24, 20, 10, 0,
        ]),
        depressionDepth: new Float32Array(size),
        discharge,
        riverClass,
        flowDir,
        terminalType,
        lakeMask: new Uint8Array(size),
      },
      selection
    );

    expect(result.upstreamArea[trunkB]).toBe(20);
    expect(result.streamOrderProxy[0]).toBe(1);
    expect(result.streamOrderProxy[trunkB]).toBe(2);
    expect(result.flowPermanenceProxy[trunkB]).toBe(HYDROLOGY_FLOW_PERENNIAL);
  });

  it("distinguishes spill-routed paths from direct ocean mouths", () => {
    const syntheticDimensions = { width: 6, height: 1 } as const;
    const { width, height } = syntheticDimensions;

    const result = runAdmittedOperationForTest(
      classifyRiverNetwork,
      {
        width,
        height,
        landMask: new Uint8Array([1, 1, 1, 1, 1, 0]),
        elevation: new Int16Array([18, 16, 14, 12, 10, 0]),
        routingElevation: new Float32Array([18, 16, 16, 12, 10, 0]),
        depressionDepth: new Float32Array([0, 0, 2, 0, 0, 0]),
        discharge: new Float32Array([3, 6, 9, 12, 30, 0]),
        riverClass: new Uint8Array([
          0,
          RIVER_CLASS_MINOR,
          RIVER_CLASS_MINOR,
          RIVER_CLASS_MAJOR,
          RIVER_CLASS_MAJOR + 1,
          0,
        ]),
        flowDir: new Int32Array([1, 2, 3, 4, 5, -1]),
        terminalType: new Uint8Array([0, 0, 0, 0, 1, 0]),
        lakeMask: new Uint8Array(6),
      },
      selection
    );

    expect(Array.from(result.mouthType)).toEqual([
      HYDROLOGY_MOUTH_SPILL_PATH,
      HYDROLOGY_MOUTH_SPILL_PATH,
      HYDROLOGY_MOUTH_SPILL_PATH,
      HYDROLOGY_MOUTH_OCEAN,
      HYDROLOGY_MOUTH_OCEAN,
      0,
    ]);
    expect(result.flowPermanenceProxy[3]).toBe(HYDROLOGY_FLOW_INTERMITTENT);
    expect(result.flowPermanenceProxy[4]).toBe(HYDROLOGY_FLOW_PERENNIAL);
  });
});
