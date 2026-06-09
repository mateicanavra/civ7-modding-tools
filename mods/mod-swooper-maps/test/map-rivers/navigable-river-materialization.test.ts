import { describe, expect, it } from "bun:test";

import {
  RIVER_CLASS_MAJOR,
  RIVER_CLASS_MINOR,
} from "../../src/domain/hydrology/river-class.js";
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
      riverClass[index] = RIVER_CLASS_MAJOR;
      discharge[index] = x + 1;
      flowDir[index] = x < 4 ? x + 1 : -1;
    }

    for (let x = 0; x < 3; x++) {
      const index = width + x;
      riverClass[index] = RIVER_CLASS_MAJOR;
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
    expect(result.plannedMinorRiverTileCount).toBe(0);
    expect(result.plannedMajorRiverTileCount).toBe(8);
    for (let x = 0; x < 5; x++) expect(result.riverMask[x]).toBe(1);
    for (let x = 0; x < 3; x++) expect(result.riverMask[width + x]).toBe(0);
  });

  it("does not promote minor rivers into navigable river terrain", () => {
    const width = 6;
    const height = 2;
    const size = width * height;
    const riverClass = new Uint8Array(size);
    const discharge = new Float32Array(size);
    const flowDir = new Int32Array(size).fill(-1);
    const projectableLandMask = new Uint8Array(size).fill(1);

    for (let x = 0; x < width; x++) {
      riverClass[x] = RIVER_CLASS_MINOR;
      discharge[x] = 100 + x;
      flowDir[x] = x < width - 1 ? x + 1 : -1;
    }

    const result = materializeNavigableRiverMask({
      width,
      height,
      riverClass,
      discharge,
      flowDir,
      projectableLandMask,
      minLength: 3,
      maxLength: 12,
      targetTileCount: 6,
    });

    expect(result.plannedMinorRiverTileCount).toBe(6);
    expect(result.plannedMajorRiverTileCount).toBe(0);
    expect(result.eligibleTileCount).toBe(0);
    expect(result.selectedTileCount).toBe(0);
    expect([...result.riverMask]).toEqual(new Array(size).fill(0));
    for (let x = 0; x < width; x++) expect(result.plannedMinorRiverMask[x]).toBe(1);
  });
});
