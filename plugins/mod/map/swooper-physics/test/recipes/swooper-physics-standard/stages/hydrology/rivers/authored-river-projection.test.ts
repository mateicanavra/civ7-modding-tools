import { describe, expect, it } from "bun:test";
import { projectAuthoredRiverNetwork, riverDirectionToReceiver } from "../../../../../../src/recipes/standard/stages/hydrology/rivers/model/policy/authored-river-projection.js";

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

  it("keeps minor, navigable lake inlet, and dry sill outlet sources without writing wet connectivity", () => {
    const input = {
      width: 8, height: 4,
      landMask: new Uint8Array(32).fill(1), lakeMask: new Uint8Array(32),
      riverClass: new Uint8Array(32), flowDir: new Int32Array(32).fill(-1),
    };
    input.landMask[15] = 0;
    input.lakeMask[12] = 1;
    for (const [source, receiver, riverClass] of [[10, 11, 1], [11, 12, 2], [12, 13, 0], [13, 14, 2], [14, 15, 2]]) {
      input.flowDir[source!] = receiver!;
      input.riverClass[source!] = riverClass!;
    }
    const before = Array.from(input.flowDir);
    const result = projectAuthoredRiverNetwork(input);
    expect(result.writes.map(({ sourceCell, receiverCell, riverClass }) => [sourceCell, receiverCell, riverClass])).toEqual([
      [10, 11, "MINOR"], [11, 12, "NAVIGABLE"], [13, 14, "NAVIGABLE"], [14, 15, "NAVIGABLE"],
    ]);
    expect(result.authoredSourceCount).toBe(4);
    expect(result.riverMask[12]).toBe(0);
    expect(result.nativeMinorRiverMask[10]).toBe(1);
    expect(Array.from(input.flowDir)).toEqual(before);
    input.riverClass[12] = 2;
    expect(() => projectAuthoredRiverNetwork(input)).toThrow(/wet connectivity/);
    input.riverClass[12] = 0;
    input.flowDir[11] = 30;
    expect(() => projectAuthoredRiverNetwork(input)).toThrow(/Nonadjacent/);
  });
});
