import { clampInt, idx } from "@swooper/mapgen-core";
import { estimateDivergenceOddQ, projectOddqToHexSpace, wrapX } from "@swooper/mapgen-core/lib/grid";

export function computeCurrents(
  width: number,
  height: number,
  latitudeByRow: Float32Array,
  isWaterMask: Uint8Array,
  strength: number
): { currentU: Int8Array; currentV: Int8Array } {
  const size = Math.max(0, width * height);
  const currentU = new Int8Array(size);
  const currentV = new Int8Array(size);
  const scaledStrength = Math.max(0, strength);

  for (let y = 0; y < height; y++) {
    const latDeg = Math.abs(latitudeByRow[y] ?? 0);

    let baseU = 0;
    const baseV = 0;

    if (latDeg < 12) {
      baseU = -50;
    } else if (latDeg >= 45 && latDeg < 60) {
      baseU = 20;
    } else if (latDeg >= 60) {
      baseU = -15;
    }

    const u = clampInt(Math.round(baseU * scaledStrength), -127, 127);
    const v = clampInt(Math.round(baseV * scaledStrength), -127, 127);

    for (let x = 0; x < width; x++) {
      const i = idx(x, y, width);
      if (isWaterMask[i] === 1) {
        currentU[i] = u;
        currentV[i] = v;
      } else {
        currentU[i] = 0;
        currentV[i] = 0;
      }
    }
  }

  return { currentU, currentV };
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

function getNeighborDeltaHexSpaceFrom(baseX: number, dx: number, dy: number): Vec2 {
  const base = projectOddqToHexSpace(baseX, 0);
  const p = projectOddqToHexSpace(baseX + dx, dy);
  return { x: p.x - base.x, y: p.y - base.y };
}

const HEX_DELTAS_ODD: readonly Vec2[] = OFFSETS_ODD.map(([dx, dy]) => getNeighborDeltaHexSpaceFrom(1, dx, dy));
const HEX_DELTAS_EVEN: readonly Vec2[] = OFFSETS_EVEN.map(([dx, dy]) => getNeighborDeltaHexSpaceFrom(0, dx, dy));

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

function vec2Normalize(v: Vec2): Vec2 {
  const len = Math.sqrt(vec2LengthSquared(v));
  if (!Number.isFinite(len) || len <= 1e-6) return { x: 0, y: 0 };
  return { x: v.x / len, y: v.y / len };
}

function rotateRight(v: Vec2): Vec2 {
  return { x: v.y, y: -v.x };
}

function rotateLeft(v: Vec2): Vec2 {
  return { x: -v.y, y: v.x };
}

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

function smoothFieldWaterOddQ(
  width: number,
  height: number,
  isWaterMask: Uint8Array,
  fx: Float32Array,
  fy: Float32Array,
  iters: number
): void {
  const size = Math.max(0, width * height);
  if (iters <= 0 || size === 0) return;
  const tmpX = new Float32Array(size);
  const tmpY = new Float32Array(size);

  for (let iter = 0; iter < iters; iter++) {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = idx(x, y, width);
        if (isWaterMask[i] !== 1) {
          tmpX[i] = 0;
          tmpY[i] = 0;
          continue;
        }

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
          if (isWaterMask[j] !== 1) continue;
          sx += fx[j] ?? 0;
          sy += fy[j] ?? 0;
          w += 1;
        }
        if (w <= 0) {
          tmpX[i] = fx[i] ?? 0;
          tmpY[i] = fy[i] ?? 0;
          continue;
        }
        const inv = 1 / w;
        const ax = sx * inv;
        const ay = sy * inv;
        tmpX[i] = (fx[i] ?? 0) * 0.5 + ax * 0.5;
        tmpY[i] = (fy[i] ?? 0) * 0.5 + ay * 0.5;
      }
    }
    fx.set(tmpX);
    fy.set(tmpY);
  }
}

