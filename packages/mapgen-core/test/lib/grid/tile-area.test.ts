import { describe, expect, it } from "bun:test";

import { resolveTileAreaSpacingTarget } from "@mapgen/lib/grid/tile-area.js";

describe("grid/tile-area", () => {
  it("derives target counts from tile area and representative spacing", () => {
    const spacingTiles = Math.sqrt((106 * 66) / 18);

    expect(resolveTileAreaSpacingTarget({ width: 60, height: 38, spacingTiles })).toBe(6);
    expect(resolveTileAreaSpacingTarget({ width: 74, height: 46, spacingTiles })).toBe(9);
    expect(resolveTileAreaSpacingTarget({ width: 84, height: 54, spacingTiles })).toBe(12);
    expect(resolveTileAreaSpacingTarget({ width: 96, height: 60, spacingTiles })).toBe(15);
    expect(resolveTileAreaSpacingTarget({ width: 106, height: 66, spacingTiles })).toBe(18);
  });

  it("returns zero for empty maps or disabled spacing", () => {
    expect(resolveTileAreaSpacingTarget({ width: 0, height: 66, spacingTiles: 10 })).toBe(0);
    expect(resolveTileAreaSpacingTarget({ width: 106, height: 66, spacingTiles: 0 })).toBe(0);
  });
});
