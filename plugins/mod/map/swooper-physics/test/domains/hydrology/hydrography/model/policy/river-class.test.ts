import { describe, expect, it } from "bun:test";
import {
  isAnyRiverClass,
  isMajorRiverClass,
  isMinorRiverClass,
  isValidRiverClass,
  RIVER_CLASS_MAJOR,
  RIVER_CLASS_MINOR,
  RIVER_CLASS_NONE,
} from "../../../../../../src/domain/hydrology/modules/hydrography/model/policy/river-class.js";

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
});
