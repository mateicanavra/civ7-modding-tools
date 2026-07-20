import { describe, expect, it } from "bun:test";
import {
  findInvalidRiverClassIndex,
  isAnyRiverClass,
  isMajorRiverClass,
  isMinorRiverClass,
  isValidRiverClass,
  RIVER_CLASS_MAJOR,
  RIVER_CLASS_MINOR,
  RIVER_CLASS_NONE,
} from "@mapgen/domain/hydrology/model/policy/river-class.js";

describe("hydrology river class contract", () => {
  it("keeps minor and major/projectable river intent distinct", () => {
    expect(isValidRiverClass(RIVER_CLASS_NONE)).toBe(true);
    expect(isValidRiverClass(RIVER_CLASS_MINOR)).toBe(true);
    expect(isValidRiverClass(RIVER_CLASS_MAJOR)).toBe(true);
    expect(isValidRiverClass(3)).toBe(true);
    expect(isValidRiverClass(-1)).toBe(false);
    expect(isValidRiverClass(1.5)).toBe(false);
    expect(isValidRiverClass(undefined)).toBe(false);

    expect(isAnyRiverClass(RIVER_CLASS_NONE)).toBe(false);
    expect(isMinorRiverClass(RIVER_CLASS_MINOR)).toBe(true);
    expect(isMajorRiverClass(RIVER_CLASS_MINOR)).toBe(false);
    expect(isMajorRiverClass(RIVER_CLASS_MAJOR)).toBe(true);
    expect(isMajorRiverClass(3)).toBe(true);
  });

  it("accepts generated Uint8 river classes as hydrology-owned non-negative intent", () => {
    expect(findInvalidRiverClassIndex(new Uint8Array([0, 1, 2, 3]))).toBe(-1);
  });
});
