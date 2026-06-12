import { describe, expect, it } from "bun:test";

import {
  HYDROLOGY_FLOW_DRY,
  HYDROLOGY_FLOW_EPHEMERAL,
  HYDROLOGY_FLOW_INTERMITTENT,
  HYDROLOGY_FLOW_PERENNIAL,
  HYDROLOGY_MOUTH_ACCEPTED_LAKE,
  HYDROLOGY_MOUTH_OCEAN,
  HYDROLOGY_MOUTH_SPILL_PATH,
  HYDROLOGY_SLOPE_FLAT,
  RIVER_CLASS_MAJOR,
  RIVER_CLASS_MINOR,
} from "../../src/domain/hydrology/index.js";
import computeRiverNetworkMetrics from "../../src/domain/hydrology/ops/compute-river-network-metrics/index.js";
import { runOpValidated } from "../support/compiler-helpers.js";

describe("hydrology/compute-river-network-metrics", () => {
  it("derives upstream area, stream hierarchy, and accepted-lake mouths", () => {
    const width = 3;
    const height = 2;
    const size = width * height;
    const landMask = new Uint8Array(size).fill(1);
    const elevation = new Int16Array([12, 11, 10, 12, 11, 9]);
    const routingElevation = new Float32Array(elevation);
    const depressionDepth = new Float32Array(size);
    const runoff = new Float32Array([2, 2, 2, 2, 2, 2]);
    const discharge = new Float32Array([2, 4, 3, 2, 4, 15]);
    const riverClass = new Uint8Array([0, RIVER_CLASS_MINOR, RIVER_CLASS_MINOR, 0, RIVER_CLASS_MINOR, RIVER_CLASS_MAJOR]);
    const flowDir = new Int32Array([1, 5, 5, 4, 5, -1]);
    const basinId = new Int32Array(size).fill(5);
    const terminalType = new Uint8Array(size);
    const lakeMask = new Uint8Array(size);
    lakeMask[5] = 1;

    const result = runOpValidated(
      computeRiverNetworkMetrics,
      {
        width,
        height,
        landMask,
        elevation,
        routingElevation,
        depressionDepth,
        runoff,
        discharge,
        riverClass,
        flowDir,
        basinId,
        terminalType,
        lakeMask,
      },
      {
        strategy: "default",
        config: {},
      }
    );

    expect(Array.from(result.upstreamArea)).toEqual([1, 2, 1, 1, 2, 6]);
    expect(Array.from(result.streamOrderProxy)).toEqual([0, 1, 1, 0, 1, 2]);
    for (let i = 0; i < size; i++) {
      expect(result.mouthType[i]).toBe(HYDROLOGY_MOUTH_ACCEPTED_LAKE);
    }
    expect(result.slopeClass[1]).toBeGreaterThanOrEqual(HYDROLOGY_SLOPE_FLAT);
    expect(result.slopeClass[5]).toBe(HYDROLOGY_SLOPE_FLAT);
    expect(result.flowPermanenceProxy[0]).toBe(HYDROLOGY_FLOW_DRY);
    expect(result.flowPermanenceProxy[1]).toBe(HYDROLOGY_FLOW_EPHEMERAL);
    expect(result.flowPermanenceProxy[5]).toBe(HYDROLOGY_FLOW_INTERMITTENT);
  });

  it("marks spill-routed paths separately from direct ocean mouths", () => {
    const width = 6;
    const height = 1;
    const size = width * height;
    const landMask = new Uint8Array([1, 1, 1, 1, 1, 0]);
    const elevation = new Int16Array([18, 16, 14, 12, 10, 0]);
    const routingElevation = new Float32Array([18, 16, 16, 12, 10, 0]);
    const depressionDepth = new Float32Array([0, 0, 2, 0, 0, 0]);
    const runoff = new Float32Array([3, 3, 3, 3, 3, 0]);
    const discharge = new Float32Array([3, 6, 9, 12, 30, 0]);
    const riverClass = new Uint8Array([0, RIVER_CLASS_MINOR, RIVER_CLASS_MINOR, RIVER_CLASS_MAJOR, RIVER_CLASS_MAJOR, 0]);
    const flowDir = new Int32Array([1, 2, 3, 4, 5, -1]);
    const basinId = new Int32Array([4, 4, 4, 4, 4, -1]);
    const terminalType = new Uint8Array([0, 0, 0, 0, 1, 0]);
    const lakeMask = new Uint8Array(size);

    const result = runOpValidated(
      computeRiverNetworkMetrics,
      {
        width,
        height,
        landMask,
        elevation,
        routingElevation,
        depressionDepth,
        runoff,
        discharge,
        riverClass,
        flowDir,
        basinId,
        terminalType,
        lakeMask,
      },
      {
        strategy: "default",
        config: {},
      }
    );

    expect(result.mouthType[4]).toBe(HYDROLOGY_MOUTH_OCEAN);
    expect(result.mouthType[3]).toBe(HYDROLOGY_MOUTH_OCEAN);
    expect(result.mouthType[2]).toBe(HYDROLOGY_MOUTH_SPILL_PATH);
    expect(result.mouthType[1]).toBe(HYDROLOGY_MOUTH_SPILL_PATH);
    expect(result.mouthType[0]).toBe(HYDROLOGY_MOUTH_SPILL_PATH);
    expect(result.flowPermanenceProxy[3]).toBe(HYDROLOGY_FLOW_INTERMITTENT);
    expect(result.flowPermanenceProxy[4]).toBe(HYDROLOGY_FLOW_PERENNIAL);
  });
});
