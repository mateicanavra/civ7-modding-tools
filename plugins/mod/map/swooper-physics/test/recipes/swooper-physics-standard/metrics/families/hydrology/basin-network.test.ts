import { describe, expect, it } from "bun:test";
import {
  measureStandardBasinNetwork,
  type StandardBasinNetworkMeasurementInput,
} from "../../../../../../src/recipes/standard/metrics/families/hydrology/basin-network.js";

function capture() {
  return {
    provenance: { width: 3, height: 1 },
    model: {
      landMask: Uint8Array.of(0, 1, 1),
      elevation: Int16Array.of(-1, 2, 0),
      plannedLakeMask: Uint8Array.of(0, 0, 1),
      riverClass: Uint8Array.of(0, 2, 0),
      flowDir: Int32Array.of(-1, 0, 1),
      mountainMask: new Uint8Array(3),
      volcanoMask: new Uint8Array(3),
      baselineRainfall: Uint8Array.of(0, 10, 10),
      physicalHydrology: {
        model: "certified-sill-spill" as const,
        runoff: [0, 2, 3],
        discharge: [0, 11, 0],
        bodyId: Int32Array.of(0, 0, 1),
        waterSurface: Int16Array.of(-1, 2, 2),
        mouthBodyId: new Int32Array(3),
        bodies: [
          {
            nodeId: 1,
            wetCells: [2],
            spillElevation: 2,
            floorCell: 2,
            floorElevation: 0,
            outletCell: 2,
            receiverCell: 1,
            connectorCells: [1],
            flux: {
              dryRunoff: 0,
              incomingOverflow: 0,
              wetPrecipitation: 10,
              wetDemand: 1,
              balance: 9,
            },
            outflow: 9,
          },
        ],
        certificates: [{ nodeId: 1, spillBalance: 11 }],
        marineExits: [{ fromCell: 1, marineCell: 0, discharge: 11 }],
        conservation: {
          dryRunoff: 2,
          wetPrecipitation: 10,
          wetDemand: 1,
          externalDischarge: 11,
          residual: 0,
          roundoffBound: 1e-10,
        },
      },
    },
    projection: {
      lakes: {
        version: 1 as const,
        plannedLakeTileCount: 1,
        stampedLakeTileCount: 1,
        morphologyProtectedLakeTileCount: 0,
        isolatedFragmentProtectedLakeTileCount: 0,
        rejectedLakeTileCount: 0,
        nonLakeTileCount: 0,
        terrainMismatchTileCount: 0,
        components: {
          componentCount: 1,
          largestComponentSize: 1,
          maximumComponentDiameter: 0,
          singleTileComponentCount: 1,
        },
      },
      navigableRivers: {
        model: "certified-sill-spill" as const,
        authoredSourceCount: 1,
        wetTransitionWrites: [],
        plannedMinorRiverTileCount: 0,
        plannedMajorRiverTileCount: 1,
        writes: [
          {
            sourceCell: 1,
            receiverCell: 0,
            direction: "WEST" as const,
            riverClass: "NAVIGABLE" as "NAVIGABLE" | "MINOR",
          },
        ],
      },
      riverReadback: {
        terrainNavigableRiverTileCount: 1,
        riverMismatchCount: 0,
        selectedRiverRejectedCount: 0,
        extraEngineRiverCount: 0,
        minorRiverMismatchCount: 0,
        navigableMetadataMismatchCount: 0,
      },
    },
    observation: {
      isLake: Uint8Array.of(0, 0, 1), isWater: Uint8Array.of(1, 0, 1),
      terrain: Int32Array.of(4, 2, 3), coastTerrain: 3,
    },
  } satisfies StandardBasinNetworkMeasurementInput;
}

