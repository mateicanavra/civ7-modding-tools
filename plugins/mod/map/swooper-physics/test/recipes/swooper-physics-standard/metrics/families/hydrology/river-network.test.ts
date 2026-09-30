import { describe, expect, it } from "bun:test";
import { Value } from "typebox/value";
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
  HYDROLOGY_MOUTH_BOUNDARY_EXPORT,
  HYDROLOGY_MOUTH_SUBTILE,
  HYDROLOGY_MOUTH_DRY,
  HYDROLOGY_MOUTH_CLOSED_BASIN,
  HYDROLOGY_MOUTH_OCEAN,
  HYDROLOGY_MOUTH_UNRESOLVED,
} from "../../../../../../src/domain/hydrology/modules/hydrography/model/policy/river-network-classification.js";
import {
  measureStandardRiverNetwork,
  StandardRiverNetworkMeasurementsSchema,
  type StandardRiverNetworkMeasurementInput,
} from "../../../../../../src/recipes/standard/metrics/families/hydrology/river-network.js";

describe("Standard river-network measurements", () => {
  it("projects river hierarchy, permanence, and accepted-lake terminal shares", () => {
    const input = {
      model: "certified-sill-spill",
      width: 6,
      height: 1,
      componentId: Int32Array.of(0, 0, 0, 0, 0, 6),
      terminalType: new Uint8Array(6).fill(3),
      landMask: new Uint8Array(6).fill(1),
      discharge: [2, 4, 7, 9, 13, 0],
      riverClass: new Uint8Array([
        0,
        RIVER_CLASS_MINOR,
        RIVER_CLASS_MINOR,
        0,
        RIVER_CLASS_MAJOR,
        0,
      ]),
      flowDir: new Int32Array([1, 2, 3, 4, 5, -2]),
      basinId: new Int32Array(6).fill(5),
      lakeMask: new Uint8Array([0, 0, 0, 0, 0, 1]),
      upstreamArea: new Int32Array([1, 2, 1, 1, 2, 6]),
      streamOrderProxy: new Uint8Array([0, 1, 1, 0, 2, 0]),
      mouthType: Uint8Array.of(2, 2, 2, 2, 2, 0),
      flowPermanenceProxy: new Uint8Array([
        HYDROLOGY_FLOW_DRY,
        HYDROLOGY_FLOW_EPHEMERAL,
        HYDROLOGY_FLOW_INTERMITTENT,
        HYDROLOGY_FLOW_DRY,
        HYDROLOGY_FLOW_INTERMITTENT,
        HYDROLOGY_FLOW_DRY,
      ]),
    } satisfies StandardRiverNetworkMeasurementInput;

    const measurements = measureStandardRiverNetwork(input);

    expect(measurements).toMatchObject({
      version: 1,
      landTileCount: 6,
      waterTileCount: 0,
      lakeTileCount: 1,
      riverTileCount: 3,
      minorRiverTileCount: 2,
      majorRiverTileCount: 1,
      streamOrder1RiverTileCount: 2,
      lowOrderRiverTileCount: 3,
      dryFlowTileCount: 3,
      ephemeralFlowTileCount: 1,
      intermittentFlowTileCount: 2,
      perennialFlowTileCount: 0,
      riverEphemeralTileCount: 1,
      riverIntermittentTileCount: 2,
      acceptedLakeMouthTileCount: 5,
      mouthSourceTileCount: 5,
      resolvedMouthTileCount: 5,
      assignedBasinLandTileCount: 6,
      invalidReceiverTileCount: 0,
      downstreamDischargeDropEdgeCount: 0,
      maxUpstreamArea: 6,
      maxStreamOrderProxy: 2,
    });
    expect(measurements.lakeLandShare).toBeCloseTo(1 / 6);
    expect(measurements.riverLandShare).toBeCloseTo(3 / 6);
    expect(measurements.minorRiverShareOfRiverTiles).toBeCloseTo(2 / 3);
    expect(measurements.majorRiverShareOfRiverTiles).toBeCloseTo(1 / 3);
    expect(measurements.nonDryFlowLandShare).toBeCloseTo(3 / 6);
    expect(measurements.nonPerennialRiverShareOfRiverTiles).toBe(1);
    expect(measurements.closedOrLakeTerminalLandShare).toBe(5 / 6);
    expect(measurements.lakeConnectedTerminalDischargeShare).toBe(1);
    expect(Value.Check(StandardRiverNetworkMeasurementsSchema, measurements)).toBe(true);
    expect(Value.Check(StandardRiverNetworkMeasurementsSchema, { ...measurements, model: "legacy-sink-budget" })).toBe(false);
    expect(Value.Check(StandardRiverNetworkMeasurementsSchema, { ...measurements, spillPathMouthTileCount: 1 })).toBe(false);
  });

  it("projects direct marine mouths and current river permanence", () => {
    const measurements = measureStandardRiverNetwork({
      model: "certified-sill-spill",
      componentId: new Int32Array(6),
      terminalType: Uint8Array.of(1, 1, 1, 1, 1, 0),
      width: 6,
      height: 1,
      landMask: new Uint8Array([1, 1, 1, 1, 1, 0]),
      discharge: [3, 6, 9, 12, 30, 0],
      riverClass: new Uint8Array([
        0,
        RIVER_CLASS_MINOR,
        RIVER_CLASS_MINOR,
        RIVER_CLASS_MAJOR,
        RIVER_CLASS_MAJOR,
        0,
      ]),
      flowDir: new Int32Array([1, 2, 3, 4, 5, -1]),
      basinId: new Int32Array([4, 4, 4, 4, 4, -1]),
      lakeMask: new Uint8Array(6),
      upstreamArea: new Int32Array([1, 2, 3, 4, 5, 0]),
      streamOrderProxy: new Uint8Array([0, 1, 1, 1, 1, 0]),
      mouthType: new Uint8Array([
        HYDROLOGY_MOUTH_OCEAN,
        HYDROLOGY_MOUTH_OCEAN,
        HYDROLOGY_MOUTH_OCEAN,
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
      oceanMouthTileCount: 5,
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
      model: "certified-sill-spill",
      componentId: new Int32Array(3),
      terminalType: Uint8Array.of(3, 3, 2),
      width: 3,
      height: 1,
      landMask: new Uint8Array(3).fill(1),
      discharge: [5, 4, 9],
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

  it("does not compare wet connectivity sentinels as allocated body discharge", () => {
    const measurements = measureStandardRiverNetwork({
      model: "certified-sill-spill",
      width: 4,
      componentId: Int32Array.of(0, 2, 0, 0),
      terminalType: Uint8Array.of(1, 1, 1, 0),
      height: 1,
      landMask: new Uint8Array([1, 1, 1, 0]),
      discharge: [5, 0, 3, 0],
      riverClass: new Uint8Array([RIVER_CLASS_MAJOR, 0, RIVER_CLASS_MINOR, 0]),
      flowDir: new Int32Array([1, -2, 3, -1]),
      basinId: new Int32Array([3, 3, 3, -1]),
      lakeMask: new Uint8Array([0, 1, 0, 0]),
      upstreamArea: new Int32Array([1, 2, 3, 0]),
      streamOrderProxy: new Uint8Array([1, 1, 1, 0]),
      mouthType: new Uint8Array([HYDROLOGY_MOUTH_ACCEPTED_LAKE, HYDROLOGY_MOUTH_UNRESOLVED, HYDROLOGY_MOUTH_OCEAN, 0]),
      flowPermanenceProxy: new Uint8Array([HYDROLOGY_FLOW_PERENNIAL, HYDROLOGY_FLOW_DRY, HYDROLOGY_FLOW_INTERMITTENT, HYDROLOGY_FLOW_DRY]),
    });
    expect(measurements.model).toBe("certified-sill-spill");
    expect(measurements.downstreamDischargeDropEdgeCount).toBe(0);
    expect(measurements.lakeConnectedTerminalDischargeShare).toBe(5 / 8);
    expect(measurements.lakeTileCount).toBe(1);
    expect(measurements.mouthSourceTileCount).toBe(2);
    expect(measurements.resolvedMouthTileCount).toBe(2);
    expect(measurements.unresolvedMouthTileCount).toBe(0);
    expect(measurements.assignedBasinLandTileCount).toBe(3);
  });

  it("still reports unresolved dry sources next to certified wet bodies", () => {
    const measurements = measureStandardRiverNetwork({
      model: "certified-sill-spill",
      width: 2,
      componentId: Int32Array.of(0, 2),
      terminalType: Uint8Array.of(3, 3),
      height: 1,
      landMask: new Uint8Array([1, 1]),
      discharge: [5, 0],
      riverClass: new Uint8Array([RIVER_CLASS_MINOR, 0]),
      flowDir: new Int32Array([1, -2]),
      basinId: new Int32Array([1, 1]),
      lakeMask: new Uint8Array([0, 1]),
      upstreamArea: new Int32Array([1, 2]),
      streamOrderProxy: new Uint8Array([1, 1]),
      mouthType: new Uint8Array(2).fill(HYDROLOGY_MOUTH_UNRESOLVED),
      flowPermanenceProxy: new Uint8Array([HYDROLOGY_FLOW_PERENNIAL, HYDROLOGY_FLOW_DRY]),
    });
    expect(measurements.mouthSourceTileCount).toBe(1);
    expect(measurements.resolvedMouthTileCount).toBe(0);
    expect(measurements.unresolvedMouthTileCount).toBe(1);
  });

  it("exempts only component principal attachments, not ordinary downstream discharge drops", () => {
    const input = {
      model: "certified-sill-spill" as const, width: 6, height: 1,
      landMask: Uint8Array.of(1, 1, 1, 1, 1, 0), lakeMask: Uint8Array.of(0, 0, 1, 0, 0, 0),
      componentId: Int32Array.of(0, 2, 2, 0, 0, 0), terminalType: Uint8Array.of(1, 1, 1, 1, 1, 0),
      discharge: [10, 5, 0, 6, 4, 0], flowDir: Int32Array.of(1, 3, -2, 4, 5, -1),
      basinId: Int32Array.of(5, 5, 5, 5, 5, -1), riverClass: Uint8Array.of(2, 2, 0, 2, 2, 0),
      upstreamArea: new Int32Array(6), streamOrderProxy: new Uint8Array(6),
      mouthType: Uint8Array.of(1, 1, 0, 1, 1, 0), flowPermanenceProxy: new Uint8Array(6),
    };
    expect(measureStandardRiverNetwork(input).downstreamDischargeDropEdgeCount).toBe(1);
    input.componentId[1] = 0;
    expect(measureStandardRiverNetwork(input).downstreamDischargeDropEdgeCount).toBe(2);
    input.flowDir[0] = -2;
    expect(measureStandardRiverNetwork(input).invalidReceiverTileCount).toBeGreaterThan(0);
  });

  it("counts boundary, subtile and dry terminal roles as resolved without calling them ocean mouths", () => {
    const measurements = measureStandardRiverNetwork({
      model: "certified-sill-spill", width: 3, height: 1,
      landMask: Uint8Array.of(1, 1, 1), lakeMask: new Uint8Array(3), componentId: Int32Array.of(0, 2, 3),
      terminalType: Uint8Array.of(2, 4, 5), discharge: [0, 0, 0], flowDir: Int32Array.of(-1, -2, -2), basinId: Int32Array.of(1, 2, 3),
      riverClass: new Uint8Array(3), upstreamArea: new Int32Array(3), streamOrderProxy: new Uint8Array(3),
      mouthType: Uint8Array.of(HYDROLOGY_MOUTH_BOUNDARY_EXPORT, HYDROLOGY_MOUTH_SUBTILE, HYDROLOGY_MOUTH_DRY),
      flowPermanenceProxy: new Uint8Array(3),
    });
    expect(measurements).toMatchObject({ resolvedMouthTileCount: 3, unresolvedMouthTileCount: 0, oceanMouthTileCount: 0,
      invalidReceiverTileCount: 0, boundaryExportMouthTileCount: 1, subtileMouthTileCount: 1, dryBasinMouthTileCount: 1 });
  });
});
