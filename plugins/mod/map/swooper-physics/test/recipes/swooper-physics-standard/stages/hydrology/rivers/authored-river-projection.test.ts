import { describe, expect, it } from "bun:test";
import type { BasinPort, BasinWetBody } from "../../../../../../src/domain/hydrology/modules/hydrography/model/atoms/basin-network.schema.js";
import { projectAuthoredRiverNetwork } from "../../../../../../src/recipes/standard/stages/hydrology/rivers/model/policy/authored-river-projection.js";
import { riverDirectionToReceiver } from "../../../../../../src/domain/hydrology/modules/hydrography/model/policy/river-direction.js";

function body(wetCells: number[], componentId = Math.min(...wetCells) + 1): BasinWetBody {
  return { bodyId: Math.min(...wetCells) + 1, componentId, poolId: componentId, wetCells, level: 1,
    flux: { incomingOverflow: 1, dryRunoff: 0, wetPrecipitation: 1, wetDemand: 1, balance: 1 },
    outflow: 1, unresolvedResidual: 0 };
}

function fixture() {
  const input = {
    width: 8, height: 4, landMask: new Uint8Array(32).fill(1),
    lakePlan: { lakeMask: new Uint8Array(32), bodyId: new Int32Array(32), componentId: new Int32Array(32),
      bodies: [body([12])],
      transfers: [{ componentId: 13, cellA: 12, cellB: 13, bodyA: 13, bodyB: 0, signedDischarge: 1 }],
      ports: [] as BasinPort[] },
    acceptedLakeMask: new Uint8Array(32), riverClass: new Uint8Array(32), flowDir: new Int32Array(32).fill(-1),
  };
  input.landMask[15] = 0;
  input.lakePlan.lakeMask[12] = input.acceptedLakeMask[12] = 1;
  input.lakePlan.bodyId[12] = 13;
  input.lakePlan.componentId[12] = input.lakePlan.componentId[13] = 13;
  for (const [source, receiver, riverClass] of [[10, 11, 1], [11, 12, 2], [13, 14, 2], [14, 15, 2]]) {
    input.flowDir[source!] = receiver!;
    input.riverClass[source!] = riverClass!;
  }
  return input;
}

