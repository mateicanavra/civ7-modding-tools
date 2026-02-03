import { describe, expect, it } from "bun:test";

import { vectorStrategy } from "../src/domain/hydrology/ops/compute-precipitation/strategies/vector.js";

function idx(x: number, y: number, width: number): number {
  return y * width + x;
}

describe("hydrology/compute-precipitation (default)", () => {
  it("produces a windward uplift signal on a ridge (noise disabled)", () => {
    const width = 16;
    const height = 10;
    const size = width * height;

    const latitudeByRow = new Float32Array(height);
    latitudeByRow.fill(0);

    const landMask = new Uint8Array(size);
    landMask.fill(1);

    const elevation = new Int16Array(size);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const peakX = 7;
        const d = Math.abs(x - peakX);
        elevation[idx(x, y, width)] = (peakX - d) * 200;
      }
    }

    const windU = new Int8Array(size);
    const windV = new Int8Array(size);
    windU.fill(90); // west -> east
    windV.fill(0);

    const humidityF32 = new Float32Array(size);
    humidityF32.fill(0.7);

    const out = vectorStrategy.run(
      {
        width,
        height,
        perlinSeed: 123,
        latitudeByRow,
        elevation,
        landMask,
        windU,
        windV,
        humidityF32,
      },
      {
        rainfallScale: 180,
        humidityExponent: 1,
        noiseAmplitude: 0,
        noiseScale: 0.12,
        waterGradient: { radius: 5, perRingBonus: 4, lowlandBonus: 2, lowlandElevationMax: 150 },
        upliftStrength: 40,
        convergenceStrength: 0,
      }
    );

    const y = Math.floor(height / 2);
    const windward = out.rainfall[idx(6, y, width)] ?? 0;
    const leeward = out.rainfall[idx(8, y, width)] ?? 0;
    expect(windward).toBeGreaterThan(leeward);
  });
});
