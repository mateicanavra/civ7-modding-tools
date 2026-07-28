import { describe, expect, it } from "bun:test";
import {
  RIVER_CLASS_MAJOR,
  RIVER_CLASS_MINOR,
} from "../../../../../../src/domain/hydrology/modules/hydrography/model/policy/river-class.js";
import {
  HYDROLOGY_FLOW_DRY,
  HYDROLOGY_FLOW_EPHEMERAL,
  HYDROLOGY_FLOW_INTERMITTENT,
  HYDROLOGY_FLOW_PERENNIAL,
  HYDROLOGY_MOUTH_ACCEPTED_LAKE,
  HYDROLOGY_MOUTH_CLOSED_BASIN,
  HYDROLOGY_MOUTH_OCEAN,
  HYDROLOGY_MOUTH_SPILL_PATH,
} from "../../../../../../src/domain/hydrology/modules/hydrography/model/policy/river-network-classification.js";
import {
  measureStandardRiverNetwork,
  type StandardRiverNetworkMeasurementInput,
} from "../../../../../../src/recipes/standard/metrics/families/hydrology/river-network.js";

describe("Standard river-network measurements", () => {
  it("projects river hierarchy, permanence, and accepted-lake terminal shares", () => {
    const input = {
      width: 3,
      height: 2,
      landMask: new Uint8Array(6).fill(1),
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
      basinId: new Int32Array(6).fill(5),
      lakeMask: new Uint8Array([0, 0, 0, 0, 0, 1]),
      upstreamArea: new Int32Array([1, 2, 1, 1, 2, 6]),
      streamOrderProxy: new Uint8Array([0, 1, 1, 0, 1, 2]),
      mouthType: new Uint8Array(6).fill(HYDROLOGY_MOUTH_ACCEPTED_LAKE),
      flowPermanenceProxy: new Uint8Array([
        HYDROLOGY_FLOW_DRY,
        HYDROLOGY_FLOW_EPHEMERAL,
        HYDROLOGY_FLOW_INTERMITTENT,
        HYDROLOGY_FLOW_DRY,
        HYDROLOGY_FLOW_EPHEMERAL,
        HYDROLOGY_FLOW_INTERMITTENT,
      ]),
    } satisfies StandardRiverNetworkMeasurementInput;

    const measurements = measureStandardRiverNetwork(input);

    expect(measurements).toMatchObject({
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
      riverEphemeralTileCount: 2,
      riverIntermittentTileCount: 2,
      acceptedLakeMouthTileCount: 6,
      resolvedMouthTileCount: 6,
      assignedBasinLandTileCount: 6,
      invalidReceiverTileCount: 0,
      downstreamDischargeDropEdgeCount: 0,
      maxUpstreamArea: 6,
      maxStreamOrderProxy: 2,
    });
    expect(measurements.lakeLandShare).toBeCloseTo(1 / 6);
    expect(measurements.riverLandShare).toBeCloseTo(4 / 6);
    expect(measurements.minorRiverShareOfRiverTiles).toBeCloseTo(3 / 4);
    expect(measurements.majorRiverShareOfRiverTiles).toBeCloseTo(1 / 4);
    expect(measurements.nonDryFlowLandShare).toBeCloseTo(4 / 6);
    expect(measurements.nonPerennialRiverShareOfRiverTiles).toBe(1);
    expect(measurements.closedOrLakeTerminalLandShare).toBe(1);
    expect(measurements.lakeConnectedTerminalDischargeShare).toBe(1);
  });

  it("projects spill-routed paths separately from direct ocean mouths", () => {
    const measurements = measureStandardRiverNetwork({
      width: 6,
      height: 1,
      landMask: new Uint8Array([1, 1, 1, 1, 1, 0]),
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
      basinId: new Int32Array([4, 4, 4, 4, 4, -1]),
      lakeMask: new Uint8Array(6),
      upstreamArea: new Int32Array([1, 2, 3, 4, 5, 0]),
      streamOrderProxy: new Uint8Array([0, 1, 1, 1, 1, 0]),
      mouthType: new Uint8Array([
        HYDROLOGY_MOUTH_SPILL_PATH,
        HYDROLOGY_MOUTH_SPILL_PATH,
        HYDROLOGY_MOUTH_SPILL_PATH,
        HYDROLOGY_MOUTH_OCEAN,
        HYDROLOGY_MOUTH_OCEAN,
        0,
      ]),
      flowPermanenceProxy: new Uint8Array([
        HYDROLOGY_FLOW_DRY,
        HYDROLOGY_FLOW_INTERMITTENT,
        HYDROLOGY_FLOW_INTERMITTENT,
        HYDROLOGY_FLOW_INTERMITTENT,
        HYDROLOGY_FLOW_PERENNIAL,
        HYDROLOGY_FLOW_DRY,
      ]),
    });

    expect(measurements).toMatchObject({
      landTileCount: 5,
      waterTileCount: 1,
      riverTileCount: 4,
      minorRiverTileCount: 2,
      majorRiverTileCount: 2,
      oceanMouthTileCount: 2,
      spillPathMouthTileCount: 3,
      resolvedMouthTileCount: 5,
      lowOrderRiverTileCount: 4,
      intermittentFlowTileCount: 3,
      perennialFlowTileCount: 1,
      maxUpstreamArea: 5,
      maxStreamOrderProxy: 1,
    });
    expect(measurements.riverLandShare).toBeCloseTo(4 / 5);
    expect(measurements.nonPerennialRiverShareOfRiverTiles).toBeCloseTo(3 / 4);
    expect(measurements.closedOrLakeTerminalLandShare).toBe(0);
  });

  it("surfaces routing and basin health counters from fixed evidence", () => {
    const measurements = measureStandardRiverNetwork({
      width: 3,
      height: 1,
      landMask: new Uint8Array(3).fill(1),
      discharge: new Float32Array([5, 4, 9]),
      riverClass: new Uint8Array([RIVER_CLASS_MINOR, 0, RIVER_CLASS_MAJOR]),
      flowDir: new Int32Array([1, -2, -1]),
      basinId: new Int32Array([2, -1, 3]),
      lakeMask: new Uint8Array(3),
      upstreamArea: new Int32Array([1, 1, 1]),
      streamOrderProxy: new Uint8Array([1, 0, 1]),
      mouthType: new Uint8Array([0, 0, HYDROLOGY_MOUTH_CLOSED_BASIN]),
      flowPermanenceProxy: new Uint8Array([
        HYDROLOGY_FLOW_INTERMITTENT,
        HYDROLOGY_FLOW_DRY,
        HYDROLOGY_FLOW_PERENNIAL,
      ]),
    });

    expect(measurements).toMatchObject({
      invalidReceiverTileCount: 1,
      downstreamDischargeDropEdgeCount: 1,
      assignedBasinLandTileCount: 2,
      unassignedBasinLandTileCount: 1,
      unresolvedMouthTileCount: 2,
      closedBasinMouthTileCount: 1,
      riverTileCount: 2,
      riverDryTileCount: 0,
      riverIntermittentTileCount: 1,
      riverPerennialTileCount: 1,
    });
    expect(measurements.nonPerennialRiverShareOfRiverTiles).toBe(0.5);
  });
});
