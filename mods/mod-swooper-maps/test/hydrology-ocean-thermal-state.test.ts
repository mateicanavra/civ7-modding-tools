import { describe, expect, it } from "bun:test";

import { computeOceanThermalState } from "../src/domain/hydrology/ops/compute-ocean-thermal-state/rules/index.js";

function idx(x: number, y: number, width: number): number {
  return y * width + x;
}

describe("hydrology/compute-ocean-thermal-state", () => {
  it("produces colder SST near poles and sea ice in cold water", () => {
    const width = 16;
    const height = 10;
    const size = width * height;

    const latitudeByRow = new Float32Array(height);
    for (let y = 0; y < height; y++) latitudeByRow[y] = 90 - (180 * y) / Math.max(1, height - 1);

    const isWaterMask = new Uint8Array(size);
    isWaterMask.fill(1);

    const currentU = new Int8Array(size);
    const currentV = new Int8Array(size);
    currentU.fill(0);
    currentV.fill(0);

    const out = computeOceanThermalState(width, height, latitudeByRow, isWaterMask, currentU, currentV, {
      equatorTempC: 28,
      poleTempC: -2,
      advectIters: 0,
      diffusion: 0,
      secondaryWeightMin: 0.25,
      seaIceThresholdC: -1,
    });

    expect(out.sstC[idx(0, 0, width)]).toBeLessThan(out.sstC[idx(0, Math.floor(height / 2), width)]);
    expect(out.seaIceMask[idx(0, 0, width)]).toBe(1);
  });

  it("changes SST when currents advect warm water poleward", () => {
    const width = 16;
    const height = 10;
    const size = width * height;

    const latitudeByRow = new Float32Array(height);
    // Northern hemisphere only: top is pole (90), bottom is equator (0).
    // This avoids a symmetric "south pole cold" boundary dominating a uniform poleward flow.
    for (let y = 0; y < height; y++) latitudeByRow[y] = 90 - (90 * y) / Math.max(1, height - 1);

    const isWaterMask = new Uint8Array(size);
    isWaterMask.fill(1);

    const stillU = new Int8Array(size);
    const stillV = new Int8Array(size);
    stillU.fill(0);
    stillV.fill(0);

    const advectU = new Int8Array(size);
    const advectV = new Int8Array(size);
    advectU.fill(0);
    // Negative y direction pulls from south neighbor (warmer) toward north.
    advectV.fill(-80);

    const still = computeOceanThermalState(width, height, latitudeByRow, isWaterMask, stillU, stillV, {
      equatorTempC: 28,
      poleTempC: -2,
      advectIters: 24,
      diffusion: 0.1,
      secondaryWeightMin: 0.25,
      seaIceThresholdC: -1,
    });
    const advected = computeOceanThermalState(width, height, latitudeByRow, isWaterMask, advectU, advectV, {
      equatorTempC: 28,
      poleTempC: -2,
      advectIters: 24,
      diffusion: 0.1,
      secondaryWeightMin: 0.25,
      seaIceThresholdC: -1,
    });

    expect(advected.sstC[idx(0, 1, width)]).toBeGreaterThan(still.sstC[idx(0, 1, width)]);
  });
});
