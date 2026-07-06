import { describe, expect, it } from "bun:test";

import hydrologyOpsPublic from "@mapgen/domain/hydrology/ops";
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
} from "@mapgen/domain/hydrology/model/policy/river-network-metrics.js";
import {
  RIVER_CLASS_MAJOR,
  RIVER_CLASS_MINOR,
} from "@mapgen/domain/hydrology/model/policy/river-class.js";
import { runOpValidated } from "../support/compiler-helpers.js";

const { computeRiverNetworkMetrics } = hydrologyOpsPublic.ops;

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
    const riverClass = new Uint8Array([
      0,
      RIVER_CLASS_MINOR,
      RIVER_CLASS_MINOR,
      0,
      RIVER_CLASS_MINOR,
      RIVER_CLASS_MAJOR,
    ]);
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
    expect(result.benchmarkSummary).toMatchObject({
      version: 1,
      landTileCount: 6,
      waterTileCount: 0,
      lakeTileCount: 1,
      riverTileCount: 4,
      minorRiverTileCount: 3,
      majorRiverTileCount: 1,
      streamOrder1RiverTileCount: 3,
      lowOrderRiverTileCount: 4,
      dryFlowTileCount: 2,
      ephemeralFlowTileCount: 2,
      intermittentFlowTileCount: 2,
      perennialFlowTileCount: 0,
      riverDryTileCount: 0,
      riverEphemeralTileCount: 2,
      riverIntermittentTileCount: 2,
      riverPerennialTileCount: 0,
      oceanMouthTileCount: 0,
      acceptedLakeMouthTileCount: 6,
      closedBasinMouthTileCount: 0,
      spillPathMouthTileCount: 0,
      unresolvedMouthTileCount: 0,
      resolvedMouthTileCount: 6,
      assignedBasinLandTileCount: 6,
      unassignedBasinLandTileCount: 0,
      invalidReceiverTileCount: 0,
      downstreamDischargeDropEdgeCount: 0,
      maxUpstreamArea: 6,
      maxStreamOrderProxy: 2,
    });
    expect(result.benchmarkSummary.lakeLandShare).toBeCloseTo(1 / 6);
    expect(result.benchmarkSummary.riverLandShare).toBeCloseTo(4 / 6);
    expect(result.benchmarkSummary.minorRiverShareOfRiverTiles).toBeCloseTo(3 / 4);
    expect(result.benchmarkSummary.majorRiverShareOfRiverTiles).toBeCloseTo(1 / 4);
    expect(result.benchmarkSummary.lowOrderRiverShareOfRiverTiles).toBe(1);
    expect(result.benchmarkSummary.nonDryFlowLandShare).toBeCloseTo(4 / 6);
    expect(result.benchmarkSummary.nonPerennialRiverShareOfRiverTiles).toBe(1);
    expect(result.benchmarkSummary.closedOrLakeTerminalLandShare).toBe(1);
    expect(result.benchmarkSummary.lakeConnectedTerminalDischargeShare).toBe(1);
  });

  it("records endorheic closed-basin terminals as typed hydrology outcomes", () => {
    const width = 5;
    const height = 1;
    const size = width * height;
    const landMask = new Uint8Array(size).fill(1);
    const elevation = new Int16Array([20, 16, 12, 8, 4]);
    const routingElevation = new Float32Array(elevation);
    const depressionDepth = new Float32Array(size);
    const runoff = new Float32Array([3, 3, 3, 3, 3]);
    const discharge = new Float32Array([3, 6, 9, 12, 15]);
    const riverClass = new Uint8Array([
      0,
      RIVER_CLASS_MINOR,
      RIVER_CLASS_MINOR,
      RIVER_CLASS_MAJOR,
      RIVER_CLASS_MAJOR,
    ]);
    const flowDir = new Int32Array([1, 2, 3, 4, -1]);
    const basinId = new Int32Array(size).fill(4);
    const terminalType = new Uint8Array(size);
    terminalType[4] = 2;
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

    for (let i = 0; i < size; i++) {
      expect(result.mouthType[i]).toBe(HYDROLOGY_MOUTH_CLOSED_BASIN);
    }
    expect(result.benchmarkSummary).toMatchObject({
      version: 1,
      landTileCount: 5,
      riverTileCount: 4,
      minorRiverTileCount: 2,
      majorRiverTileCount: 2,
      oceanMouthTileCount: 0,
      acceptedLakeMouthTileCount: 0,
      closedBasinMouthTileCount: 5,
      unresolvedMouthTileCount: 0,
      resolvedMouthTileCount: 5,
      assignedBasinLandTileCount: 5,
      unassignedBasinLandTileCount: 0,
      invalidReceiverTileCount: 0,
      downstreamDischargeDropEdgeCount: 0,
      maxUpstreamArea: 5,
      maxStreamOrderProxy: 1,
    });
    expect(result.benchmarkSummary.closedOrLakeTerminalLandShare).toBe(1);
    expect(result.benchmarkSummary.lakeConnectedTerminalDischargeShare).toBe(0);
    expect(result.benchmarkSummary.nonPerennialRiverShareOfRiverTiles).toBeGreaterThan(0);
  });

  it("keeps wet headwater channels as the majority before a major trunk", () => {
    const width = 7;
    const height = 3;
    const size = width * height;
    const outletWater = 20;
    const trunkA = 13;
    const trunkB = 19;
    const landMask = new Uint8Array(size).fill(1);
    landMask[outletWater] = 0;
    const elevation = new Int16Array([
      30, 28, 26, 24, 26, 28, 30, 28, 26, 24, 22, 20, 18, 12, 30, 28, 26, 24, 20, 10, 0,
    ]);
    const routingElevation = new Float32Array(elevation);
    const depressionDepth = new Float32Array(size);
    const runoff = new Float32Array(size).fill(5);
    const discharge = new Float32Array(size);
    const riverClass = new Uint8Array(size);
    const flowDir = new Int32Array(size).fill(-1);
    const basinId = new Int32Array(size);
    basinId.fill(trunkB);
    basinId[outletWater] = -1;
    const terminalType = new Uint8Array(size);
    terminalType[trunkB] = 1;
    const lakeMask = new Uint8Array(size);

    for (const index of [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 16, 17, 18]) {
      riverClass[index] = RIVER_CLASS_MINOR;
      discharge[index] = 5;
    }
    for (const index of [trunkA, trunkB]) {
      riverClass[index] = RIVER_CLASS_MAJOR;
    }
    discharge[trunkA] = 65;
    discharge[trunkB] = 100;

    flowDir[0] = 1;
    flowDir[1] = 2;
    flowDir[2] = 3;
    flowDir[3] = 10;
    flowDir[4] = 11;
    flowDir[5] = 12;
    flowDir[6] = 12;
    flowDir[7] = 8;
    flowDir[8] = 9;
    flowDir[9] = 10;
    flowDir[10] = 11;
    flowDir[11] = 12;
    flowDir[12] = trunkA;
    flowDir[trunkA] = trunkB;
    flowDir[14] = 15;
    flowDir[15] = 16;
    flowDir[16] = 17;
    flowDir[17] = 18;
    flowDir[18] = trunkB;
    flowDir[trunkB] = outletWater;

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

    expect(result.benchmarkSummary).toMatchObject({
      version: 1,
      landTileCount: 20,
      riverTileCount: 20,
      minorRiverTileCount: 18,
      majorRiverTileCount: 2,
      oceanMouthTileCount: 20,
      unresolvedMouthTileCount: 0,
      invalidReceiverTileCount: 0,
      downstreamDischargeDropEdgeCount: 0,
      maxUpstreamArea: 20,
    });
    expect(result.benchmarkSummary.minorRiverShareOfRiverTiles).toBe(0.9);
    expect(result.benchmarkSummary.majorRiverShareOfRiverTiles).toBe(0.1);
    expect(result.benchmarkSummary.lowOrderRiverShareOfRiverTiles).toBe(1);
    expect(result.benchmarkSummary.nonPerennialRiverShareOfRiverTiles).toBeGreaterThan(0.8);
    expect(result.upstreamArea[trunkB]).toBe(20);
    expect(result.flowPermanenceProxy[trunkB]).toBe(HYDROLOGY_FLOW_PERENNIAL);
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
    const riverClass = new Uint8Array([
      0,
      RIVER_CLASS_MINOR,
      RIVER_CLASS_MINOR,
      RIVER_CLASS_MAJOR,
      RIVER_CLASS_MAJOR + 1,
      0,
    ]);
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
    expect(result.benchmarkSummary).toMatchObject({
      version: 1,
      landTileCount: 5,
      waterTileCount: 1,
      lakeTileCount: 0,
      riverTileCount: 4,
      minorRiverTileCount: 2,
      majorRiverTileCount: 2,
      streamOrder1RiverTileCount: 4,
      lowOrderRiverTileCount: 4,
      dryFlowTileCount: 1,
      ephemeralFlowTileCount: 0,
      intermittentFlowTileCount: 3,
      perennialFlowTileCount: 1,
      riverDryTileCount: 0,
      riverEphemeralTileCount: 0,
      riverIntermittentTileCount: 3,
      riverPerennialTileCount: 1,
      oceanMouthTileCount: 2,
      acceptedLakeMouthTileCount: 0,
      closedBasinMouthTileCount: 0,
      spillPathMouthTileCount: 3,
      unresolvedMouthTileCount: 0,
      resolvedMouthTileCount: 5,
      assignedBasinLandTileCount: 5,
      unassignedBasinLandTileCount: 0,
      invalidReceiverTileCount: 0,
      downstreamDischargeDropEdgeCount: 0,
      maxUpstreamArea: 5,
      maxStreamOrderProxy: 1,
    });
    expect(result.benchmarkSummary.lakeLandShare).toBe(0);
    expect(result.benchmarkSummary.riverLandShare).toBeCloseTo(4 / 5);
    expect(result.benchmarkSummary.lowOrderRiverShareOfRiverTiles).toBe(1);
    expect(result.benchmarkSummary.nonDryFlowLandShare).toBeCloseTo(4 / 5);
    expect(result.benchmarkSummary.nonPerennialRiverShareOfRiverTiles).toBeCloseTo(3 / 4);
    expect(result.benchmarkSummary.closedOrLakeTerminalLandShare).toBe(0);
    expect(result.benchmarkSummary.lakeConnectedTerminalDischargeShare).toBe(0);
  });

  it("surfaces routing and basin health counters without hiding typed output", () => {
    const width = 3;
    const height = 1;
    const size = width * height;
    const landMask = new Uint8Array(size).fill(1);
    const elevation = new Int16Array([8, 7, 6]);
    const routingElevation = new Float32Array(elevation);
    const depressionDepth = new Float32Array(size);
    const runoff = new Float32Array([1, 1, 1]);
    const discharge = new Float32Array([5, 4, 9]);
    const riverClass = new Uint8Array([RIVER_CLASS_MINOR, 0, RIVER_CLASS_MAJOR]);
    const flowDir = new Int32Array([1, -2, -1]);
    const basinId = new Int32Array([2, -1, 3]);
    const terminalType = new Uint8Array([0, 0, 2]);
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

    expect(result.benchmarkSummary.invalidReceiverTileCount).toBe(1);
    expect(result.benchmarkSummary.downstreamDischargeDropEdgeCount).toBe(1);
    expect(result.benchmarkSummary.assignedBasinLandTileCount).toBe(2);
    expect(result.benchmarkSummary.unassignedBasinLandTileCount).toBe(1);
    expect(result.benchmarkSummary.unresolvedMouthTileCount).toBe(2);
    expect(result.benchmarkSummary.closedBasinMouthTileCount).toBe(1);
    expect(result.benchmarkSummary.riverTileCount).toBe(2);
    expect(result.benchmarkSummary.riverDryTileCount).toBe(0);
    expect(result.benchmarkSummary.riverIntermittentTileCount).toBe(1);
    expect(result.benchmarkSummary.riverPerennialTileCount).toBe(1);
    expect(result.benchmarkSummary.nonPerennialRiverShareOfRiverTiles).toBe(0.5);
  });
});
