import { describe, expect, it } from "bun:test";

import {
  CIV7_STANDARD_MAP_SIZE_PRESETS,
  findCiv7StandardMapSizePreset,
  getCiv7StandardMapSizePreset,
  getCiv7StandardMapSizePresetForDimensions,
} from "../src/map-metadata.js";

describe("Civ7 standard map-size policy", () => {
  it("owns the closed official catalog in game selection order", () => {
    const expectedIds = [
      "MAPSIZE_TINY",
      "MAPSIZE_SMALL",
      "MAPSIZE_STANDARD",
      "MAPSIZE_LARGE",
      "MAPSIZE_HUGE",
    ] as const;

    expect(CIV7_STANDARD_MAP_SIZE_PRESETS.map(({ id }) => id)).toEqual([...expectedIds]);
    for (const id of expectedIds) {
      expect(getCiv7StandardMapSizePreset(id).id).toBe(id);
    }
  });

  it("keeps runtime and dimension lookup explicitly nullable", () => {
    const standard = getCiv7StandardMapSizePreset("MAPSIZE_STANDARD");
    expect(findCiv7StandardMapSizePreset("MAPSIZE_STANDARD")).toBe(standard);
    expect(getCiv7StandardMapSizePresetForDimensions(84, 54)).toBe(standard);
    expect(findCiv7StandardMapSizePreset("MAPSIZE_CUSTOM")).toBeNull();
    expect(findCiv7StandardMapSizePreset(3)).toBeNull();
    expect(getCiv7StandardMapSizePresetForDimensions(1, 1)).toBeNull();
  });
});
