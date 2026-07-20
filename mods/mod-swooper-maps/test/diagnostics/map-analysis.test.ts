import { describe, expect, it } from "bun:test";

import { getCiv7StandardMapSizePreset } from "@civ7/adapter";
import { summarizeSwooperLandMask } from "../../scripts/diagnostics/map-analysis.js";

const tinyMapSize = getCiv7StandardMapSizePreset("MAPSIZE_TINY");

const { width, height } = tinyMapSize.dimensions;
const mapSize = width * height;

describe("Swooper land-mask summary", () => {
  it("uses periodic Civ7 adjacency while treating only one as land", () => {
    const values = new Uint8Array(mapSize);
    const row = 10;
    values[row * width] = 1;
    values[row * width + width - 1] = 1;
    values[20 * width + 20] = 1;
    values[21 * width + 30] = 2;

    expect(summarizeSwooperLandMask(values, width, height)).toEqual({
      land: 3,
      water: mapSize - 3,
      pctLand: 3 / mapSize,
      landComponents: 2,
      largestLandComponent: 2,
      largestLandFrac: 2 / 3,
      totalLand: 3,
    });
  });

  it("reports an all-water Civ7 map without inventing a component", () => {
    expect(summarizeSwooperLandMask(new Uint8Array(mapSize), width, height)).toEqual({
      land: 0,
      water: mapSize,
      pctLand: 0,
      landComponents: 0,
      largestLandComponent: 0,
      largestLandFrac: 0,
      totalLand: 0,
    });
  });

  it("refuses masks that do not cover the selected Civ7 map", () => {
    expect(() => summarizeSwooperLandMask(new Uint8Array(mapSize - 1), width, height)).toThrow(
      `Swooper land-mask size mismatch: values=${mapSize - 1} dims=${mapSize}`
    );
  });
});
