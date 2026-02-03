import { clampInt, idx } from "@swooper/mapgen-core";
import { projectOddqToHexSpace, wrapX } from "@swooper/mapgen-core/lib/grid";
import { createLabelRng } from "@swooper/mapgen-core/lib/rng";

export function computeWinds(
  width: number,
  height: number,
  latitudeByRow: Float32Array,
  options: { seed: number; jetStreaks: number; jetStrength: number; variance: number }
): { windU: Int8Array; windV: Int8Array } {
  const size = Math.max(0, width * height);
  const windU = new Int8Array(size);
  const windV = new Int8Array(size);

  const streaks = options.jetStreaks | 0;
  const jetStrength = options.jetStrength;
  const variance = options.variance;

  const rng = createLabelRng(options.seed | 0);
  const streakLats: number[] = [];
  for (let s = 0; s < streaks; s++) {
    const base = 30 + s * (30 / Math.max(1, streaks - 1));
    const jitter = rng(12, "JetJit") - 6;
    streakLats.push(Math.max(15, Math.min(75, base + jitter)));
  }

  for (let y = 0; y < height; y++) {
    const latDeg = Math.abs(latitudeByRow[y] ?? 0);

    let u = latDeg < 30 || latDeg >= 60 ? -80 : 80;
    const v = 0;

    for (let k = 0; k < streakLats.length; k++) {
      const d = Math.abs(latDeg - streakLats[k]);
      const f = Math.max(0, 1 - d / 12);
      if (f > 0) {
        const boost = Math.round(32 * jetStrength * f);
        u += latDeg < streakLats[k] ? boost : -boost;
      }
    }

    const varU = Math.round((rng(21, "WindUVar") - 10) * variance) | 0;
    const varV = Math.round((rng(11, "WindVVar") - 5) * variance) | 0;

    for (let x = 0; x < width; x++) {
      const i = idx(x, y, width);
      windU[i] = clampInt(u + varU, -127, 127);
      windV[i] = clampInt(v + varV, -127, 127);
    }
  }

  return { windU, windV };
}

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

type Vec2 = Readonly<{ x: number; y: number }>;

function vec2(x: number, y: number): Vec2 {
  return { x, y };
}

function vec2Add(a: Vec2, b: Vec2): Vec2 {
  return { x: a.x + b.x, y: a.y + b.y };
}

function vec2Scale(v: Vec2, s: number): Vec2 {
  return { x: v.x * s, y: v.y * s };
}

function vec2LengthSquared(v: Vec2): number {
  return v.x * v.x + v.y * v.y;
}

function rotate90(v: Vec2): Vec2 {
  return { x: -v.y, y: v.x };
}

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function smoothstep(t: number): number {
  const u = clamp01(t);
  return u * u * (3 - 2 * u);
}

function mix2(a: number, b: number, t: number): number {
  return a * (1 - t) + b * t;
}

function hash2(seed: number, x: number, y: number, salt: number): number {
  // A tiny 2D integer hash (deterministic across JS engines).
  let h = (seed ^ salt) >>> 0;
  h = Math.imul(h ^ (x >>> 0), 0x9e3779b1) >>> 0;
  h = Math.imul(h ^ (y >>> 0), 0x85ebca6b) >>> 0;
  h ^= h >>> 16;
  h = Math.imul(h, 0xc2b2ae35) >>> 0;
  h ^= h >>> 16;
  return h >>> 0;
}

function randSigned(seed: number, x: number, y: number, salt: number): number {
  const h = hash2(seed, x, y, salt);
  return (h / 0xffffffff) * 2 - 1;
}

function valueNoise2(seed: number, fx: number, fy: number, scale: number, salt: number): number {
  const s = Math.max(1e-6, scale);
  const x = fx / s;
  const y = fy / s;
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const tx = smoothstep(x - x0);
  const ty = smoothstep(y - y0);

  const n00 = randSigned(seed, x0, y0, salt);
  const n10 = randSigned(seed, x0 + 1, y0, salt);
  const n01 = randSigned(seed, x0, y0 + 1, salt);
  const n11 = randSigned(seed, x0 + 1, y0 + 1, salt);

  const nx0 = mix2(n00, n10, tx);
  const nx1 = mix2(n01, n11, tx);
  return mix2(nx0, nx1, ty);
}

