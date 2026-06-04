import { describe, expect, it } from "bun:test";

import { materializeNavigableRiverMask } from "../../src/recipes/standard/projection-policies/navigableRiverMaterialization.js";

describe("navigable river materialization", () => {
  it("selects high-discharge trunk channels and ignores short fragments", () => {
    const width = 8;
    const height = 3;
    const size = width * height;
    const riverClass = new Uint8Array(size);
    const discharge = new Float32Array(size);
    const flowDir = new Int32Array(size).fill(-1);
    const projectableLandMask = new Uint8Array(size).fill(1);

    for (let x = 0; x < 5; x++) {
      const index = x;
      riverClass[index] = 1;
      discharge[index] = x + 1;
      flowDir[index] = x < 4 ? x + 1 : -1;
    }

    for (let x = 0; x < 3; x++) {
      const index = width + x;
      riverClass[index] = 1;
      discharge[index] = 10 + x;
      flowDir[index] = x < 2 ? width + x + 1 : -1;
    }

    const result = materializeNavigableRiverMask({
      width,
      height,
      riverClass,
      discharge,
      flowDir,
      projectableLandMask,
      minLength: 5,
      maxLength: 15,
      targetTileCount: 8,
    });

    expect(result.selectedTileCount).toBe(5);
    expect(result.selectedChainCount).toBe(1);
    for (let x = 0; x < 5; x++) expect(result.riverMask[x]).toBe(1);
    for (let x = 0; x < 3; x++) expect(result.riverMask[width + x]).toBe(0);
  });
});
