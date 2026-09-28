import { describe, expect, it } from "bun:test";
import { projectAuthoredRiverNetwork, riverDirectionToReceiver } from "../../../../../../src/recipes/standard/stages/hydrology/rivers/model/policy/authored-river-projection.js";

function body(nodeId: number, wetCells: number[], outletCell: number, receiverCell: number) {
  return { nodeId, wetCells, outletCell, receiverCell, outflow: 1, spillElevation: 1,
    floorCell: wetCells[0]!, floorElevation: 0, connectorCells: [receiverCell],
    flux: { incomingOverflow: 1, dryRunoff: 0, wetPrecipitation: 1, wetDemand: 1, balance: 1 } };
}

function fixture() {
  const input = {
    width: 8, height: 4,
    landMask: new Uint8Array(32).fill(1),
    lakePlan: { lakeMask: new Uint8Array(32), bodyId: new Int32Array(32),
      bodies: [body(7, [12], 12, 13)], certificates: [{ nodeId: 7, spillBalance: 1 }] },
    acceptedLakeMask: new Uint8Array(32),
    riverClass: new Uint8Array(32), flowDir: new Int32Array(32).fill(-1),
  };
  input.landMask[15] = 0;
  input.lakePlan.lakeMask[12] = 1;
  input.lakePlan.bodyId[12] = 7;
  input.acceptedLakeMask[12] = 1;
  for (const [source, receiver, riverClass] of [[10, 11, 1], [11, 12, 2], [12, 13, 0], [13, 14, 2], [14, 15, 2]]) {
    input.flowDir[source!] = receiver!;
    input.riverClass[source!] = riverClass!;
  }
  return input;
}

