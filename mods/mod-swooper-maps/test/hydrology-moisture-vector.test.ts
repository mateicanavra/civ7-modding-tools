import { describe, expect, it } from "bun:test";

import { vectorStrategy } from "../src/domain/hydrology/ops/transport-moisture/strategies/vector.js";

function idx(x: number, y: number, width: number): number {
  return y * width + x;
}

describe("hydrology/transport-moisture (vector)", () => {
  it("advects humidity downwind (eastward)", () => {
    const width = 16;
    const height = 8;
    const size = width * height;

    const latitudeByRow = new Float32Array(height);
    latitudeByRow.fill(0);

    const landMask = new Uint8Array(size);
    landMask.fill(1);

    const windU = new Int8Array(size);
    const windV = new Int8Array(size);
    windU.fill(80);
    windV.fill(0);

    const evaporation = new Float32Array(size);
    for (let y = 0; y < height; y++) evaporation[idx(0, y, width)] = 1;

    const out = vectorStrategy.run(
      { width, height, latitudeByRow, landMask, windU, windV, evaporation },
      { iterations: 48, advection: 1, retention: 1, secondaryWeightMin: 0.2 }
    );

    expect(out.humidity[idx(0, Math.floor(height / 2), width)]).toBeGreaterThan(0.5);
    expect(out.humidity[idx(10, Math.floor(height / 2), width)]).toBeGreaterThan(0);
    expect(out.humidity[idx(width - 1, Math.floor(height / 2), width)]).toBeGreaterThan(0);
  });
});
