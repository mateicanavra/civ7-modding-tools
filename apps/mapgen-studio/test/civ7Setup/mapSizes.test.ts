import { CIV7_STANDARD_MAP_SIZE_PRESETS } from "@civ7/map-policy";
import { describe, expect, it } from "vitest";

import {
  CIV7_STUDIO_MAP_SIZE_PRESETS,
  getCiv7MapSizePlayerCapacity,
  getCiv7MapSizePreset,
  getCiv7PlayerCountOptions,
  normalizeCiv7WorldSettings,
} from "../../src/features/civ7Setup/mapSizes";
import { MAP_SIZE_OPTIONS } from "../../src/ui/constants/options";

const PRESET_CAPACITIES = [
  ["MAPSIZE_TINY", 4],
  ["MAPSIZE_SMALL", 6],
  ["MAPSIZE_STANDARD", 8],
  ["MAPSIZE_LARGE", 10],
  ["MAPSIZE_HUGE", 12],
] as const;

describe("Studio Civ7 map-size policy", () => {
  it("projects every visible map-size option from generated map policy", () => {
    expect(CIV7_STUDIO_MAP_SIZE_PRESETS).toBe(CIV7_STANDARD_MAP_SIZE_PRESETS);
    expect(MAP_SIZE_OPTIONS).toEqual(
      CIV7_STANDARD_MAP_SIZE_PRESETS.map(({ id, label, dimensions }) => ({
        value: id,
        label,
        dimensions: `${dimensions.width}×${dimensions.height}`,
        width: dimensions.width,
        height: dimensions.height,
      }))
    );
  });

  it("refuses unknown map-size identities instead of silently selecting another preset", () => {
    expect(() => Reflect.apply(getCiv7MapSizePreset, undefined, ["MAPSIZE_UNKNOWN"])).toThrow(
      "Unknown Civ7 Standard map-size id"
    );
  });

  it.each(
    PRESET_CAPACITIES
  )("limits %s player selections to its %i official homeland slots", (mapSize, capacity) => {
    expect(getCiv7MapSizePlayerCapacity(mapSize)).toBe(capacity);
    expect(getCiv7PlayerCountOptions(mapSize)).toEqual(
      Array.from({ length: capacity - 1 }, (_, index) => index + 2)
    );
    expect(
      normalizeCiv7WorldSettings({
        mapSize,
        playerCount: capacity + 10,
        resources: "balanced",
      })
    ).toEqual({ mapSize, playerCount: capacity, resources: "balanced" });
    expect(
      normalizeCiv7WorldSettings({
        mapSize,
        playerCount: capacity - 1,
        resources: "strategic",
      })
    ).toEqual({ mapSize, playerCount: capacity - 1, resources: "strategic" });
  });

  it("shrinks a previously valid Huge roster when the selected map becomes Tiny", () => {
    expect(
      normalizeCiv7WorldSettings({
        mapSize: "MAPSIZE_TINY",
        playerCount: 12,
        resources: "balanced",
      })
    ).toEqual({ mapSize: "MAPSIZE_TINY", playerCount: 4, resources: "balanced" });
  });
});
