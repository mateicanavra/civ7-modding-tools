import { clamp01 } from "@swooper/mapgen-core";
import { createStrategy } from "@swooper/mapgen-core/authoring";
import {
  estimateDivergenceOddQ,
  forEachHexNeighborOddQWithDirection,
  getHexNeighborDirectionVectorsOddQ,
} from "@swooper/mapgen-core/lib/grid";
import { PerlinNoise } from "@swooper/mapgen-core/lib/noise";

import ComputePrecipitationContract from "../contract.js";
import { clampRainfall, computeDistanceToWater, rainfallToHumidityU8 } from "../rules/index.js";

type Vec2 = Readonly<{ x: number; y: number }>;

// Orographic uplift gradient over the engine's odd-R hex neighborhood. Uses the
// shared neighbor iterator + hex-space direction vectors (parity keyed on the
// ROW, `y & 1`) so this matches the live engine adjacency exactly. The previous
// inlined odd-Q tables + row-0 delta builder produced a geometrically degenerate
// neighbor under the odd-R projection; routing through the shared primitive
// removes that whole class of drift.
function elevationGradientOddQ(
  x: number,
  y: number,
  width: number,
  height: number,
  elevation: Int16Array
): Vec2 {
  const i = y * width + x;
  const e0 = elevation[i] ?? 0;
  const dirs = getHexNeighborDirectionVectorsOddQ((y & 1) === 1);

  let gx = 0;
  let gy = 0;
  let w = 0;
  forEachHexNeighborOddQWithDirection(x, y, width, height, (nx, ny, k) => {
    const j = ny * width + nx;
    const de = (elevation[j] ?? 0) - e0;
    const d = dirs[k];
    const denom = Math.max(1e-6, d.x * d.x + d.y * d.y);
    gx += (de * d.x) / denom;
    gy += (de * d.y) / denom;
    w += 1;
  });
  if (w <= 0) return { x: 0, y: 0 };
  return { x: gx / w, y: gy / w };
}

export const defaultStrategy = createStrategy(ComputePrecipitationContract, "default", {
  run: (input, config) => {
    const width = input.width;
    const height = input.height;
    const size = width * height;
    const perlinSeed = input.perlinSeed | 0;

    const rainfall = new Uint8Array(size);
    const humidity = new Uint8Array(size);

    const distToWater = computeDistanceToWater(width, height, input.landMask);
    const perlin = new PerlinNoise(perlinSeed);

    const noiseAmplitude = config.noiseAmplitude;
    const noiseScale = config.noiseScale;
    const rainfallScale = config.rainfallScale;
    const humidityExponent = config.humidityExponent;

    const waterRadius = Math.max(1, config.waterGradient.radius | 0);
    const waterPerRingBonus = config.waterGradient.perRingBonus;
    const waterLowlandBonus = config.waterGradient.lowlandBonus;
    const waterLowlandElevationMax = config.waterGradient.lowlandElevationMax | 0;

    // Compute a divergence proxy (convergence = -div).
    const windX = new Float32Array(size);
    const windY = new Float32Array(size);
    for (let i = 0; i < size; i++) {
      windX[i] = input.windU[i] ?? 0;
      windY[i] = input.windV[i] ?? 0;
    }
    const divergence = estimateDivergenceOddQ(width, height, windX, windY);

    const upliftStrength = config.upliftStrength;
    const convergenceStrength = config.convergenceStrength;

    for (let y = 0; y < height; y++) {
      const row = y * width;
      for (let x = 0; x < width; x++) {
        const i = row + x;
        if (input.landMask[i] === 0) continue;

        const hum = clamp01(input.humidityF32[i] ?? 0);
        let rf = Math.pow(hum, humidityExponent) * rainfallScale;

        const dist = distToWater[i] | 0;
        if (dist >= 0 && dist <= waterRadius) {
          const elev = input.elevation[i] | 0;
          rf += Math.max(0, waterRadius - dist) * waterPerRingBonus;
          if (elev < waterLowlandElevationMax) rf += waterLowlandBonus;
        }

        const wx = input.windU[i] | 0;
        const wy = input.windV[i] | 0;
        const speed = Math.sqrt(wx * wx + wy * wy);
        if (speed > 1e-6) {
          const grad = elevationGradientOddQ(x, y, width, height, input.elevation);
          const whx = wx / speed;
          const why = wy / speed;

          // Uplift proxy: positive when wind is blowing uphill.
          const uplift = Math.max(0, grad.x * whx + grad.y * why);
          rf += upliftStrength * uplift * 0.02;

          // Convergence proxy: negative divergence.
          const conv = Math.max(0, -(divergence[i] ?? 0));
          rf += convergenceStrength * conv * 35;
        }

        const noise = perlin.noise2D(x * noiseScale, y * noiseScale);
        rf += noise * noiseAmplitude;

        const clamped = clampRainfall(rf);
        rainfall[i] = (clamped | 0) & 0xff;
        humidity[i] = rainfallToHumidityU8(clamped);
      }
    }

    return { rainfall, humidity } as const;
  },
});