function projectDivergenceFreeOddQ(
  width: number,
  height: number,
  isWaterMask: Uint8Array,
  fx: Float32Array,
  fy: Float32Array,
  iters: number
): void {
  const size = Math.max(0, width * height);
  if (iters <= 0 || size === 0) return;

  const div = estimateDivergenceOddQ(width, height, fx, fy);
  const phi = new Float32Array(size);
  const phiNext = new Float32Array(size);

  for (let iter = 0; iter < iters; iter++) {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = idx(x, y, width);
        if (isWaterMask[i] !== 1) {
          phiNext[i] = 0;
          continue;
        }

        const isOdd = (x & 1) === 1;
        const offsets = isOdd ? OFFSETS_ODD : OFFSETS_EVEN;
        let sum = 0;
        let w = 0;
        for (let k = 0; k < offsets.length; k++) {
          const [dx, dy] = offsets[k];
          const ny = y + dy;
          if (ny < 0 || ny >= height) continue;
          const nx = wrapX(x + dx, width);
          const j = idx(nx, ny, width);
          if (isWaterMask[j] !== 1) continue;
          sum += phi[j] ?? 0;
          w += 1;
        }
        const rhs = div[i] ?? 0;
        phiNext[i] = w > 0 ? (sum - rhs) / w : 0;
      }
    }
    phi.set(phiNext);
  }

  // Subtract ∇phi from the field.
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = idx(x, y, width);
      if (isWaterMask[i] !== 1) continue;
      const isOdd = (x & 1) === 1;
      const offsets = isOdd ? OFFSETS_ODD : OFFSETS_EVEN;
      const deltas = isOdd ? HEX_DELTAS_ODD : HEX_DELTAS_EVEN;
      const p0 = phi[i] ?? 0;
      let gx = 0;
      let gy = 0;
      let w = 0;
      for (let k = 0; k < offsets.length; k++) {
        const [dx, dy] = offsets[k];
        const ny = y + dy;
        if (ny < 0 || ny >= height) continue;
        const nx = wrapX(x + dx, width);
        const j = idx(nx, ny, width);
        if (isWaterMask[j] !== 1) continue;
        const dp = (phi[j] ?? 0) - p0;
        const d = deltas[k];
        const denom = Math.max(1e-6, vec2LengthSquared(d));
        gx += (dp * d.x) / denom;
        gy += (dp * d.y) / denom;
        w += 1;
      }
      if (w > 0) {
        gx /= w;
        gy /= w;
      }
      fx[i] = (fx[i] ?? 0) - gx;
      fy[i] = (fy[i] ?? 0) - gy;
    }
  }
}

type BasinCenters = Readonly<{
  centerX: Float32Array;
  centerY: Float32Array;
}>;

function computeBasinCenters(width: number, height: number, isWaterMask: Uint8Array, basinId: Int32Array): BasinCenters {
  const size = Math.max(0, width * height);
  let maxId = 0;
  for (let i = 0; i < size; i++) maxId = Math.max(maxId, basinId[i] ?? 0);
  const sinSum = new Float64Array(maxId + 1);
  const cosSum = new Float64Array(maxId + 1);
  const ySum = new Float64Array(maxId + 1);
  const count = new Uint32Array(maxId + 1);

  for (let y = 0; y < height; y++) {
    const row = y * width;
    for (let x = 0; x < width; x++) {
      const i = row + x;
      if (isWaterMask[i] !== 1) continue;
      const id = basinId[i] ?? 0;
      if (id <= 0) continue;
      const a = (x / Math.max(1, width)) * Math.PI * 2;
      sinSum[id] += Math.sin(a);
      cosSum[id] += Math.cos(a);
      ySum[id] += y;
      count[id] += 1;
    }
  }

  const centerX = new Float32Array(maxId + 1);
  const centerY = new Float32Array(maxId + 1);
  for (let id = 1; id <= maxId; id++) {
    const c = count[id] ?? 0;
    if (c <= 0) continue;
    const meanA = Math.atan2(sinSum[id], cosSum[id]);
    const a = meanA < 0 ? meanA + Math.PI * 2 : meanA;
    centerX[id] = (a / (Math.PI * 2)) * width;
    centerY[id] = (ySum[id] / c) as number;
  }
  return { centerX, centerY };
}