describe("authored river lowering", () => {
  it("maps all geographic directions for both row parities and across the X seam", () => {
    const width = 8;
    const height = 6;
    for (const y of [2, 3]) for (const x of [0, 3, 7]) {
      const parity = y % 2;
      const expected = [
        ["EAST", 1, 0], ["NORTHEAST", parity, 1], ["NORTHWEST", parity - 1, 1],
        ["WEST", -1, 0], ["SOUTHWEST", parity - 1, -1], ["SOUTHEAST", parity, -1],
      ] as const;
      for (const [direction, dx, dy] of expected) {
        expect(riverDirectionToReceiver(width, height, y * width + x, (y + dy) * width + (x + dx + width) % width)).toBe(direction);
      }
    }
    expect(() => riverDirectionToReceiver(width, height, 0, width * height - 1)).toThrow(/Nonadjacent/);
    expect(() => riverDirectionToReceiver(width, height, 3, -1)).toThrow(/Invalid/);
  });

  it("preserves exact dry writes and lowers actual positive wet exchange without a wet grid receiver", () => {
    const input = fixture();
    const before = JSON.stringify(input);
    const result = projectAuthoredRiverNetwork(input);
    expect(result.writes.map(({ sourceCell, receiverCell, riverClass }) => [sourceCell, receiverCell, riverClass])).toEqual([
      [10, 11, "MINOR"], [11, 12, "NAVIGABLE"], [13, 14, "NAVIGABLE"], [14, 15, "NAVIGABLE"],
    ]);
    expect(result.authoredSourceCount).toBe(4);
    expect(result.wetTransitionWrites).toEqual([
      { bodyId: 13, role: "outlet", sourceCell: 12, receiverCell: 13, direction: "EAST", riverClass: "NAVIGABLE" },
    ]);
    expect(result.wetTransitionDispositions).toEqual([
      { bodyId: 13, transportKind: "internal", wetCell: 12, adjacentCell: 13, outwardDischarge: 1, disposition: "authored" },
    ]);
    expect(result.plannedMinorRiverTileCount).toBe(1);
    expect(result.plannedMajorRiverTileCount).toBe(3);
    expect(result.nativeMinorRiverMask[10]).toBe(1);
    expect([...result.riverMask.entries()].filter(([, value]) => value === 1).map(([cell]) => cell)).toEqual([11, 13, 14]);
    expect(JSON.stringify(input)).toBe(before);
    input.riverClass[12] = 2;
    expect(() => projectAuthoredRiverNetwork(input)).toThrow(/wet connectivity/);
    input.riverClass[12] = 0;
    input.flowDir[11] = 30;
    expect(() => projectAuthoredRiverNetwork(input)).toThrow(/Nonadjacent/);
  });

  it("does not turn inward support of a closed wet body into an outlet", () => {
    const input = fixture();
    input.lakePlan.bodies[0]!.outflow = 0;
    input.lakePlan.transfers[0]!.signedDischarge = -5.586530981;
    const result = projectAuthoredRiverNetwork(input);
    expect(result.wetTransitionWrites).toEqual([]);
    expect(result.writes).toEqual(projectAuthoredRiverNetwork(fixture()).writes);
    expect(result.wetTransitionDispositions[0]).toMatchObject({ outwardDischarge: -5.586530981, disposition: "inward-or-zero" });
  });

  it("allows distinct wet sources of one body rather than inventing one outlet per body", () => {
    const input = fixture();
    input.lakePlan.bodies[0]!.wetCells.push(20);
    input.lakePlan.lakeMask[20] = input.acceptedLakeMask[20] = 1;
    input.lakePlan.bodyId[20] = 13;
    input.lakePlan.componentId[20] = input.lakePlan.componentId[21] = 13;
    input.lakePlan.transfers.push({ componentId: 13, cellA: 20, cellB: 21, bodyA: 13, bodyB: 0, signedDischarge: 2 });
    input.riverClass[21] = 2;
    input.flowDir[21] = 22;
    expect(projectAuthoredRiverNetwork(input).wetTransitionWrites.map(({ bodyId, sourceCell }) => [bodyId, sourceCell])).toEqual([[13, 12], [13, 20]]);
  });

  it("selects one actual exchange per wet source by flow then receiver identity, preserving other dispositions", () => {
    const input = fixture();
    input.lakePlan.componentId[20] = 13;
    input.lakePlan.transfers.push({ componentId: 13, cellA: 12, cellB: 20, bodyA: 13, bodyB: 0, signedDischarge: 2 });
    input.riverClass[20] = 2;
    input.flowDir[20] = 21;
    const result = projectAuthoredRiverNetwork(input);
    expect(result.wetTransitionWrites.map(({ receiverCell }) => receiverCell)).toEqual([20]);
    expect(result.wetTransitionDispositions.map(({ disposition }) => disposition)).toEqual(["same-source-secondary", "authored"]);
    input.lakePlan.transfers.reverse();
    expect(projectAuthoredRiverNetwork(input)).toEqual(result);
    input.lakePlan.transfers.forEach((row) => { row.signedDischarge = 2; });
    expect(projectAuthoredRiverNetwork(input).wetTransitionWrites.map(({ receiverCell }) => receiverCell)).toEqual([13]);
  });

  it("lowers external wet ports with both row parities and horizontal wrap", () => {
    for (const [sourceCell, receiverCell, direction] of [[16, 23, "WEST"], [8, 0, "SOUTHWEST"], [16, 31, "NORTHWEST"]] as const) {
      const input = fixture();
      input.lakePlan.lakeMask.fill(0);
      input.lakePlan.bodyId.fill(0);
      input.lakePlan.componentId.fill(0);
      input.acceptedLakeMask.fill(0);
      input.riverClass.fill(0);
      input.flowDir.fill(-1);
      input.landMask.fill(1);
      input.lakePlan.bodies = [body([sourceCell])];
      input.lakePlan.transfers = [];
      input.lakePlan.lakeMask[sourceCell] = input.acceptedLakeMask[sourceCell] = 1;
      input.lakePlan.bodyId[sourceCell] = input.lakePlan.componentId[sourceCell] = sourceCell + 1;
      input.lakePlan.ports = [{ kind: "adjacent", componentId: sourceCell + 1, fromCell: sourceCell, toCell: receiverCell,
        destination: "dry-reach", destinationComponentId: 0, discharge: 1 }];
      input.riverClass[receiverCell] = 2;
      input.flowDir[receiverCell] = Math.floor(receiverCell / 8) * 8 + (receiverCell + 1) % 8;
      expect(projectAuthoredRiverNetwork(input).wetTransitionWrites[0]).toMatchObject({ sourceCell, receiverCell, direction });
    }
  });

  it("retains zero, MINOR, unclassified and original-marine dispositions without native wet writes", () => {
    for (const regime of ["zero", "minor", "unclassified", "marine"]) {
      const input = fixture();
      if (regime === "zero") input.lakePlan.transfers[0]!.signedDischarge = 0;
      if (regime === "minor") input.riverClass[13] = 1;
      if (regime === "unclassified" || regime === "marine") input.riverClass[13] = 0;
      if (regime === "marine") input.landMask[13] = 0;
      const before = JSON.stringify(input);
      const result = projectAuthoredRiverNetwork(input);
      expect(result.wetTransitionWrites).toEqual([]);
      expect(result.wetTransitionDispositions[0]!.disposition).toBe(regime === "zero" ? "inward-or-zero" : "receiver-not-dry-nav");
      expect(JSON.stringify(input)).toBe(before);
    }
  });

  it("never invents an adjacent native channel for a boundary export", () => {
    const input = fixture();
    input.lakePlan.transfers = [];
    input.lakePlan.componentId[4] = 13;
    input.lakePlan.ports = [{ kind: "boundary-export", componentId: 13, fromCell: 4, side: "south", discharge: 1 }];
    expect(projectAuthoredRiverNetwork(input).wetTransitionWrites).toEqual([]);
  });

  it("rejects inconsistent footprints and exchanges instead of silently filtering them", () => {
    const faults: ((input: ReturnType<typeof fixture>) => void)[] = [
      (input) => { input.acceptedLakeMask[12] = 0; },
      (input) => { input.acceptedLakeMask[15] = 1; },
      (input) => { input.landMask[12] = 0; },
      (input) => { input.lakePlan.bodies.push(input.lakePlan.bodies[0]!); },
      (input) => { input.lakePlan.bodyId[12] = 8; },
      (input) => { input.lakePlan.bodies[0]!.wetCells.push(12); },
      (input) => { input.lakePlan.transfers[0]!.bodyA = 0; },
      (input) => { input.lakePlan.transfers[0]!.cellB = 30; },
      (input) => { input.lakePlan.transfers[0]!.signedDischarge = Number.NaN; },
      (input) => { input.lakePlan.transfers.push(input.lakePlan.transfers[0]!); },
      (input) => { input.lakePlan.bodies = []; },
      (input) => { input.lakePlan.bodyId[10] = 13; },
      (input) => { input.lakePlan.componentId[12] = 0; },
    ];
    for (const fault of faults) {
      const input = fixture();
      fault(input);
      expect(() => projectAuthoredRiverNetwork(input)).toThrow();
    }
  });
});
