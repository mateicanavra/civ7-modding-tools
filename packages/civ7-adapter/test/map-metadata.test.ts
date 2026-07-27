import { describe, expect, it } from "bun:test";
import {
  getCiv7StandardMapSizePreset as getPolicyStandardMapSizePreset,
  CIV7_STANDARD_MAP_SIZE_PRESETS as POLICY_STANDARD_MAP_SIZE_PRESETS,
} from "@civ7/map-policy";
import {
  CIV7_STANDARD_MAP_SIZE_PRESETS,
  findCiv7StandardMapSizePreset,
  findCiv7StandardMapSizePresetForMapInfo,
  getCiv7StandardMapSizePreset,
} from "../src/map-metadata.js";
import type { MapInfo } from "../src/types.js";

const closedMapInfoFixture: MapInfo = { Description: null, GridWidth: 60 };
// @ts-expect-error `MapInfo` accepts only columns generated from Civ7's official Maps table.
const mapInfoWithInventedColumn: MapInfo = { InventedColumn: true };
void closedMapInfoFixture;
void mapInfoWithInventedColumn;

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
    expect(findCiv7StandardMapSizePresetForMapInfo({ MapSizeType: "MAPSIZE_STANDARD" })).toBe(
      getCiv7StandardMapSizePreset("MAPSIZE_STANDARD")
    );
    expect(findCiv7StandardMapSizePresetForMapInfo({})).toBeNull();
  });

  it("re-exports the policy-owned catalog without an adapter-owned copy", () => {
    expect(CIV7_STANDARD_MAP_SIZE_PRESETS).toBe(POLICY_STANDARD_MAP_SIZE_PRESETS);
    expect(getCiv7StandardMapSizePreset("MAPSIZE_HUGE")).toBe(
      getPolicyStandardMapSizePreset("MAPSIZE_HUGE")
    );
  });
});