describe("authored river lowering", () => {
  it("maps all geographic directions for both row parities and across the X seam", () => {
    const width = 8;
    const height = 6;
    for (const y of [2, 3]) {
      for (const x of [0, 3, 7]) {
        const parity = y % 2;
        const expected = [
          ["EAST", 1, 0], ["NORTHEAST", parity, 1], ["NORTHWEST", parity - 1, 1],
          ["WEST", -1, 0], ["SOUTHWEST", parity - 1, -1], ["SOUTHEAST", parity, -1],
        ] as const;
        for (const [direction, dx, dy] of expected) {
          expect(riverDirectionToReceiver(width, height, y * width + x, (y + dy) * width + (x + dx + width) % width)).toBe(direction);
        }
      }
    }
    expect(() => riverDirectionToReceiver(width, height, 0, width * height - 1)).toThrow(/Nonadjacent/);
    expect(() => riverDirectionToReceiver(width, height, 3, -1)).toThrow(/Invalid/);
  });

  it("keeps exact dry writes, counts and masks while separately declaring a singleton wet NAV outlet", () => {
    const input = fixture();
    const before = JSON.stringify(input);
    const result = projectAuthoredRiverNetwork(input);
    expect(result.writes.map(({ sourceCell, receiverCell, riverClass }) => [sourceCell, receiverCell, riverClass])).toEqual([
      [10, 11, "MINOR"], [11, 12, "NAVIGABLE"], [13, 14, "NAVIGABLE"], [14, 15, "NAVIGABLE"],
    ]);
    expect(result.authoredSourceCount).toBe(4);
    expect(result.riverMask[12]).toBe(0);
    expect(result.nativeMinorRiverMask[10]).toBe(1);
    expect(result.wetTransitionWrites).toEqual([
      { bodyId: 7, role: "outlet", sourceCell: 12, receiverCell: 13, direction: "EAST", riverClass: "NAVIGABLE" },
    ]);
    expect(result.plannedMinorRiverTileCount).toBe(1);
    expect(result.plannedMajorRiverTileCount).toBe(3);
    expect([...result.riverMask.entries()].filter(([, value]) => value === 1).map(([cell]) => cell)).toEqual([11, 13, 14]);
    expect(JSON.stringify(input)).toBe(before);
    input.riverClass[12] = 2;
    expect(() => projectAuthoredRiverNetwork(input)).toThrow(/wet connectivity/);
    input.riverClass[12] = 0;
    input.flowDir[11] = 30;
    expect(() => projectAuthoredRiverNetwork(input)).toThrow(/Nonadjacent/);
  });

  it("declares only the recorded outlet of a multi-cell lake, not inlet paths or every wet cell", () => {
    const input = fixture();
    input.lakePlan.bodies[0]!.wetCells.push(20, 21);
    for (const cell of [20, 21]) {
      input.lakePlan.lakeMask[cell] = 1;
      input.lakePlan.bodyId[cell] = 7;
      input.acceptedLakeMask[cell] = 1;
    }
    input.flowDir[20] = 12;
    input.flowDir[21] = 20;
    const result = projectAuthoredRiverNetwork(input);
    expect(result.wetTransitionWrites.map(({ sourceCell }) => sourceCell)).toEqual([12]);
    expect(result.writes).toEqual(projectAuthoredRiverNetwork(fixture()).writes);
    expect(result.authoredSourceCount).toBe(4);
  });

  it("orders multiple bodies by wet source identity without duplicating or changing dry writes", () => {
    const input = fixture();
    input.lakePlan.bodies.unshift(body(3, [20], 20, 21));
    input.lakePlan.certificates.unshift({ nodeId: 3, spillBalance: 1 });
    input.lakePlan.lakeMask[20] = input.acceptedLakeMask[20] = 1;
    input.lakePlan.bodyId[20] = 3;
    input.flowDir[20] = 21;
    input.flowDir[21] = 22;
    input.riverClass[21] = 2;
    const result = projectAuthoredRiverNetwork(input);
    expect(result.wetTransitionWrites.map(({ bodyId, sourceCell }) => [bodyId, sourceCell])).toEqual([[7, 12], [3, 20]]);
    expect(result.writes.map(({ sourceCell }) => sourceCell)).toEqual([10, 11, 13, 14, 21]);
  });

  it("lowers wet outlet directions with both row parities and horizontal wrap", () => {
    for (const [sourceCell, receiverCell, direction] of [[16, 23, "WEST"], [8, 0, "SOUTHWEST"], [16, 31, "NORTHWEST"]] as const) {
      const input = fixture();
      input.lakePlan.lakeMask.fill(0);
      input.lakePlan.bodyId.fill(0);
      input.acceptedLakeMask.fill(0);
      input.riverClass.fill(0);
      input.flowDir.fill(-1);
      input.landMask.fill(1);
      input.lakePlan.bodies = [body(7, [sourceCell], sourceCell, receiverCell)];
      input.lakePlan.lakeMask[sourceCell] = input.acceptedLakeMask[sourceCell] = 1;
      input.lakePlan.bodyId[sourceCell] = 7;
      input.riverClass[receiverCell] = 2;
      input.flowDir[sourceCell] = receiverCell;
      input.flowDir[receiverCell] = Math.floor(receiverCell / 8) * 8 + (receiverCell + 1) % 8;
      expect(projectAuthoredRiverNetwork(input).wetTransitionWrites[0]).toMatchObject({ sourceCell, receiverCell, direction });
    }
  });

  it("leaves zero outflow, MINOR, unclassified and original-marine receivers unchanged", () => {
    for (const regime of ["zero", "minor", "unclassified", "marine"]) {
      const input = fixture();
      if (regime === "zero") input.lakePlan.bodies[0]!.outflow = 0;
      if (regime === "minor") input.riverClass[13] = 1;
      if (regime === "unclassified" || regime === "marine") input.riverClass[13] = 0;
      if (regime === "marine") input.landMask[13] = 0;
      const before = JSON.stringify(input);
      expect(projectAuthoredRiverNetwork(input).wetTransitionWrites).toEqual([]);
      expect(JSON.stringify(input)).toBe(before);
    }
  });

  it("does not promote a direct wet-body receiver into a dry NAV outlet", () => {
    const input = fixture();
    input.lakePlan.bodies.push(body(8, [13], 13, 14));
    input.lakePlan.certificates.push({ nodeId: 8, spillBalance: 1 });
    input.lakePlan.lakeMask[13] = input.acceptedLakeMask[13] = 1;
    input.lakePlan.bodyId[13] = 8;
    input.riverClass[13] = 0;
    expect(projectAuthoredRiverNetwork(input).wetTransitionWrites.map(({ bodyId }) => bodyId)).toEqual([8]);
  });

  it("rejects incomplete acceptance, marine footprints, uncertified bodies and inconsistent outlet records instead of filtering", () => {
    const faults: ((input: ReturnType<typeof fixture>) => void)[] = [
      (input) => { input.acceptedLakeMask[12] = 0; },
      (input) => { input.acceptedLakeMask[15] = 1; },
      (input) => { input.landMask[12] = 0; },
      (input) => { input.lakePlan.certificates = []; },
      (input) => { input.lakePlan.certificates[0]!.spillBalance = 0; },
      (input) => { input.lakePlan.bodies.push(input.lakePlan.bodies[0]!); },
      (input) => { input.lakePlan.bodyId[12] = 8; },
      (input) => { input.lakePlan.bodies[0]!.wetCells.push(12); },
      (input) => { input.lakePlan.bodies[0]!.outletCell = 11; },
      (input) => { input.flowDir[12] = 11; },
      (input) => { input.flowDir[12] = input.lakePlan.bodies[0]!.receiverCell = 30; },
      (input) => { input.lakePlan.bodies[0]!.outflow = Number.NaN; },
      (input) => { input.lakePlan.bodies = []; },
      (input) => { input.lakePlan.bodyId[10] = 7; },
    ];
    for (const fault of faults) {
      const input = fixture();
      fault(input);
      expect(() => projectAuthoredRiverNetwork(input)).toThrow();
    }
    const partial = fixture();
    partial.lakePlan.bodies[0]!.wetCells.push(20);
    partial.lakePlan.lakeMask[20] = 1;
    partial.lakePlan.bodyId[20] = 7;
    expect(() => projectAuthoredRiverNetwork(partial)).toThrow(/complete accepted/);
  });
});