function seasonalSignal01(seasonPhase01: number): number {
  const p = ((seasonPhase01 % 1) + 1) % 1;
  return Math.sin(p * Math.PI * 2);
}

function getNeighborDeltaHexSpaceFrom(baseX: number, dx: number, dy: number): Vec2 {
  const base = projectOddqToHexSpace(baseX, 0);
  const p = projectOddqToHexSpace(baseX + dx, dy);
  return { x: p.x - base.x, y: p.y - base.y };
}

const HEX_DELTAS_ODD: readonly Vec2[] = OFFSETS_ODD.map(([dx, dy]) => getNeighborDeltaHexSpaceFrom(1, dx, dy));
const HEX_DELTAS_EVEN: readonly Vec2[] = OFFSETS_EVEN.map(([dx, dy]) => getNeighborDeltaHexSpaceFrom(0, dx, dy));

function smoothFieldOddQ(width: number, height: number, fx: Float32Array, fy: Float32Array, iters: number): void {
  const size = Math.max(0, width * height);
  if (iters <= 0 || size === 0) return;

  const tmpX = new Float32Array(size);
  const tmpY = new Float32Array(size);

  for (let iter = 0; iter < iters; iter++) {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = idx(x, y, width);
        const isOdd = (x & 1) === 1;
        const offsets = isOdd ? OFFSETS_ODD : OFFSETS_EVEN;
        let sx = 0;
        let sy = 0;
        let w = 0;
        for (let k = 0; k < offsets.length; k++) {
          const [dx, dy] = offsets[k];
          const ny = y + dy;
          if (ny < 0 || ny >= height) continue;
          const nx = wrapX(x + dx, width);
          const j = idx(nx, ny, width);
          sx += fx[j] ?? 0;
          sy += fy[j] ?? 0;
          w += 1;
        }
        const inv = w > 0 ? 1 / w : 0;
        const ax = sx * inv;
        const ay = sy * inv;
        // Mix toward neighbor average; keep some local character.
        tmpX[i] = lerp(fx[i] ?? 0, ax, 0.55);
        tmpY[i] = lerp(fy[i] ?? 0, ay, 0.55);
      }
    }
    fx.set(tmpX);
    fy.set(tmpY);
  }
}

