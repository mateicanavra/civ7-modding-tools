import { describe, expect, it } from "bun:test";

import {
  CIV7_STANDARD_MAP_SIZE_PRESETS,
  findCiv7StandardMapSizePreset,
  getCiv7StandardMapSizePreset,
} from "../src/map-metadata.js";

describe("Civ7 standard map-size metadata", () => {
  it("keeps the closed catalog total and in game selection order", () => {
    const expectedIds = [
      "MAPSIZE_TINY",
      "MAPSIZE_SMALL",
      "MAPSIZE_STANDARD",
      "MAPSIZE_LARGE",
      "MAPSIZE_HUGE",
    ] as const;

    expect(CIV7_STANDARD_MAP_SIZE_PRESETS.map(({ id }) => id)).toEqual([...expectedIds]);
    for (const id of expectedIds) expect(getCiv7StandardMapSizePreset(id).id).toBe(id);
  });

  it("keeps dynamic runtime lookup explicitly nullable", () => {
    expect(findCiv7StandardMapSizePreset("MAPSIZE_STANDARD")).toBe(
      getCiv7StandardMapSizePreset("MAPSIZE_STANDARD")
    );
    expect(findCiv7StandardMapSizePreset("MAPSIZE_CUSTOM")).toBeNull();
    expect(findCiv7StandardMapSizePreset(3)).toBeNull();
  });
});
