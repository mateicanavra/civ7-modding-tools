import { clamp01 } from "@swooper/mapgen-core";
import { createStrategy } from "@swooper/mapgen-core/authoring";
import {
  estimateDivergenceOddQ,
  forEachHexNeighborOddQWithDirection,
  getHexNeighborDirectionVectorsOddQ,
  I8_VECTOR_MAX_ABS,
} from "@swooper/mapgen-core/lib/grid";
import { PerlinNoise } from "@swooper/mapgen-core/lib/noise";

import { computeDistanceToWater } from "../../../../model/rules/coastal-distance.js";
import {
  clampRainfall,
  rainfallToHumidityU8,
} from "../../../../model/rules/precipitation-scale.js";
import ComputePrecipitationContract from "../../contract.js";
import VectorDefinition from "./config.js";

type Vec2 = Readonly<{ x: number; y: number }>;

// Empirical response scale: normalized convergence 1/16 reaches the wetting cap.
// Apply before clamping so wind quantization cannot multiply the rainfall budget.
const CONVERGENCE_RESPONSE_GAIN = 16;

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
  elevation: ArrayLike<number>
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

/**
 * Combines transported humidity with coastal moisture, seeded texture, windward elevation
 * gradients, and wind convergence over the shared engine-compatible hex neighborhood. Rainfall is
 * all-surface, with terrestrial bonuses and uplift restricted to initial land. It is clamped to
 * Civ7's range and is the sole source of returned humidity.
 */
const vectorStrategy = createStrategy(ComputePrecipitationContract, VectorDefinition, {
  run: (input, config) => {
    const width = input.width;
    const height = input.height;
    const size = width * height;
    const perlinSeed = input.perlinSeed;

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

    // Divergence uses unit-scale wind components, not their signed-byte encoding.
    const windX = new Float32Array(size);
    const windY = new Float32Array(size);
    for (let i = 0; i < size; i++) {
      windX[i] = (input.windU[i] ?? 0) / I8_VECTOR_MAX_ABS;
      windY[i] = (input.windV[i] ?? 0) / I8_VECTOR_MAX_ABS;
    }
    const divergence = estimateDivergenceOddQ(width, height, windX, windY);

    const upliftStrength = config.upliftStrength;
    const convergenceStrength = config.convergenceStrength;

    for (let y = 0; y < height; y++) {
      const row = y * width;
      for (let x = 0; x < width; x++) {
        const i = row + x;
        const isInitialLand = input.landMask[i] === 1;

        const hum = clamp01(input.humidityF32[i] ?? 0);
        let rf = Math.pow(hum, humidityExponent) * rainfallScale;

        const dist = distToWater[i] | 0;
        if (isInitialLand && dist >= 0 && dist <= waterRadius) {
          const elev = input.elevation[i] | 0;
          rf += Math.max(0, waterRadius - dist) * waterPerRingBonus;
          if (elev < waterLowlandElevationMax) rf += waterLowlandBonus;
        }

        const wx = input.windU[i] | 0;
        const wy = input.windV[i] | 0;
        const speed = Math.sqrt(wx * wx + wy * wy);
        if (isInitialLand && speed > 1e-6) {
          const grad = elevationGradientOddQ(x, y, width, height, input.elevation);
          const whx = wx / speed;
          const why = wy / speed;

          // Uplift proxy: positive when wind is blowing uphill.
          const uplift = Math.max(0, grad.x * whx + grad.y * why);
          rf += upliftStrength * uplift * 0.02;
        }

        // Neighboring inflow can wet a calm center; available humidity bounds its contribution.
        const convergence = clamp01(-CONVERGENCE_RESPONSE_GAIN * (divergence[i] ?? 0));
        rf += convergenceStrength * convergence * hum;

        const noise = perlin.noise2D(x * noiseScale, y * noiseScale);
        rf += noise * noiseAmplitude;

        const clamped = clampRainfall(rf);
        rainfall[i] = clamped;
        humidity[i] = rainfallToHumidityU8(clamped);
      }
    }

    return { rainfall, humidity } as const;
  },
});

export default vectorStrategy;