export function computeWindsEarthlike(
  width: number,
  height: number,
  latitudeByRow: Float32Array,
  options: Readonly<{
    seed: number;
    landMask?: Uint8Array;
    elevation?: Int16Array;
    seasonPhase01: number;
    maxSpeed: number;
    zonalStrength: number;
    meridionalStrength: number;
    geostrophicStrength: number;
    pressureNoiseScale: number;
    pressureNoiseAmp: number;
    waveStrength: number;
    landHeatStrength: number;
    mountainDeflectStrength: number;
    smoothIters: number;
  }>
): { windU: Int8Array; windV: Int8Array } {
  const size = Math.max(0, width * height);
  const windU = new Int8Array(size);
  const windV = new Int8Array(size);

  const seed = options.seed | 0;
  const maxSpeed = Math.max(1e-6, options.maxSpeed);
  const zonalStrength = Math.max(0, options.zonalStrength);
  const meridionalStrength = Math.max(0, options.meridionalStrength);
  const geostrophicStrength = Math.max(0, options.geostrophicStrength);
  const pressureNoiseScale = Math.max(2, options.pressureNoiseScale);
  const pressureNoiseAmp = Math.max(0, options.pressureNoiseAmp);
  const waveStrength = Math.max(0, options.waveStrength);
  const landHeatStrength = Math.max(0, options.landHeatStrength);
  const mountainDeflectStrength = Math.max(0, options.mountainDeflectStrength);

  const landMask = options.landMask;
  const elevation = options.elevation;

  const seasonS = seasonalSignal01(options.seasonPhase01);
  const pressure = new Float32Array(size);

  // Seed a deterministic RNG for a few global-ish parameters (wave number / phase).
  const rng = createLabelRng(seed);
  const waveNumber = 2 + (rng(3, "WindWaveN") | 0); // 2..4
  const wavePhase = (rng(10_000, "WindWavePhase") / 10_000) * Math.PI * 2;

  for (let y = 0; y < height; y++) {
    const latDeg = latitudeByRow[y] ?? 0;
    const latAbs = Math.abs(latDeg);
    const latRad = (latDeg / 180) * Math.PI;
    const latWave = Math.sin(latRad * 2);
    const tropics = clamp01(1 - latAbs / 30);

    for (let x = 0; x < width; x++) {
      const i = idx(x, y, width);
      const nx = (x / Math.max(1, width)) * Math.PI * 2;

      // Planetary waves: longitude-dependent meanders stronger away from equator.
      const wave = Math.sin(nx * waveNumber + wavePhase) * latWave;

      // Local pressure noise.
      const n = valueNoise2(seed, x, y, pressureNoiseScale, 0x13579bdf);

      // Land heating: seasonal low-pressure over land in the tropics (if available).
      const land = landMask ? (landMask[i] === 1 ? 1 : 0) : 0;
      const landHeat = land * seasonS * tropics;

      // Orography: mountains create a weak stationary perturbation (if available).
      const elev = elevation ? (elevation[i] ?? 0) : 0;
      const elev01 = clamp01(elev / 3000);

      pressure[i] =
        waveStrength * wave +
        pressureNoiseAmp * n -
        landHeatStrength * landHeat +
        mountainDeflectStrength * elev01;
    }
  }

  // Derive a wind field from (a) base 3-cell circulation scaffold and (b) a geostrophic-like flow from ∇pressure.
  const wx = new Float32Array(size);
  const wy = new Float32Array(size);

  for (let y = 0; y < height; y++) {
    const latDeg = latitudeByRow[y] ?? 0;
    const latAbs = Math.abs(latDeg);
    const hemi = latDeg >= 0 ? 1 : -1;
    const lat01 = clamp01(latAbs / 90);

    const zonalDir = latAbs < 30 || latAbs >= 60 ? -1 : 1;
    const zonalBase = zonalDir * zonalStrength * (0.65 + 0.35 * Math.sin(lat01 * Math.PI));

    let meridionalBase = 0;
    if (latAbs < 30) {
      meridionalBase = -hemi * meridionalStrength * (1 - latAbs / 30);
    } else if (latAbs < 60) {
      meridionalBase = hemi * meridionalStrength * ((latAbs - 30) / 30);
    } else {
      meridionalBase = -hemi * meridionalStrength * clamp01((latAbs - 60) / 30);
    }

    for (let x = 0; x < width; x++) {
      const i = idx(x, y, width);
      const isOdd = (x & 1) === 1;
      const offsets = isOdd ? OFFSETS_ODD : OFFSETS_EVEN;
      const deltas = isOdd ? HEX_DELTAS_ODD : HEX_DELTAS_EVEN;

      const p0 = pressure[i] ?? 0;
      let grad = vec2(0, 0);
      let w = 0;

      for (let k = 0; k < offsets.length; k++) {
        const [dx, dy] = offsets[k];
        const ny = y + dy;
        if (ny < 0 || ny >= height) continue;
        const nx = wrapX(x + dx, width);
        const j = idx(nx, ny, width);
        const dp = (pressure[j] ?? 0) - p0;
        const d = deltas[k];
        const denom = Math.max(1e-6, vec2LengthSquared(d));
        grad = vec2Add(grad, vec2Scale(d, dp / denom));
        w += 1;
      }

      if (w > 0) grad = vec2Scale(grad, 1 / w);

      const geo = rotate90(grad);
      const wind = vec2Add(vec2(zonalBase, meridionalBase), vec2Scale(geo, geostrophicStrength));

      wx[i] = wind.x;
      wy[i] = wind.y;
    }
  }

  smoothFieldOddQ(width, height, wx, wy, options.smoothIters | 0);

  for (let i = 0; i < size; i++) {
    windU[i] = clampInt(Math.round(((wx[i] ?? 0) / maxSpeed) * 127), -127, 127);
    windV[i] = clampInt(Math.round(((wy[i] ?? 0) / maxSpeed) * 127), -127, 127);
  }

  return { windU, windV };
}
