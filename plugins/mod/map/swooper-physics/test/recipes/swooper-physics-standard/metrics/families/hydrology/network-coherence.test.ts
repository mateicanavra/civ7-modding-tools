import { describe, expect, it } from "bun:test";
import { measureStandardNetworkCoherence } from "../../../../../../src/recipes/standard/metrics/families/hydrology/network-coherence.js";

import { basinCapture } from "../../fixtures/basin-network.js";

function fixture() {
  const base = basinCapture();
  return {
    provenance: { width: 5, height: 1 },
    model: {
      ...base.model,
      seaLevel: 0,
      landMask: Uint8Array.of(0, 1, 1, 1, 1),
      elevation: Int16Array.of(-1, 3, 1, 3, 4),
      plannedLakeMask: Uint8Array.of(0, 0, 1, 0, 0),
      riverClass: Uint8Array.of(0, 2, 0, 1, 0),
      flowDir: Int32Array.of(-1, 0, 1, 2, 3),
      mountainMask: Uint8Array.of(0, 0, 0, 0, 1),
      volcanoMask: new Uint8Array(5),
      physicalHydrology: {
        ...base.model.physicalHydrology,
        runoff: [0, 1, 0, 2, 1], discharge: [0, 5, 0, 3, 1],
        bodyId: Int32Array.of(0, 0, 3, 0, 0),
        componentId: Int32Array.of(0, 2, 2, 0, 0),
        waterSurface: [-1, 3, 3, 3, 4],
        bodies: [{ ...base.model.physicalHydrology.bodies[0]!, level: 3,
          flux: { dryRunoff: 0, incomingOverflow: 3, wetPrecipitation: 2, wetDemand: 1, balance: 4 }, outflow: 4 }],
        transfers: [{ ...base.model.physicalHydrology.transfers[0]!, signedDischarge: -4 }],
      },
    },
    projection: { navigableRivers: {
      model: "certified-sill-spill" as const, authoredSourceCount: 2,
      plannedMinorRiverTileCount: 1, plannedMajorRiverTileCount: 1,
      writes: [
        { sourceCell: 1, receiverCell: 0, direction: "WEST" as const, riverClass: "NAVIGABLE" as const },
        { sourceCell: 3, receiverCell: 2, direction: "WEST" as const, riverClass: "MINOR" as const },
      ],
      wetTransitionDispositions: [],
      wetTransitionWrites: [] as { bodyId: number; role: "outlet"; sourceCell: number; receiverCell: number; direction: "WEST"; riverClass: "NAVIGABLE" }[],
    } },
  } satisfies Parameters<typeof measureStandardNetworkCoherence>[0];
}

