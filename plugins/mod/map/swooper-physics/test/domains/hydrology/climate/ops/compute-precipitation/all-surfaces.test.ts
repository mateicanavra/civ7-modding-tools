import { describe, expect, it } from "bun:test";
import {
  estimateDivergenceOddQ,
  forEachHexNeighborOddQWithDirection,
  getHexNeighborDirectionVectorsOddQ,
  I8_VECTOR_MAX_ABS,
} from "@swooper/mapgen-core/lib/grid";
import { PerlinNoise } from "@swooper/mapgen-core/lib/noise";

import hydrology from "../../../../../../src/domain/hydrology/router.js";
import { deriveTestOperationSeed } from "../../../../../setup.js";

const { computeClimateDiagnostics, computePrecipitation } = hydrology.climate.ops;
const SYNTHETIC_WIDTH = 9;
const SYNTHETIC_HEIGHT = 5;
const CELL_COUNT = SYNTHETIC_WIDTH * SYNTHETIC_HEIGHT;
const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

function fixture() {
  return {
    width: SYNTHETIC_WIDTH,
    height: SYNTHETIC_HEIGHT,
    latitudeByRow: new Float32Array(SYNTHETIC_HEIGHT),
    landMask: Uint8Array.from({ length: CELL_COUNT }, (_, index) => index % 4 === 0 ? 0 : 1),
    elevation: Int16Array.from({ length: CELL_COUNT }, (_, index) => index % 4 === 0 ? -120 : (index % 7) * 25),
    windU: Int8Array.from({ length: CELL_COUNT }, (_, index) => (index % 5) * 20 - 35),
    windV: Int8Array.from({ length: CELL_COUNT }, (_, index) => (index % 3) * 17 - 10),
    humidityF32: Float32Array.from({ length: CELL_COUNT }, (_, index) => 0.15 + (index % 11) * 0.09),
    perlinSeed: deriveTestOperationSeed("test:hydrology:precipitation-all-surfaces"),
  };
}

type Configuration = typeof computePrecipitation.defaultConfig.config;

// Frozen initial-land arithmetic from the former land-only operation. The order of additions
// and humidity's pre-byte rainfall sample matter at the output quantization boundary.
function formerInitialLandResult(input: ReturnType<typeof fixture>, config: Configuration) {
  const rainfall = new Uint8Array(CELL_COUNT);
  const humidity = new Uint8Array(CELL_COUNT);
  // Power-of-two normalization keeps this fixture's coastal distances exact in Float32.
  const continentalityMaxDist = 64;
  const { continentalityIndex } = computeClimateDiagnostics.run({
    width: input.width,
    height: input.height,
    latitudeByRow: input.latitudeByRow,
    landMask: input.landMask,
    elevation: input.elevation,
    windU: input.windU,
    windV: input.windV,
    rainfall: new Uint8Array(CELL_COUNT),
  }, {
    ...computeClimateDiagnostics.defaultConfig,
    config: { ...computeClimateDiagnostics.defaultConfig.config, continentalityMaxDist },
  });
  const perlin = new PerlinNoise(input.perlinSeed);
  const windX = Float32Array.from(input.windU, (sample) => sample / I8_VECTOR_MAX_ABS);
  const windY = Float32Array.from(input.windV, (sample) => sample / I8_VECTOR_MAX_ABS);
  const divergence = estimateDivergenceOddQ(input.width, input.height, windX, windY);
  const waterRadius = Math.max(1, config.waterGradient.radius | 0);
  const lowlandThreshold = config.waterGradient.lowlandElevationMax | 0;
  for (let y = 0; y < input.height; y += 1) {
    for (let x = 0; x < input.width; x += 1) {
      const index = y * input.width + x;
      if (input.landMask[index] === 0) continue;
      const hum = clamp01(input.humidityF32[index]!);
      let rf = Math.pow(hum, config.humidityExponent) * config.rainfallScale;
      const dist = continentalityIndex[index]! * continentalityMaxDist;
      if (dist >= 0 && dist <= waterRadius) {
        rf += Math.max(0, waterRadius - dist) * config.waterGradient.perRingBonus;
        if ((input.elevation[index]! | 0) < lowlandThreshold) rf += config.waterGradient.lowlandBonus;
      }
      const wx = input.windU[index]! | 0;
      const wy = input.windV[index]! | 0;
      const speed = Math.sqrt(wx * wx + wy * wy);
      if (speed > 1e-6) {
        const directions = getHexNeighborDirectionVectorsOddQ((y & 1) === 1);
        let gx = 0;
        let gy = 0;
        let count = 0;
        forEachHexNeighborOddQWithDirection(x, y, input.width, input.height, (nx, ny, direction) => {
          const de = input.elevation[ny * input.width + nx]! - input.elevation[index]!;
          const d = directions[direction]!;
          const denominator = Math.max(1e-6, d.x * d.x + d.y * d.y);
          gx += (de * d.x) / denominator;
          gy += (de * d.y) / denominator;
          count += 1;
        });
        const gradX = count <= 0 ? 0 : gx / count;
        const gradY = count <= 0 ? 0 : gy / count;
        rf += config.upliftStrength * Math.max(0, gradX * (wx / speed) + gradY * (wy / speed)) * 0.02;
      }
      rf += config.convergenceStrength * clamp01(-16 * divergence[index]!) * hum;
      rf += perlin.noise2D(x * config.noiseScale, y * config.noiseScale) * config.noiseAmplitude;
      const clamped = Math.max(0, Math.min(200, rf));
      rainfall[index] = clamped;
      humidity[index] = Math.round((clamped / 200) * 255);
    }
  }
  return { rainfall, humidity };
}

