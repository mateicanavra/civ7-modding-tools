import { describe, expect, it } from "bun:test";

import { computeWindsEarthlike } from "../src/domain/hydrology/ops/compute-atmospheric-circulation/rules/index.js";

function idx(x: number, y: number, width: number): number {
  return y * width + x;
}

function varianceI8Row(values: Int8Array, width: number, y: number): number {
  const n = width;
  let mean = 0;
  for (let x = 0; x < width; x++) mean += values[idx(x, y, width)] ?? 0;
  mean /= Math.max(1, n);
  let acc = 0;
  for (let x = 0; x < width; x++) {
    const d = (values[idx(x, y, width)] ?? 0) - mean;
    acc += d * d;
  }
  return acc / Math.max(1, n);
}

describe("hydrology/compute-atmospheric-circulation (default)", () => {
  it("is deterministic and not row-uniform", () => {
    const width = 64;
    const height = 32;
    const lat = new Float32Array(height);
    for (let y = 0; y < height; y++) lat[y] = lerp(-60, 60, y / Math.max(1, height - 1));

    const run = () =>
      computeWindsEarthlike(width, height, lat, {
        seed: 123,
        seasonPhase01: 0.25,
        maxSpeed: 110,
        zonalStrength: 90,
        meridionalStrength: 30,
        geostrophicStrength: 70,
        pressureNoiseScale: 18,
        pressureNoiseAmp: 55,
        waveStrength: 45,
        landHeatStrength: 20,
        mountainDeflectStrength: 18,
        smoothIters: 4,
      });

    const a = run();
    const b = run();

    expect(a.windU).toEqual(b.windU);
    expect(a.windV).toEqual(b.windV);

    const midRow = Math.floor(height / 2);
    expect(varianceI8Row(a.windU, width, midRow)).toBeGreaterThan(0);
    expect(varianceI8Row(a.windV, width, midRow)).toBeGreaterThan(0);
  });
});

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}
