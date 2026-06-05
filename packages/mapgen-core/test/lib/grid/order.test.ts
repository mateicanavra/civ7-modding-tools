import { describe, expect, it } from "bun:test";

import { buildDispersedGridOrder } from "../../../src/lib/grid/order.js";

describe("dispersed grid order", () => {
  it("returns each plot exactly once", () => {
    const order = buildDispersedGridOrder({ width: 11, height: 7, sectorCols: 4, sectorRows: 3 });

    expect(order).toHaveLength(77);
    expect(new Set(order).size).toBe(77);
    expect(Math.min(...order)).toBe(0);
    expect(Math.max(...order)).toBe(76);
  });

  it("spreads early candidates across sectors instead of row-major bands", () => {
    const width = 16;
    const height = 8;
    const order = buildDispersedGridOrder({ width, height, sectorCols: 4, sectorRows: 4 });
    const firstSectorRows = new Set(
      order.slice(0, 16).map((plotIndex) => Math.floor((((plotIndex / width) | 0) * 4) / height))
    );
    const firstSectorCols = new Set(
      order.slice(0, 16).map((plotIndex) => Math.floor(((plotIndex % width) * 4) / width))
    );

    expect(firstSectorRows.size).toBeGreaterThanOrEqual(3);
    expect(firstSectorCols.size).toBeGreaterThanOrEqual(3);
    expect(order.slice(0, 16).every((plotIndex) => plotIndex < width)).toBe(false);
  });
});