describe("compute-precipitation all-surface forcing", () => {
  it("holds exact initial-land rainfall and humidity arithmetic across authored responses", () => {
    const input = fixture();
    const before = structuredClone(input);
    for (const config of [
      computePrecipitation.defaultConfig.config,
      {
        ...computePrecipitation.defaultConfig.config,
        rainfallScale: 107.3,
        humidityExponent: 1.7,
        convergenceStrength: 83,
        upliftStrength: 17.4,
        noiseAmplitude: 21.1,
        noiseScale: 0.23,
        waterGradient: { radius: 3, perRingBonus: 2.7, lowlandBonus: 1.3, lowlandElevationMax: 101 },
      },
      {
        ...computePrecipitation.defaultConfig.config,
        rainfallScale: 0,
        convergenceStrength: 0,
        upliftStrength: 0,
        noiseAmplitude: 0,
      },
    ]) {
      const expected = formerInitialLandResult(input, config);
      const actual = computePrecipitation.run(input, { strategy: "vector", config });
      for (let index = 0; index < CELL_COUNT; index += 1) {
        if (input.landMask[index] !== 1) continue;
        expect(actual.rainfall[index]).toBe(expected.rainfall[index]);
        expect(actual.humidity[index]).toBe(expected.humidity[index]);
      }
    }
    expect(input).toEqual(before);
  });

  it("uses humidity, convergence, and seeded texture over wet surfaces", () => {
    const input = fixture();
    input.landMask.fill(0);
    const config = computePrecipitation.defaultConfig.config;
    const actual = computePrecipitation.run(input, computePrecipitation.defaultConfig);
    const perlin = new PerlinNoise(input.perlinSeed);
    const windX = Float32Array.from(input.windU, (value) => value / I8_VECTOR_MAX_ABS);
    const windY = Float32Array.from(input.windV, (value) => value / I8_VECTOR_MAX_ABS);
    const divergence = estimateDivergenceOddQ(input.width, input.height, windX, windY);
    let convergentCells = 0;
    let texturedCells = 0;
    for (let index = 0; index < CELL_COUNT; index += 1) {
      const x = index % input.width;
      const y = Math.floor(index / input.width);
      const hum = clamp01(input.humidityF32[index]!);
      let expected = Math.pow(hum, config.humidityExponent) * config.rainfallScale;
      const convergence = config.convergenceStrength * clamp01(-16 * divergence[index]!) * hum;
      expected += convergence;
      const texture = perlin.noise2D(x * config.noiseScale, y * config.noiseScale) * config.noiseAmplitude;
      expected += texture;
      expected = Math.max(0, Math.min(200, expected));
      expect(actual.rainfall[index]).toBe(Math.trunc(expected));
      expect(actual.humidity[index]).toBe(Math.round((expected / 200) * 255));
      if (convergence > 0) convergentCells += 1;
      if (texture !== 0) texturedCells += 1;
    }
    expect(convergentCells).toBeGreaterThan(0);
    expect(texturedCells).toBeGreaterThan(0);
  });

  it("makes wet forcing independent of submerged bed gradients and terrestrial bonus settings", () => {
    const input = fixture();
    const baseline = computePrecipitation.run(input, computePrecipitation.defaultConfig);
    const alteredBed = structuredClone(input);
    for (let index = 0; index < CELL_COUNT; index += 1) {
      if (input.landMask[index] === 0) alteredBed.elevation[index] = -3000 + index * 41;
    }
    const actual = computePrecipitation.run(alteredBed, {
      ...computePrecipitation.defaultConfig,
      config: {
        ...computePrecipitation.defaultConfig.config,
        upliftStrength: 200,
        waterGradient: { radius: 20, perRingBonus: 40, lowlandBonus: 40, lowlandElevationMax: 8000 },
      },
    });
    for (let index = 0; index < CELL_COUNT; index += 1) {
      if (input.landMask[index] !== 0) continue;
      expect(actual.rainfall[index]).toBe(baseline.rainfall[index]);
      expect(actual.humidity[index]).toBe(baseline.humidity[index]);
    }
  });
});
