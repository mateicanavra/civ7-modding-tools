import { describe, expect, it } from "bun:test";

import { computeOceanGeometry } from "../src/domain/hydrology/ops/compute-ocean-geometry/rules/index.js";

function idx(x: number, y: number, width: number): number {
  return y * width + x;
}

describe("hydrology/compute-ocean-geometry", () => {
  it("labels basins with X-wrap connectivity", () => {
    const width = 6;
    const height = 4;
    const isWaterMask = new Uint8Array(width * height);

    // Two water tiles that are adjacent via wrap: (0,1) and (5,1).
    isWaterMask[idx(0, 1, width)] = 1;
    isWaterMask[idx(5, 1, width)] = 1;

    const out = computeOceanGeometry(width, height, isWaterMask, {
      maxCoastDistance: 16,
      maxCoastVectorDistance: 8,
    });

    expect(out.basinId[idx(0, 1, width)]).toBeGreaterThan(0);
    expect(out.basinId[idx(5, 1, width)]).toBe(out.basinId[idx(0, 1, width)]);
  });

  it("computes coastDistance over water from coastal water sources", () => {
    const width = 7;
    const height = 7;
    const isWaterMask = new Uint8Array(width * height);

    // A 3x3 water patch surrounded by land.
    for (let y = 2; y <= 4; y++) {
      for (let x = 2; x <= 4; x++) {
        isWaterMask[idx(x, y, width)] = 1;
      }
    }

    const out = computeOceanGeometry(width, height, isWaterMask, {
      maxCoastDistance: 64,
      maxCoastVectorDistance: 10,
    });

    const center = idx(3, 3, width);
    const edge = idx(2, 2, width);

    expect(out.coastDistance[edge]).toBe(0);
    expect(out.coastDistance[center]).toBeGreaterThan(0);
    expect(out.coastDistance[center]).toBeLessThan(0xffff);
  });
});

