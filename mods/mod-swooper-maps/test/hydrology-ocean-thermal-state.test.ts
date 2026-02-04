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
    const shelfMask = new Uint8Array(size);

    const currentU = new Int8Array(size);
    const currentV = new Int8Array(size);
    currentU.fill(0);
    currentV.fill(0);

    const out = computeOceanThermalState(width, height, latitudeByRow, isWaterMask, shelfMask, currentU, currentV, {
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
    const shelfMask = new Uint8Array(size);

    const stillU = new Int8Array(size);
    const stillV = new Int8Array(size);
    stillU.fill(0);
    stillV.fill(0);

    const advectU = new Int8Array(size);
    const advectV = new Int8Array(size);
    advectU.fill(0);
    // Negative y direction pulls from south neighbor (warmer) toward north.
    advectV.fill(-80);

    const still = computeOceanThermalState(width, height, latitudeByRow, isWaterMask, shelfMask, stillU, stillV, {
      equatorTempC: 28,
      poleTempC: -2,
      advectIters: 24,
      diffusion: 0.1,
      secondaryWeightMin: 0.25,
      seaIceThresholdC: -1,
    });
    const advected = computeOceanThermalState(width, height, latitudeByRow, isWaterMask, shelfMask, advectU, advectV, {
      equatorTempC: 28,
      poleTempC: -2,
      advectIters: 24,
      diffusion: 0.1,
      secondaryWeightMin: 0.25,
      seaIceThresholdC: -1,
    });

    expect(advected.sstC[idx(0, 1, width)]).toBeGreaterThan(still.sstC[idx(0, 1, width)]);
  });

  it("does not advect SST from land tiles (water-only upcurrent sampling)", () => {
    const width = 5;
    const height = 5;
    const size = width * height;

    const latitudeByRow = new Float32Array(height);
    latitudeByRow.fill(0);

    const isWaterMask = new Uint8Array(size);
    isWaterMask.fill(1);
    const shelfMask = new Uint8Array(size);

    const cx = 2;
    const cy = 2;
    const center = idx(cx, cy, width);

    // Make the primary upcurrent neighbor land (south), while leaving other diagonals as water.
    isWaterMask[idx(cx, cy + 1, width)] = 0;

    const currentU = new Int8Array(size);
    const currentV = new Int8Array(size);
    // Negative y pulls from the south; previously this could select the land tile and inject 0.
    currentV[center] = -80;

    const out = computeOceanThermalState(width, height, latitudeByRow, isWaterMask, shelfMask, currentU, currentV, {
      equatorTempC: 20,
      poleTempC: 20,
      advectIters: 1,
      diffusion: 0,
      secondaryWeightMin: 0.25,
      seaIceThresholdC: -1,
    });

    expect(out.sstC[center]).toBeGreaterThan(10);
  });

  it("uses shelfMask to increase local mixing (bounded + deterministic)", () => {
    const width = 12;
    const height = 6;
    const size = width * height;

    const latitudeByRow = new Float32Array(height);
    for (let y = 0; y < height; y++) latitudeByRow[y] = 90 - (90 * y) / Math.max(1, height - 1);

    const isWaterMask = new Uint8Array(size);
    isWaterMask.fill(1);

    const currentU = new Int8Array(size);
    const currentV = new Int8Array(size);

    const shelfOff = new Uint8Array(size);
    const shelfOn = new Uint8Array(size);
    const t = idx(Math.floor(width / 2), Math.floor(height / 2), width);
    shelfOn[t] = 1;

    const base = computeOceanThermalState(width, height, latitudeByRow, isWaterMask, shelfOff, currentU, currentV, {
      equatorTempC: 30,
      poleTempC: 0,
      advectIters: 1,
      diffusion: 0.5,
      secondaryWeightMin: 0.25,
      seaIceThresholdC: -1,
    });
    const shelf = computeOceanThermalState(width, height, latitudeByRow, isWaterMask, shelfOn, currentU, currentV, {
      equatorTempC: 30,
      poleTempC: 0,
      advectIters: 1,
      diffusion: 0.5,
      secondaryWeightMin: 0.25,
      seaIceThresholdC: -1,
    });

    expect(Math.abs((shelf.sstC[t] ?? 0) - (base.sstC[t] ?? 0))).toBeGreaterThan(1e-4);
    // Determinism sanity: rerun matches exactly for the same inputs.
    const shelf2 = computeOceanThermalState(width, height, latitudeByRow, isWaterMask, shelfOn, currentU, currentV, {
      equatorTempC: 30,
      poleTempC: 0,
      advectIters: 1,
      diffusion: 0.5,
      secondaryWeightMin: 0.25,
      seaIceThresholdC: -1,
    });
    expect(Array.from(shelf2.sstC)).toEqual(Array.from(shelf.sstC));
  });
});
