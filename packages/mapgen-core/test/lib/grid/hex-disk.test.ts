import { describe, expect, it } from "bun:test";

import {
  forEachHexNeighborOddQ,
  forEachHexNeighborOddQWithDirection,
  forEachHexWithinDistanceOddQ,
  hasMaskWithinHexDistanceOddQ,
  HEX_ODD_Q_TILE_SPACE_ID,
} from "../../../src/lib/grid/index.js";

describe("hex-disk helpers", () => {
  it("walks odd-q hex distance with horizontal wrapping", () => {
    const width = 5;
    const height = 3;
    const seen = new Map<number, number>();

    forEachHexWithinDistanceOddQ(
      { centerIndex: 1 * width + 0, width, height, maxDistance: 1 },
      (index, distance) => {
        seen.set(index, distance);
      }
    );

    expect(seen.get(1 * width + 0)).toBe(0);
    expect(seen.get(1 * width + 4)).toBe(1);
    expect(seen.size).toBe(7);
  });

  it("detects masks inside a bounded hex radius", () => {
    const width = 5;
    const height = 3;
    const mask = new Uint8Array(width * height);
    mask[1 * width + 4] = 1;

    expect(
      hasMaskWithinHexDistanceOddQ({
        mask,
        centerIndex: 1 * width + 0,
        width,
        height,
        maxDistance: 1,
      })
    ).toBe(true);
    expect(
      hasMaskWithinHexDistanceOddQ({
        mask,
        centerIndex: 1 * width + 1,
        width,
        height,
        maxDistance: 1,
      })
    ).toBe(false);
  });

  it("exposes the canonical odd-q tile space used by MapGen layers", () => {
    expect(HEX_ODD_Q_TILE_SPACE_ID).toBe("tile.hexOddQ");
  });

  it("reports directional odd-q neighbors in the same order as the base iterator", () => {
    const width = 5;
    const height = 4;
    const base: number[] = [];
    const directed: Array<{ index: number; direction: number }> = [];

    forEachHexNeighborOddQ(1, 1, width, height, (nx, ny) => {
      base.push(ny * width + nx);
    });
    forEachHexNeighborOddQWithDirection(1, 1, width, height, (nx, ny, direction) => {
      directed.push({ index: ny * width + nx, direction });
    });

    expect(directed.map((entry) => entry.index)).toEqual(base);
    expect(directed.map((entry) => entry.direction)).toEqual([0, 1, 2, 3, 4, 5]);
  });
});
