import { describe, expect, it } from "bun:test";

import { computeHexDistanceToMask } from "../../../src/lib/grid/distance-to-mask.js";

describe("computeHexDistanceToMask", () => {
  it("computes odd-q hex distances from all source mask tiles", () => {
    const width = 5;
    const height = 3;
    const mask = new Uint8Array(width * height);
    mask[1 * width + 2] = 1;

    const distance = computeHexDistanceToMask({ mask, width, height, maxDistance: 1 });

    expect(distance[1 * width + 2]).toBe(0);
    expect(distance[1 * width + 1]).toBe(1);
    expect(distance[1 * width + 3]).toBe(1);
    expect(distance[0 * width + 2]).toBe(1);
    expect(distance[2 * width + 2]).toBe(1);
    expect(distance[0 * width + 0]).toBe(255);
    expect(distance[2 * width + 4]).toBe(255);
  });

  it("leaves every tile unreached when the source mask is empty", () => {
    const distance = computeHexDistanceToMask({
      mask: new Uint8Array(6),
      width: 3,
      height: 2,
      maxDistance: 3,
    });

    expect(Array.from(distance)).toEqual([255, 255, 255, 255, 255, 255]);
  });
});