export function computeCurrentsEarthlike(
  width: number,
  height: number,
  latitudeByRow: Float32Array,
  isWaterMask: Uint8Array,
  windU: Int8Array,
  windV: Int8Array,
  options: Readonly<{
    basinId?: Int32Array;
    coastDistance?: Uint16Array;
    coastTangentU?: Int8Array;
    coastTangentV?: Int8Array;
    maxSpeed: number;
    windStrength: number;
    ekmanStrength: number;
    gyreStrength: number;
    coastStrength: number;
    smoothIters: number;
    projectionIters: number;
  }>
): { currentU: Int8Array; currentV: Int8Array } {
  const size = Math.max(0, width * height);
  const currentU = new Int8Array(size);
  const currentV = new Int8Array(size);

  const maxSpeed = Math.max(1e-6, options.maxSpeed);
  const windStrength = Math.max(0, options.windStrength);
  const ekmanStrength = Math.max(0, options.ekmanStrength);
  const gyreStrength = Math.max(0, options.gyreStrength);
  const coastStrength = Math.max(0, options.coastStrength);

  const fx = new Float32Array(size);
  const fy = new Float32Array(size);

  const centers = options.basinId ? computeBasinCenters(width, height, isWaterMask, options.basinId) : null;

  for (let y = 0; y < height; y++) {
    const latDeg = latitudeByRow[y] ?? 0;
    const hemi = latDeg >= 0 ? 1 : -1;

    for (let x = 0; x < width; x++) {
      const i = idx(x, y, width);
      if (isWaterMask[i] !== 1) {
        fx[i] = 0;
        fy[i] = 0;
        continue;
      }

      const w = vec2(windU[i] ?? 0, windV[i] ?? 0);
      const along = vec2Scale(w, windStrength);
      const ekman = vec2Scale(hemi > 0 ? rotateRight(w) : rotateLeft(w), ekmanStrength);
      let cur = vec2Add(along, ekman);

      if (centers && options.basinId) {
        const id = options.basinId[i] ?? 0;
        if (id > 0) {
          const cx = centers.centerX[id] ?? x;
          const cy = centers.centerY[id] ?? y;
          let dx = x - cx;
          if (dx > width / 2) dx -= width;
          else if (dx < -width / 2) dx += width;
          const dy = y - cy;
          const radial = vec2(dx, dy);
          const rHat = vec2Normalize(radial);
          const tangential = hemi > 0 ? rotateRight(rHat) : rotateLeft(rHat);
          cur = vec2Add(cur, vec2Scale(tangential, gyreStrength));
        }
      }

      if (options.coastTangentU && options.coastTangentV) {
        const tx = options.coastTangentU[i] ?? 0;
        const ty = options.coastTangentV[i] ?? 0;
        const tHat = vec2Normalize(vec2(tx, ty));
        const coastFactor =
          options.coastDistance && (options.coastDistance[i] ?? 0xffff) !== 0xffff
            ? clamp01(1 - (options.coastDistance[i] ?? 0) / 12)
            : 1;
        const dir = hemi > 0 ? 1 : -1;
        cur = vec2Add(cur, vec2Scale(tHat, coastStrength * coastFactor * dir));
      }

      fx[i] = cur.x;
      fy[i] = cur.y;
    }
  }

  smoothFieldWaterOddQ(width, height, isWaterMask, fx, fy, options.smoothIters | 0);
  projectDivergenceFreeOddQ(width, height, isWaterMask, fx, fy, options.projectionIters | 0);

  for (let i = 0; i < size; i++) {
    if (isWaterMask[i] !== 1) {
      currentU[i] = 0;
      currentV[i] = 0;
      continue;
    }
    currentU[i] = clampInt(Math.round(((fx[i] ?? 0) / maxSpeed) * 127), -127, 127);
    currentV[i] = clampInt(Math.round(((fy[i] ?? 0) / maxSpeed) * 127), -127, 127);
  }

  return { currentU, currentV };
}