describe("network coherence measurements", () => {
  it("uses exposed land denominators and lake surface rather than lake floor for hydraulic drop", () => {
    const result = measureStandardNetworkCoherence(fixture())!;
    expect(result).toMatchObject({ originalLand: 4, exposedLand: 3, nonMountainExposedLand: 2,
      riverSourceFractionOfExposedLand: 2 / 3, majorSourceFractionOfExposedLand: 1 / 3,
      lakeFractionOfOriginalLand: 1 / 4, bodyCount: 1, singleTileBodyCount: 1,
      ascendingHydraulicReceivers: 0, invalidDryReceivers: 0,
      minorHydraulicDrops: { min: 0, max: 0 }, majorHydraulicDrops: { min: 3, max: 3 },
      classifiedLakeOutletCount: 1, unauthoredClassifiedWetOutletCount: 1,
      wetTransitionWriteCount: 0, navigableLakeOutletCount: 1, unauthoredNavigableWetOutletCount: 1 });
    expect(result.lakeOutlets[0]).toMatchObject({ bodyId: 3, surface: 3,
      receiverGround: 3, receiverClass: 2, classifiedInletCells: [3], wetOutletWritePresent: false });
    expect(result.majorSegmentStarts).toEqual([1]);
  });

  it("uses sea surface rather than seabed at marine mouths", () => {
    const input = fixture();
    input.model.elevation[0] = -900;
    expect(measureStandardNetworkCoherence(input)?.majorHydraulicDrops).toMatchObject({ min: 3, max: 3 });
  });

  it("distinguishes an absent wet write from a wrong or present receiver without inventing traversal proof", () => {
    const input = fixture();
    input.projection.navigableRivers.writes.push({ sourceCell: 2, receiverCell: 0,
      direction: "WEST", riverClass: "NAVIGABLE" });
    expect(measureStandardNetworkCoherence(input)?.unauthoredClassifiedWetOutletCount).toBe(1);
    input.projection.navigableRivers.writes[2]!.receiverCell = 1;
    expect(measureStandardNetworkCoherence(input)?.unauthoredClassifiedWetOutletCount).toBe(1);
    input.projection.navigableRivers.wetTransitionWrites.push({ bodyId: 3, role: "outlet", sourceCell: 2,
      receiverCell: 0, direction: "WEST", riverClass: "NAVIGABLE" });
    expect(measureStandardNetworkCoherence(input)?.unauthoredNavigableWetOutletCount).toBe(1);
    input.projection.navigableRivers.wetTransitionWrites[0]!.receiverCell = 1;
    expect(measureStandardNetworkCoherence(input)).toMatchObject({ unauthoredClassifiedWetOutletCount: 0,
      wetTransitionWriteCount: 1, navigableLakeOutletCount: 1, unauthoredNavigableWetOutletCount: 0 });
    input.projection.navigableRivers.wetTransitionWrites[0]!.bodyId = 9;
    expect(measureStandardNetworkCoherence(input)?.unauthoredNavigableWetOutletCount).toBe(1);
  });

  it("does not count MINOR, unclassified, zero-outflow or marine regimes as missing qualified NAV outlets", () => {
    for (const regime of ["minor", "unclassified", "zero", "marine"]) {
      const input = fixture();
      if (regime === "minor") input.model.riverClass[1] = 1;
      if (regime === "unclassified") input.model.riverClass[1] = 0;
      if (regime === "zero") input.model.physicalHydrology.transfers[0]!.signedDischarge = 0;
      if (regime === "marine") input.model.landMask[1] = 0;
      expect(measureStandardNetworkCoherence(input)).toMatchObject({ navigableLakeOutletCount: 0,
        unauthoredNavigableWetOutletCount: 0, wetTransitionWriteCount: 0 });
    }
  });

  it("does not fabricate a reservoir outlet when a exporting junction feeds that reservoir", () => {
    const input = fixture();
    input.model.physicalHydrology.transfers[0]!.signedDischarge = 2;
    input.model.physicalHydrology.bodies[0]!.outflow = 0;
    expect(measureStandardNetworkCoherence(input)).toMatchObject({
      lakeOutlets: [], navigableLakeOutletCount: 0, inwardOrZeroWetExchangeCount: 1,
    });
  });

  it("reports local lower-lake bypass candidates without treating them as violations", () => {
    const input = fixture();
    input.model.elevation[3] = 4;
    input.model.flowDir[3] = 4;
    input.model.flowDir[4] = 0;
    const result = measureStandardNetworkCoherence(input)!;
    expect(result.lowerAdjacentLakeBypasses).toEqual([{ sourceCell: 3, receiverCell: 4,
      bodyId: 3, adjacentWetCell: 2, ground: 4, waterSurface: 3, riverClass: 1 }]);
    expect(result.equalHeightDryReceivers).toBe(1);
    expect(result.ascendingHydraulicReceivers).toBe(0);
  });

  it("accepts odd-row diagonal and horizontal wrap receivers", () => {
    const input = fixture();
    const result = measureStandardNetworkCoherence({ ...input,
      provenance: { width: 3, height: 2 },
      model: { ...input.model,
        landMask: Uint8Array.of(1, 0, 0, 1, 0, 0),
        elevation: Int16Array.of(2, -9, -9, 2, -9, -9),
        plannedLakeMask: new Uint8Array(6), riverClass: Uint8Array.of(1, 0, 0, 2, 0, 0),
        flowDir: Int32Array.of(2, -1, -1, 1, -1, -1),
        mountainMask: new Uint8Array(6), volcanoMask: new Uint8Array(6),
        physicalHydrology: { ...input.model.physicalHydrology, bodies: [], transfers: [], ports: [],
          bodyId: new Int32Array(6), componentId: new Int32Array(6), waterSurface: new Array<number>(6).fill(0) },
      },
    });
    expect(result).toMatchObject({ invalidDryReceivers: 0, exposedLand: 2,
      dryHydraulicDrops: { count: 2, min: 2, max: 2 } });
  });

  it("preserves empty-channel distributions and rejects retired evidence", () => {
    const input = fixture();
    input.model.riverClass.fill(0);
    expect(measureStandardNetworkCoherence(input)?.majorHydraulicDrops).toEqual({
      count: 0, min: null, p50: null, p90: null, max: null });
    expect(() => measureStandardNetworkCoherence({ ...input, model: { ...input.model,
      physicalHydrology: { model: "legacy-sink-budget", routingElevation: new Float32Array(5),
        outletMask: new Uint8Array(5) } } } as unknown as Parameters<typeof measureStandardNetworkCoherence>[0]))
      .toThrow("Expected completed basin evidence");
  });
});
