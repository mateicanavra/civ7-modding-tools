import { createStrategy } from "@swooper/mapgen-core/authoring";
import { PerlinNoise } from "@swooper/mapgen-core/lib/noise";
import { estimateDivergenceOddQ, projectOddqToHexSpace, wrapX } from "@swooper/mapgen-core/lib/grid";

import ComputePrecipitationContract from "../contract.js";
import { clampRainfall, computeDistanceToWater, rainfallToHumidityU8 } from "../rules/index.js";

type Vec2 = Readonly<{ x: number; y: number }>;

const OFFSETS_ODD: readonly (readonly [number, number])[] = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
  [-1, 1],
  [1, 1],
];

const OFFSETS_EVEN: readonly (readonly [number, number])[] = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
  [-1, -1],
  [1, -1],
];

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

function getNeighborDeltaHexSpace(dx: number, dy: number): Vec2 {
  const base = projectOddqToHexSpace(0, 0);
  const p = projectOddqToHexSpace(dx, dy);
  return { x: p.x - base.x, y: p.y - base.y };
}

const HEX_DELTAS_ODD: readonly Vec2[] = OFFSETS_ODD.map(([dx, dy]) => getNeighborDeltaHexSpace(dx, dy));
const HEX_DELTAS_EVEN: readonly Vec2[] = OFFSETS_EVEN.map(([dx, dy]) => getNeighborDeltaHexSpace(dx, dy));

function elevationGradientOddQ(
  x: number,
  y: number,
  width: number,
  height: number,
  elevation: Int16Array
): Vec2 {
  const i = y * width + x;
  const e0 = elevation[i] ?? 0;
  const isOdd = (x & 1) === 1;
  const offsets = isOdd ? OFFSETS_ODD : OFFSETS_EVEN;
  const deltas = isOdd ? HEX_DELTAS_ODD : HEX_DELTAS_EVEN;

  let gx = 0;
  let gy = 0;
  let w = 0;
  for (let k = 0; k < offsets.length; k++) {
    const [dx, dy] = offsets[k];
    const ny = y + dy;
    if (ny < 0 || ny >= height) continue;
    const nx = wrapX(x + dx, width);
    const j = ny * width + nx;
    const de = (elevation[j] ?? 0) - e0;
    const d = deltas[k];
    const denom = Math.max(1e-6, d.x * d.x + d.y * d.y);
    gx += (de * d.x) / denom;
    gy += (de * d.y) / denom;
    w += 1;
  }
  if (w <= 0) return { x: 0, y: 0 };
  return { x: gx / w, y: gy / w };
}

export const vectorStrategy = createStrategy(ComputePrecipitationContract, "vector", {
  run: (input, config) => {
    const width = input.width | 0;
    const height = input.height | 0;
    const size = Math.max(0, width * height);
    const perlinSeed = input.perlinSeed | 0;

    if (!(input.latitudeByRow instanceof Float32Array) || input.latitudeByRow.length !== height) {
      throw new Error("[Hydrology] Invalid latitudeByRow for hydrology/compute-precipitation.");
    }
    if (!(input.elevation instanceof Int16Array) || input.elevation.length !== size) {
      throw new Error("[Hydrology] Invalid elevation for hydrology/compute-precipitation.");
    }
    if (!(input.landMask instanceof Uint8Array) || input.landMask.length !== size) {
      throw new Error("[Hydrology] Invalid landMask for hydrology/compute-precipitation.");
    }
    if (!(input.windU instanceof Int8Array) || input.windU.length !== size) {
      throw new Error("[Hydrology] Invalid windU for hydrology/compute-precipitation.");
    }
    if (!(input.windV instanceof Int8Array) || input.windV.length !== size) {
      throw new Error("[Hydrology] Invalid windV for hydrology/compute-precipitation.");
    }
    if (!(input.humidityF32 instanceof Float32Array) || input.humidityF32.length !== size) {
      throw new Error("[Hydrology] Invalid humidityF32 for hydrology/compute-precipitation.");
    }

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

