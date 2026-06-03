import { describe, expect, it } from "vitest";

import {
  boundsForTileGrid,
  tileCenterForRenderSpace,
  tilePointForRenderSpace,
} from "../../src/features/viz/deckgl/render";

describe("deckgl tile render projection", () => {
  it("renders odd-q tile grids as column-offset rectangles without axial shear", () => {
    const sqrt3 = Math.sqrt(3);

    expect(tileCenterForRenderSpace("tile.hexOddQ", 0, 0, 1)).toEqual([0, 0]);
    expect(tileCenterForRenderSpace("tile.hexOddQ", 0, 1, 1)).toEqual([0, sqrt3]);
    expect(tileCenterForRenderSpace("tile.hexOddQ", 1, 0, 1)).toEqual([1.5, sqrt3 / 2]);
    expect(tileCenterForRenderSpace("tile.hexOddQ", 1, 1, 1)).toEqual([1.5, sqrt3 * 1.5]);

    expect(tilePointForRenderSpace("tile.hexOddQ", 0, 1, 1)[0]).toBe(0);
    expect(tilePointForRenderSpace("tile.hexOddQ", 1, 1, 1)[0]).toBe(1.5);

    const bounds = boundsForTileGrid("tile.hexOddQ", { width: 4, height: 3 }, 1);
    expect(bounds[0]).toBeCloseTo(-1);
    expect(bounds[1]).toBeCloseTo(-sqrt3 / 2);
    expect(bounds[2]).toBeCloseTo(5.5);
    expect(bounds[3]).toBeCloseTo(sqrt3 * 3);
  });

  it("keeps odd-r tile grids as row-offset pointy hexes", () => {
    const sqrt3 = Math.sqrt(3);

    expect(tileCenterForRenderSpace("tile.hexOddR", 0, 0, 1)).toEqual([0, 0]);
    expect(tileCenterForRenderSpace("tile.hexOddR", 1, 0, 1)).toEqual([sqrt3, 0]);
    expect(tileCenterForRenderSpace("tile.hexOddR", 0, 1, 1)).toEqual([sqrt3 / 2, 1.5]);
  });
});