describe("certified basin-network integrity measurements", () => {
  it("measures admitted conservation, complete wet partition, and exact dry native sources without a lake quota", () => {
    const measured = measureStandardBasinNetwork(capture());
    expect(measured).toMatchObject({
      bodyCount: 1,
      wetTileCount: 1,
      dryChannelSourceCount: 1,
      reportedResidual: 0,
      recomputedResidual: 0,
      roundoffBound: 1e-10,
      conservationValid: true,
      certificatesAndLedgersValid: true,
      physicalFootprintsValid: true,
      exposureValid: true,
      lakeProjectionComplete: true,
      authoredSourcesComplete: true,
      nativeClassesMatch: true,
    });
  });

  it("returns explicit absence for legacy rather than invented certified counters", () => {
    const input = capture();
    expect(
      measureStandardBasinNetwork({
        ...input,
        model: {
          ...input.model,
          physicalHydrology: {
            model: "legacy-sink-budget",
            routingElevation: new Float32Array(3),
            outletMask: new Uint8Array(3),
          },
        },
      })
    ).toBeNull();
  });

  it("detects changed supplied runoff, reported residuals, and body ledger demand independently", () => {
    const changedRunoff = capture();
    changedRunoff.model.physicalHydrology.runoff[1] = 3;
    expect(measureStandardBasinNetwork(changedRunoff)).toMatchObject({
      conservationValid: false,
      recomputedResidual: 1,
    });
    const changedResidual = capture();
    changedResidual.model.physicalHydrology.conservation.residual = 1e-9;
    expect(measureStandardBasinNetwork(changedResidual)?.conservationValid).toBe(false);
    const changedDemand = capture();
    changedDemand.model.physicalHydrology.bodies[0]!.flux.wetDemand = 2;
    expect(measureStandardBasinNetwork(changedDemand)).toMatchObject({
      conservationValid: false,
      certificatesAndLedgersValid: false,
      invalidBodyLedgerCount: 1,
    });
  });

  it("refuses missing or nonpositive certificates and nonfinite or negative body outflow", () => {
    const missing = capture();
    missing.model.physicalHydrology.certificates = [];
    expect(measureStandardBasinNetwork(missing)).toMatchObject({
      missingBodyCertificateCount: 1,
      certificatesAndLedgersValid: false,
    });
    for (const invalid of [0, Number.NaN]) {
      const certificate = capture();
      certificate.model.physicalHydrology.certificates[0]!.spillBalance = invalid;
      expect(measureStandardBasinNetwork(certificate)).toMatchObject({
        invalidCertificateCount: 1,
        certificatesAndLedgersValid: false,
      });
    }
    for (const invalid of [-1, Number.NaN]) {
      const outflow = capture();
      outflow.model.physicalHydrology.bodies[0]!.outflow = invalid;
      expect(measureStandardBasinNetwork(outflow)).toMatchObject({
        invalidBodyLedgerCount: 1,
        certificatesAndLedgersValid: false,
      });
    }
  });

  it("admits exactly zero mixed outflow while requiring a strictly positive raw certificate", () => {
    const input = capture();
    const physical = input.model.physicalHydrology;
    physical.bodies[0]!.flux.wetDemand = 10;
    physical.bodies[0]!.flux.balance = 0;
    physical.bodies[0]!.outflow = 0;
    physical.certificates[0]!.spillBalance = 2;
    physical.discharge[1] = 2;
    physical.marineExits[0]!.discharge = 2;
    physical.conservation.wetDemand = 10;
    physical.conservation.externalDischarge = 2;
    expect(measureStandardBasinNetwork(input)).toMatchObject({
      invalidBodyLedgerCount: 0,
      certificatesAndLedgersValid: true,
      conservationValid: true,
    });
  });

  it("separates original-marine native lake classification from certified footprint realization", () => {
    const input = capture();
    input.observation.isLake[0] = 1;
    expect(measureStandardBasinNetwork(input)).toMatchObject({
      observedOriginalMarineNativeLakeTileCount: 1,
      lakeFootprintMismatchCount: 0,
      lakeProjectionComplete: true,
    });
    input.observation.isWater[1] = 1;
    expect(measureStandardBasinNetwork(input)).toMatchObject({
      observedOriginalMarineNativeLakeTileCount: 1,
      lakeFootprintMismatchCount: 1,
      lakeProjectionComplete: false,
    });
  });

  it("detects clipped wet membership, altered dry ground, uphill receivers, and landform overlap", () => {
    const clipped = capture();
    clipped.model.physicalHydrology.bodies[0]!.wetCells = [];
    expect(measureStandardBasinNetwork(clipped)?.physicalFootprintsValid).toBe(false);
    const raised = capture();
    raised.model.physicalHydrology.waterSurface[1] = 3;
    expect(measureStandardBasinNetwork(raised)).toMatchObject({
      dryGroundMismatchCount: 1,
      physicalFootprintsValid: false,
    });
    const uphill = capture();
    uphill.model.elevation[0] = 3;
    expect(measureStandardBasinNetwork(uphill)).toMatchObject({
      nonascendingGroundViolationCount: 1,
      physicalFootprintsValid: false,
    });
    const blocked = capture();
    blocked.model.mountainMask[2] = 1;
    blocked.model.volcanoMask[1] = 1;
    expect(measureStandardBasinNetwork(blocked)).toMatchObject({
      blockingWetTileCount: 1,
      blockingDryChannelCount: 1,
      exposureValid: false,
    });
  });

  it("detects lake clipping and native source omission, duplication, extra sources, and demotion", () => {
    const lake = capture();
    lake.observation.isWater[2] = 0;
    expect(measureStandardBasinNetwork(lake)).toMatchObject({
      lakeFootprintMismatchCount: 1,
      lakeProjectionComplete: false,
    });
    const missing = capture();
    missing.projection.navigableRivers.writes = [];
    expect(measureStandardBasinNetwork(missing)?.writes).toMatchObject({
      missingSourceCount: 1,
      complete: false,
    });
    const duplicate = capture();
    duplicate.projection.navigableRivers.writes.push({
      ...duplicate.projection.navigableRivers.writes[0]!,
    });
    expect(measureStandardBasinNetwork(duplicate)?.writes).toMatchObject({
      duplicateSourceCount: 1,
      complete: false,
    });
    const extra = capture();
    extra.projection.navigableRivers.writes.push({
      sourceCell: 2,
      receiverCell: 1,
      direction: "WEST",
      riverClass: "MINOR",
    });
    expect(measureStandardBasinNetwork(extra)?.writes).toMatchObject({
      extraSourceCount: 1,
      complete: false,
    });
    const demoted = capture();
    demoted.projection.navigableRivers.writes[0]!.riverClass = "MINOR";
    expect(measureStandardBasinNetwork(demoted)?.writes).toMatchObject({
      wrongClassCount: 1,
      complete: false,
    });
    const readback = capture();
    readback.projection.riverReadback.minorRiverMismatchCount = 1;
    expect(measureStandardBasinNetwork(readback)?.nativeClassesMatch).toBe(false);
  });

  it("accepts complete coast-water bodies while retaining native classification differences", () => {
    const input = capture();
    input.observation.isLake[2] = 0;
    input.projection.lakes.nonLakeTileCount = 1;
    expect(measureStandardBasinNetwork(input)).toMatchObject({
      lakeFootprintMismatchCount: 0,
      lakeProjectionComplete: true,
      observedPhysicalWaterNativeLakeTileCount: 0,
      observedPhysicalWaterNonLakeTileCount: 1,
      physicalWaterTerrainMismatchCount: 0,
    });
    input.observation.isLake[2] = 1;
    expect(measureStandardBasinNetwork(input)).toMatchObject({
      lakeProjectionComplete: true,
      observedPhysicalWaterNativeLakeTileCount: 1,
      observedPhysicalWaterNonLakeTileCount: 0,
    });
    input.observation.terrain[2] = 4;
    expect(measureStandardBasinNetwork(input)).toMatchObject({
      lakeFootprintMismatchCount: 0,
      lakeProjectionComplete: false,
      physicalWaterTerrainMismatchCount: 1,
    });
    expect(Array.from(input.model.plannedLakeMask)).toEqual([0, 0, 1]);
  });
});
