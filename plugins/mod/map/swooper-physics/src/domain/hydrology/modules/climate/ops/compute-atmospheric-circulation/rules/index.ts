import {
  type Vec2,
  forEachHexNeighborOddQWithDirection,
  getHexNeighborDirectionVectorsOddQ,
  getHexNeighborIndicesOddQ,
  idx,
  quantizeVec2I8ClampMagnitude,
  vec2,
  vec2Add,
  vec2LengthSquared,
  vec2Scale,
} from "@swooper/mapgen-core/lib/grid";
import { clamp01, lerp } from "@swooper/mapgen-core/lib/math";

/**
 * Per-sample perturbation ceiling relative to the analytic circulation backbone.
 *
 * Transient weather can rival the mean flow in a snapshot, but cannot erase the planetary
 * circulation. Seasonal averaging suppresses decorrelated transients further.
 */
const MAX_PERTURBATION_RATIO = 1;

/** Structural ceiling that keeps planetary circulation zonally dominant. */
const MAX_MERIDIONAL_TO_ZONAL_RATIO = 0.35;
const HADLEY_CELL_END_DEG = 30;
const FERREL_CELL_END_DEG = 60;
const POLE_LATITUDE_DEG = 90;
const FERREL_MERIDIONAL_WEIGHT = 0.6;
const POLAR_MERIDIONAL_WEIGHT = 0.5;
const EQUATORIAL_TAPER_DEFAULT_DEG = 18;
const PRESSURE_SMOOTHING_BLEND = 0.55;

function rotateRight(v: Vec2): Vec2 {
  return { x: v.y, y: -v.x };
}

function rotateLeft(v: Vec2): Vec2 {
  return { x: -v.y, y: v.x };
}

function smoothstep(t: number): number {
  const u = clamp01(t);
  return u * u * (3 - 2 * u);
}

function smoothFieldOddQ(
  width: number,
  height: number,
  fx: Float32Array,
  fy: Float32Array,
  iters: number
): void {
  const size = width * height;
  if (iters <= 0) return;

  const tmpX = new Float32Array(size);
  const tmpY = new Float32Array(size);

  for (let iter = 0; iter < iters; iter++) {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = idx(x, y, width);
        let sx = 0;
        let sy = 0;
        let w = 0;
        const neighbors = getHexNeighborIndicesOddQ(x, y, width, height);
        for (let k = 0; k < neighbors.length; k++) {
          const j = neighbors[k];
          sx += fx[j] ?? 0;
          sy += fy[j] ?? 0;
          w += 1;
        }
        const inv = w > 0 ? 1 / w : 0;
        const ax = sx * inv;
        const ay = sy * inv;
        // Mix toward neighbor average; keep some local character.
        tmpX[i] = lerp(fx[i] ?? 0, ax, PRESSURE_SMOOTHING_BLEND);
        tmpY[i] = lerp(fy[i] ?? 0, ay, PRESSURE_SMOOTHING_BLEND);
      }
    }
    fx.set(tmpX);
    fy.set(tmpY);
  }
}

function centerFieldRows(
  width: number,
  height: number,
  fx: Float32Array,
  fy: Float32Array
): void {
  for (let y = 0; y < height; y++) {
    let meanX = 0;
    let meanY = 0;
    const rowStart = y * width;
    for (let x = 0; x < width; x++) {
      const i = rowStart + x;
      meanX += fx[i] ?? 0;
      meanY += fy[i] ?? 0;
    }
    meanX /= Math.max(1, width);
    meanY /= Math.max(1, width);

    for (let x = 0; x < width; x++) {
      const i = rowStart + x;
      fx[i] = (fx[i] ?? 0) - meanX;
      fy[i] = (fy[i] ?? 0) - meanY;
    }
  }
}

/**
 * Synthesizes the default circulation from prevailing wind bands and pressure flow.
 *
 * The zonal backbone stays non-stagnant across every latitude row and changes prevailing direction
 * at the Hadley/Ferrel and Ferrel/Polar boundaries. Meridional half-sine cells retain equatorward
 * tropical and polar flow plus poleward temperate flow. Pressure departures add a hemisphere-aware
 * geostrophic perturbation that becomes down-gradient near the equator, is normalized to an RMS
 * budget, and centered before encoding. Unsaturated row means retain the analytic carrier within
 * rounding error; nonlinear speed projection need not preserve saturated component means.
 */
