import { describe, expect, it } from "bun:test";

import { estimateDivergenceOddQ } from "@swooper/mapgen-core/lib/grid";
import { computeCurrentsEarthlike } from "../src/domain/hydrology/ops/compute-ocean-surface-currents/rules/index.js";

function rms(values: Float32Array, mask: Uint8Array): number {
  let sum = 0;
  let n = 0;
  for (let i = 0; i < values.length; i++) {
    if ((mask[i] ?? 0) !== 1) continue;
    const v = values[i] ?? 0;
    sum += v * v;
    n += 1;
  }
  return Math.sqrt(sum / Math.max(1, n));
}

describe("hydrology/compute-ocean-surface-currents (default)", () => {
  it("zeros land and reduces divergence with projection", () => {
    const width = 32;
    const height = 16;
    const size = width * height;

    const latitudeByRow = new Float32Array(height);
    latitudeByRow.fill(35);

    const isWaterMask = new Uint8Array(size);
    isWaterMask.fill(1);
    // A small land island.
    for (let y = 6; y <= 9; y++) {
      for (let x = 14; x <= 17; x++) {
        isWaterMask[y * width + x] = 0;
      }
    }

    const windU = new Int8Array(size);
    const windV = new Int8Array(size);
    windU.fill(90);
    windV.fill(0);

    const raw = computeCurrentsEarthlike(width, height, latitudeByRow, isWaterMask, windU, windV, {
      maxSpeed: 80,
      windStrength: 0.55,
      ekmanStrength: 0.35,
      gyreStrength: 0,
      coastStrength: 0,
      smoothIters: 0,
      projectionIters: 0,
    });
    const projected = computeCurrentsEarthlike(width, height, latitudeByRow, isWaterMask, windU, windV, {
      maxSpeed: 80,
      windStrength: 0.55,
      ekmanStrength: 0.35,
      gyreStrength: 0,
      coastStrength: 0,
      smoothIters: 0,
      projectionIters: 12,
    });

    // Land must be zero.
    for (let i = 0; i < size; i++) {
      if (isWaterMask[i] === 1) continue;
      expect(projected.currentU[i]).toBe(0);
      expect(projected.currentV[i]).toBe(0);
    }

    const rawX = new Float32Array(size);
    const rawY = new Float32Array(size);
    const projX = new Float32Array(size);
    const projY = new Float32Array(size);
    for (let i = 0; i < size; i++) {
      rawX[i] = raw.currentU[i] ?? 0;
      rawY[i] = raw.currentV[i] ?? 0;
      projX[i] = projected.currentU[i] ?? 0;
      projY[i] = projected.currentV[i] ?? 0;
    }

    const divRaw = estimateDivergenceOddQ(width, height, rawX, rawY);
    const divProj = estimateDivergenceOddQ(width, height, projX, projY);

    expect(rms(divProj, isWaterMask)).toBeLessThan(rms(divRaw, isWaterMask));
  });
});