export function computeWindsEarthlike(
  width: number,
  height: number,
  latitudeByRow: ArrayLike<number>,
  options: Readonly<{
    readonly pressureField: ArrayLike<number>;
    readonly maxSpeed: number;
    readonly zonalStrength: number;
    readonly meridionalStrength: number;
    readonly pressureDrivenRms: number;
    readonly smoothIters: number;
    readonly equatorialTaperDeg?: number;
  }>
): { windU: Int8Array; windV: Int8Array } {
  const size = width * height;
  const windU = new Int8Array(size);
  const windV = new Int8Array(size);

  const maxSpeed = Math.max(1e-6, options.maxSpeed);
  const zonalStrength = Math.max(0, options.zonalStrength);
  const meridionalStrength = Math.min(
    Math.max(0, options.meridionalStrength),
    zonalStrength * MAX_MERIDIONAL_TO_ZONAL_RATIO
  );
  const pressureDrivenRms = Math.max(0, options.pressureDrivenRms);
  const equatorialTaperDeg = Math.max(
    1e-6,
    options.equatorialTaperDeg ?? EQUATORIAL_TAPER_DEFAULT_DEG
  );
  const pressureField = options.pressureField;
  const rowCenteredPressure = new Float32Array(size);

  for (let y = 0; y < height; y++) {
    let rowMeanPressure = 0;
    for (let x = 0; x < width; x++) {
      rowMeanPressure += pressureField[idx(x, y, width)] ?? 0;
    }
    rowMeanPressure /= Math.max(1, width);

    for (let x = 0; x < width; x++) {
      const i = idx(x, y, width);
      rowCenteredPressure[i] = (pressureField[i] ?? 0) - rowMeanPressure;
    }
  }

  const latitudeRampSign =
    Math.sign((latitudeByRow[height - 1] ?? 0) - (latitudeByRow[0] ?? 0)) || -1;

  const wx = new Float32Array(size);
  const wy = new Float32Array(size);
  const perturbationX = new Float32Array(size);
  const perturbationY = new Float32Array(size);
  let backboneSquareSum = 0;

  for (let y = 0; y < height; y++) {
    const latDeg = latitudeByRow[y] ?? 0;
    const latAbs = Math.abs(latDeg);
    const hemi = latDeg >= 0 ? 1 : -1;
    const equatorwardV = -hemi * latitudeRampSign;

    const zonalDirection =
      latAbs < HADLEY_CELL_END_DEG || latAbs >= FERREL_CELL_END_DEG ? -1 : 1;
    const zonalShape =
      zonalDirection *
      (0.65 + 0.35 * Math.sin(clamp01(latAbs / POLE_LATITUDE_DEG) * Math.PI));
    let meridionalShapeEquatorward: number;
    if (latAbs < HADLEY_CELL_END_DEG) {
      const t = latAbs / HADLEY_CELL_END_DEG;
      meridionalShapeEquatorward = Math.sin(Math.PI * t);
    } else if (latAbs < FERREL_CELL_END_DEG) {
      const t =
        (latAbs - HADLEY_CELL_END_DEG) / (FERREL_CELL_END_DEG - HADLEY_CELL_END_DEG);
      meridionalShapeEquatorward = -FERREL_MERIDIONAL_WEIGHT * Math.sin(Math.PI * t);
    } else {
      const t = clamp01(
        (latAbs - FERREL_CELL_END_DEG) / (POLE_LATITUDE_DEG - FERREL_CELL_END_DEG)
      );
      meridionalShapeEquatorward = POLAR_MERIDIONAL_WEIGHT * Math.sin(Math.PI * t);
    }

    const zonalBase = zonalStrength * zonalShape;
    const meridionalBase =
      meridionalStrength * equatorwardV * meridionalShapeEquatorward;
    backboneSquareSum += width * (zonalBase * zonalBase + meridionalBase * meridionalBase);
    const coriolisTaper = smoothstep(latAbs / equatorialTaperDeg);

    for (let x = 0; x < width; x++) {
      const i = idx(x, y, width);
      const dirs = getHexNeighborDirectionVectorsOddQ((y & 1) === 1);

      const p0 = rowCenteredPressure[i] ?? 0;
      let grad = vec2(0, 0);
      let w = 0;

      forEachHexNeighborOddQWithDirection(x, y, width, height, (nx, ny, k) => {
        const j = idx(nx, ny, width);
        const dp = (rowCenteredPressure[j] ?? 0) - p0;
        const d = dirs[k];
        const denom = Math.max(1e-6, vec2LengthSquared(d));
        grad = vec2Add(grad, vec2Scale(d, dp / denom));
        w += 1;
      });

      if (w > 0) grad = vec2Scale(grad, 1 / w);

      const rotated =
        hemi * latitudeRampSign < 0 ? rotateRight(grad) : rotateLeft(grad);
      const downGradient = vec2Scale(grad, -1);
      perturbationX[i] = lerp(downGradient.x, rotated.x, coriolisTaper);
      perturbationY[i] = lerp(downGradient.y, rotated.y, coriolisTaper);
      wx[i] = zonalBase;
      wy[i] = meridionalBase;
    }
  }

  smoothFieldOddQ(
    width,
    height,
    perturbationX,
    perturbationY,
    options.smoothIters | 0
  );
  // The analytic backbone owns the planetary row-mean circulation. Pressure departures own only
  // eddies; removing their discrete row mean also prevents finite map edges or one transient
  // weather sample from silently retuning the authored circulation cells.
  centerFieldRows(width, height, perturbationX, perturbationY);

  let perturbationSquareSum = 0;
  for (let i = 0; i < size; i++) {
    const u = perturbationX[i] ?? 0;
    const v = perturbationY[i] ?? 0;
    perturbationSquareSum += u * u + v * v;
  }
  const perturbationRms = Math.sqrt(perturbationSquareSum / Math.max(1, size));
  const backboneRms = Math.sqrt(backboneSquareSum / Math.max(1, size));
  const targetPerturbationRms =
    backboneRms > 1e-6
      ? Math.min(pressureDrivenRms, backboneRms * MAX_PERTURBATION_RATIO)
      : pressureDrivenRms;
  const perturbationScale =
    perturbationRms > 1e-6 ? targetPerturbationRms / perturbationRms : 0;

  for (let i = 0; i < size; i++) {
    const quantized = quantizeVec2I8ClampMagnitude(
      (wx[i] ?? 0) + (perturbationX[i] ?? 0) * perturbationScale,
      (wy[i] ?? 0) + (perturbationY[i] ?? 0) * perturbationScale,
      maxSpeed
    );
    windU[i] = quantized.x;
    windV[i] = quantized.y;
  }

  return { windU, windV };
}
