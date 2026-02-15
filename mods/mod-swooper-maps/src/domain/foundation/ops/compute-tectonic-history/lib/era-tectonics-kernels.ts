import { clamp01, clampInt, wrapDeltaPeriodic } from "@swooper/mapgen-core/lib/math";

import { BOUNDARY_TYPE } from "../../../constants.js";
import type { FoundationCrust } from "../../compute-crust/contract.js";
import type { FoundationMantleForcing } from "../../compute-mantle-forcing/contract.js";
import type { FoundationMesh } from "../../compute-mesh/contract.js";
import type { FoundationPlateGraph } from "../../compute-plate-graph/contract.js";
import type { ComputePlateMotionConfig, FoundationPlateMotion } from "../../compute-plate-motion/contract.js";
import type { ComputeTectonicSegmentsConfig, FoundationTectonicSegments } from "../../compute-tectonic-segments/contract.js";

const EPS = 1e-9;

export const DEFAULT_PLATE_MOTION_CONFIG: ComputePlateMotionConfig = {
  omegaFactor: 1,
  plateRadiusMin: 1,
  residualNormScale: 1,
  p90NormScale: 1,
  histogramBins: 32,
  smoothingSteps: 0,
};

export const DEFAULT_TECTONIC_SEGMENTS_CONFIG: ComputeTectonicSegmentsConfig = {
  intensityScale: 900,
  regimeMinIntensity: 4,
};

type PlateGraphMembership = Readonly<Pick<FoundationPlateGraph, "cellToPlate" | "plates">>;

type PlateMotionKernelInput = Readonly<{
  mesh: FoundationMesh;
  plateGraph: PlateGraphMembership;
  mantleForcing: Pick<FoundationMantleForcing, "forcingU" | "forcingV">;
}>;

type TectonicSegmentsKernelInput = Readonly<{
  mesh: FoundationMesh;
  crust: Pick<FoundationCrust, "strength" | "type">;
  plateGraph: PlateGraphMembership;
  plateMotion: FoundationPlateMotion;
}>;

function clampByte(value: number): number {
  if (!Number.isFinite(value)) return 0;
  if (value <= 0) return 0;
  if (value >= 255) return 255;
  return Math.round(value) | 0;
}

function clampInt8(value: number): number {
  return Math.max(-127, Math.min(127, Math.round(value))) | 0;
}

function hypot2(x: number, y: number): number {
  return Math.sqrt(x * x + y * y);
}

function normalizeToInt8(x: number, y: number): { u: number; v: number } {
  const len = hypot2(x, y);
  if (!Number.isFinite(len) || len <= 1e-9) return { u: 0, v: 0 };
  return { u: clampInt8((x / len) * 127), v: clampInt8((y / len) * 127) };
}

function velocityAtPoint(params: {
  plateId: number;
  plateMotion: FoundationPlateMotion;
  x: number;
  y: number;
  wrapWidth: number;
}): { vx: number; vy: number } {
  const plateId = params.plateId | 0;
  const vx = params.plateMotion.plateVelocityX[plateId] ?? 0;
  const vy = params.plateMotion.plateVelocityY[plateId] ?? 0;

  const omega = params.plateMotion.plateOmega[plateId] ?? 0;
  if (!omega) return { vx, vy };

  const cx = params.plateMotion.plateCenterX[plateId] ?? 0;
  const cy = params.plateMotion.plateCenterY[plateId] ?? 0;
  const dx = wrapDeltaPeriodic(params.x - cx, params.wrapWidth);
  const dy = params.y - cy;

  return { vx: vx + -dy * omega, vy: vy + dx * omega };
}

function boundaryRegimeFromIntensities(intensities: {
  compression: number;
  extension: number;
  shear: number;
  minIntensity: number;
}): number {
  const c = intensities.compression | 0;
  const e = intensities.extension | 0;
  const s = intensities.shear | 0;
  const max = Math.max(c, e, s);
  if (max < (intensities.minIntensity | 0)) return BOUNDARY_TYPE.none;
  if (c >= e && c >= s) return BOUNDARY_TYPE.convergent;
  if (e >= c && e >= s) return BOUNDARY_TYPE.divergent;
  return BOUNDARY_TYPE.transform;
}

export function computePlateMotionFromState(
  input: PlateMotionKernelInput,
  config: ComputePlateMotionConfig = DEFAULT_PLATE_MOTION_CONFIG
): FoundationPlateMotion {
  const mesh = input.mesh;
  const plateGraph = input.plateGraph;
  const mantleForcing = input.mantleForcing;

  const cellCount = mesh.cellCount | 0;
  const plateCount = plateGraph.plates.length | 0;
  const wrapWidth = mesh.wrapWidth;

  const omegaFactor = Math.max(0, config.omegaFactor ?? DEFAULT_PLATE_MOTION_CONFIG.omegaFactor);
  const plateRadiusMin = Math.max(1e-6, config.plateRadiusMin ?? DEFAULT_PLATE_MOTION_CONFIG.plateRadiusMin);
  const residualNormScale = Math.max(
    0.01,
    config.residualNormScale ?? DEFAULT_PLATE_MOTION_CONFIG.residualNormScale
  );
  const p90NormScale = Math.max(0.01, config.p90NormScale ?? DEFAULT_PLATE_MOTION_CONFIG.p90NormScale);
  const histogramBins = clampInt(
    Math.round(config.histogramBins ?? DEFAULT_PLATE_MOTION_CONFIG.histogramBins),
    8,
    128
  );
  const smoothingSteps = clampInt(
    Math.round(config.smoothingSteps ?? DEFAULT_PLATE_MOTION_CONFIG.smoothingSteps),
    0,
    1
  );

  let forcingU = mantleForcing.forcingU;
  let forcingV = mantleForcing.forcingV;

  if (smoothingSteps > 0) {
    const smoothedU = new Float32Array(cellCount);
    const smoothedV = new Float32Array(cellCount);
    for (let i = 0; i < cellCount; i++) {
      const start = mesh.neighborsOffsets[i] ?? 0;
      const end = mesh.neighborsOffsets[i + 1] ?? start;
      let sumU = forcingU[i] ?? 0;
      let sumV = forcingV[i] ?? 0;
      let count = 1;
      for (let j = start; j < end; j++) {
        const n = mesh.neighbors[j] ?? -1;
        if (n < 0 || n >= cellCount) continue;
        sumU += forcingU[n] ?? 0;
        sumV += forcingV[n] ?? 0;
        count += 1;
      }
      const inv = 1 / count;
      smoothedU[i] = sumU * inv;
      smoothedV[i] = sumV * inv;
    }
    forcingU = smoothedU;
    forcingV = smoothedV;
  }

  const sumW = new Float64Array(plateCount);
  const sumX = new Float64Array(plateCount);
  const sumY = new Float64Array(plateCount);
  const sumU = new Float64Array(plateCount);
  const sumV = new Float64Array(plateCount);

  let totalWeight = 0;
  let totalSpeed = 0;

  for (let i = 0; i < cellCount; i++) {
    const plateId = plateGraph.cellToPlate[i] | 0;
    if (plateId < 0 || plateId >= plateCount) continue;

    const start = mesh.neighborsOffsets[i] ?? 0;
    const end = mesh.neighborsOffsets[i + 1] ?? start;
    let boundaryDegree = 0;
    for (let j = start; j < end; j++) {
      const n = mesh.neighbors[j] ?? -1;
      if (n < 0 || n >= cellCount) continue;
      if ((plateGraph.cellToPlate[n] | 0) !== plateId) boundaryDegree += 1;
    }

    const area = mesh.areas[i] ?? 1;
    const weight = area / (1 + boundaryDegree);
    if (!Number.isFinite(weight) || weight <= 0) continue;

    const plate = plateGraph.plates[plateId];
    const xRef = plate?.seedX ?? 0;
    const x = xRef + wrapDeltaPeriodic((mesh.siteX[i] ?? 0) - xRef, wrapWidth);
    const y = mesh.siteY[i] ?? 0;

    const u = forcingU[i] ?? 0;
    const v = forcingV[i] ?? 0;

    sumW[plateId] += weight;
    sumX[plateId] += weight * x;
    sumY[plateId] += weight * y;
    sumU[plateId] += weight * u;
    sumV[plateId] += weight * v;

    totalWeight += weight;
    totalSpeed += weight * Math.hypot(u, v);
  }

  const meanForcingSpeed = totalWeight > EPS ? totalSpeed / totalWeight : 0;

  const plateCenterX = new Float32Array(plateCount);
  const plateCenterY = new Float32Array(plateCount);
  const plateVelocityX = new Float32Array(plateCount);
  const plateVelocityY = new Float32Array(plateCount);

  for (let p = 0; p < plateCount; p++) {
    const weight = sumW[p] ?? 0;
    if (weight > EPS) {
      const inv = 1 / weight;
      plateCenterX[p] = (sumX[p] ?? 0) * inv;
      plateCenterY[p] = (sumY[p] ?? 0) * inv;
      plateVelocityX[p] = (sumU[p] ?? 0) * inv;
      plateVelocityY[p] = (sumV[p] ?? 0) * inv;
    } else {
      const plate = plateGraph.plates[p];
      plateCenterX[p] = plate?.seedX ?? 0;
      plateCenterY[p] = plate?.seedY ?? 0;
      plateVelocityX[p] = 0;
      plateVelocityY[p] = 0;
    }
  }

  const numOmega = new Float64Array(plateCount);
  const denOmega = new Float64Array(plateCount);

  for (let i = 0; i < cellCount; i++) {
    const plateId = plateGraph.cellToPlate[i] | 0;
    if (plateId < 0 || plateId >= plateCount) continue;

    const start = mesh.neighborsOffsets[i] ?? 0;
    const end = mesh.neighborsOffsets[i + 1] ?? start;
    let boundaryDegree = 0;
    for (let j = start; j < end; j++) {
      const n = mesh.neighbors[j] ?? -1;
      if (n < 0 || n >= cellCount) continue;
      if ((plateGraph.cellToPlate[n] | 0) !== plateId) boundaryDegree += 1;
    }

    const area = mesh.areas[i] ?? 1;
    const weight = area / (1 + boundaryDegree);
    if (!Number.isFinite(weight) || weight <= 0) continue;

    const plate = plateGraph.plates[plateId];
    const xRef = plate?.seedX ?? 0;
    const x = xRef + wrapDeltaPeriodic((mesh.siteX[i] ?? 0) - xRef, wrapWidth);
    const y = mesh.siteY[i] ?? 0;

    const cx = plateCenterX[plateId] ?? 0;
    const cy = plateCenterY[plateId] ?? 0;
    const rx = x - cx;
    const ry = y - cy;

    const du = (forcingU[i] ?? 0) - (plateVelocityX[plateId] ?? 0);
    const dv = (forcingV[i] ?? 0) - (plateVelocityY[plateId] ?? 0);

    numOmega[plateId] += weight * (rx * dv - ry * du);
    denOmega[plateId] += weight * (rx * rx + ry * ry);
  }

  const plateOmega = new Float32Array(plateCount);
  for (let p = 0; p < plateCount; p++) {
    const denom = Math.max(EPS, denOmega[p] ?? 0);
    let omega = (numOmega[p] ?? 0) / denom;
    const radiusRms = Math.sqrt((denOmega[p] ?? 0) / Math.max(sumW[p] ?? 0, EPS));
    const omegaMax = omegaFactor > 0 ? (omegaFactor * meanForcingSpeed) / Math.max(plateRadiusMin, radiusRms) : 0;
    if (omegaMax > 0) {
      omega = Math.max(-omegaMax, Math.min(omegaMax, omega));
    } else {
      omega = 0;
    }
    plateOmega[p] = omega;
  }

  const plateFitRms = new Float32Array(plateCount);
  const plateFitP90 = new Float32Array(plateCount);
  const plateQuality = new Uint8Array(plateCount);
  const cellFitError = new Uint8Array(cellCount);

  const residualNorm = Math.max(EPS, meanForcingSpeed * residualNormScale);
  const p90Norm = Math.max(EPS, meanForcingSpeed * p90NormScale);
  const sumErrSq = new Float64Array(plateCount);
  const cellWeight = new Float32Array(cellCount);
  const cellErr = new Float32Array(cellCount);
  const maxNormByPlate = new Float32Array(plateCount);

  for (let i = 0; i < cellCount; i++) {
    const plateId = plateGraph.cellToPlate[i] | 0;
    if (plateId < 0 || plateId >= plateCount) continue;

    const start = mesh.neighborsOffsets[i] ?? 0;
    const end = mesh.neighborsOffsets[i + 1] ?? start;
    let boundaryDegree = 0;
    for (let j = start; j < end; j++) {
      const n = mesh.neighbors[j] ?? -1;
      if (n < 0 || n >= cellCount) continue;
      if ((plateGraph.cellToPlate[n] | 0) !== plateId) boundaryDegree += 1;
    }

    const area = mesh.areas[i] ?? 1;
    const weight = area / (1 + boundaryDegree);
    if (!Number.isFinite(weight) || weight <= 0) continue;

    const plate = plateGraph.plates[plateId];
    const xRef = plate?.seedX ?? 0;
    const x = xRef + wrapDeltaPeriodic((mesh.siteX[i] ?? 0) - xRef, wrapWidth);
    const y = mesh.siteY[i] ?? 0;

    const cx = plateCenterX[plateId] ?? 0;
    const cy = plateCenterY[plateId] ?? 0;
    const rx = x - cx;
    const ry = y - cy;

    const vx = (plateVelocityX[plateId] ?? 0) + -ry * (plateOmega[plateId] ?? 0);
    const vy = (plateVelocityY[plateId] ?? 0) + rx * (plateOmega[plateId] ?? 0);

    const du = (forcingU[i] ?? 0) - vx;
    const dv = (forcingV[i] ?? 0) - vy;
    const err = Math.hypot(du, dv);

    cellWeight[i] = weight;
    cellErr[i] = err;
    sumErrSq[plateId] += weight * err * err;
    cellFitError[i] = clampByte((255 * err) / residualNorm);

    const normalized = err / residualNorm;
    if (normalized > (maxNormByPlate[plateId] ?? 0)) {
      maxNormByPlate[plateId] = normalized;
    }
  }

  const logMaxByPlate = new Float32Array(plateCount);
  for (let p = 0; p < plateCount; p++) {
    const maxNorm = Math.max(0, maxNormByPlate[p] ?? 0);
    logMaxByPlate[p] = Math.log1p(maxNorm);
  }

  const hist = new Float64Array(plateCount * histogramBins);
  for (let i = 0; i < cellCount; i++) {
    const plateId = plateGraph.cellToPlate[i] | 0;
    if (plateId < 0 || plateId >= plateCount) continue;

    const weight = cellWeight[i] ?? 0;
    if (weight <= 0) continue;

    const logMax = logMaxByPlate[plateId] ?? 0;
    if (logMax <= EPS) continue;

    const normalized = Math.max(0, (cellErr[i] ?? 0) / residualNorm);
    const t = Math.log1p(normalized) / logMax;
    const bin = Math.min(histogramBins - 1, Math.max(0, Math.floor(t * histogramBins)));
    hist[plateId * histogramBins + bin] += weight;
  }

  for (let p = 0; p < plateCount; p++) {
    const weight = sumW[p] ?? 0;
    if (weight <= EPS) {
      plateFitRms[p] = 0;
      plateFitP90[p] = 0;
      plateQuality[p] = 0;
      continue;
    }
    plateFitRms[p] = Math.sqrt((sumErrSq[p] ?? 0) / weight);

    const target = weight * 0.9;
    let cumulative = 0;
    let bin = histogramBins - 1;
    for (let b = 0; b < histogramBins; b++) {
      cumulative += hist[p * histogramBins + b] ?? 0;
      if (cumulative >= target) {
        bin = b;
        break;
      }
    }
    const logMax = Math.max(EPS, logMaxByPlate[p] ?? 0);
    const t = ((bin + 0.5) / histogramBins) * logMax;
    const normalizedP90 = Math.expm1(t);
    plateFitP90[p] = normalizedP90 * residualNorm;

    const q = clamp01(1 - (plateFitP90[p] ?? 0) / p90Norm);
    plateQuality[p] = Math.round(q * 255);
  }

  return {
    version: 1,
    cellCount,
    plateCount,
    plateCenterX,
    plateCenterY,
    plateVelocityX,
    plateVelocityY,
    plateOmega,
    plateFitRms,
    plateFitP90,
    plateQuality,
    cellFitError,
  } as const satisfies FoundationPlateMotion;
}

export function computeTectonicSegmentsFromState(
  input: TectonicSegmentsKernelInput,
  config: ComputeTectonicSegmentsConfig = DEFAULT_TECTONIC_SEGMENTS_CONFIG
): FoundationTectonicSegments {
  const mesh = input.mesh;
  const crust = input.crust;
  const plateGraph = input.plateGraph;
  const plateMotion = input.plateMotion;

  const cellCount = mesh.cellCount | 0;
  const wrapWidth = mesh.wrapWidth;
  const intensityScale = config.intensityScale ?? DEFAULT_TECTONIC_SEGMENTS_CONFIG.intensityScale;
  const regimeMinIntensity = (config.regimeMinIntensity ?? DEFAULT_TECTONIC_SEGMENTS_CONFIG.regimeMinIntensity) | 0;

  const aCell: number[] = [];
  const bCell: number[] = [];
  const plateA: number[] = [];
  const plateB: number[] = [];
  const regime: number[] = [];
  const polarity: number[] = [];
  const compression: number[] = [];
  const extension: number[] = [];
  const shear: number[] = [];
  const volcanism: number[] = [];
  const fracture: number[] = [];
  const driftU: number[] = [];
  const driftV: number[] = [];

  for (let i = 0; i < cellCount; i++) {
    const start = mesh.neighborsOffsets[i] | 0;
    const end = mesh.neighborsOffsets[i + 1] | 0;
    const plateAId = plateGraph.cellToPlate[i] | 0;
    if (!plateGraph.plates[plateAId]) continue;

    const ax = mesh.siteX[i] ?? 0;
    const ay = mesh.siteY[i] ?? 0;

    for (let cursor = start; cursor < end; cursor++) {
      const j = mesh.neighbors[cursor] | 0;
      if (j <= i) continue;
      if (j < 0 || j >= cellCount) continue;

      const plateBId = plateGraph.cellToPlate[j] | 0;
      if (plateBId === plateAId) continue;

      if (!plateGraph.plates[plateBId]) continue;

      const bx = mesh.siteX[j] ?? 0;
      const by = mesh.siteY[j] ?? 0;

      const dx = wrapDeltaPeriodic(bx - ax, wrapWidth);
      const dy = by - ay;
      const len = hypot2(dx, dy);
      if (!Number.isFinite(len) || len <= 1e-9) continue;

      const nx = dx / len;
      const ny = dy / len;
      const tx = -ny;
      const ty = nx;

      const midX = ax + dx * 0.5;
      const midY = ay + dy * 0.5;

      const vA = velocityAtPoint({ plateId: plateAId, plateMotion, x: midX, y: midY, wrapWidth });
      const vB = velocityAtPoint({ plateId: plateBId, plateMotion, x: midX, y: midY, wrapWidth });

      const rvx = (vB.vx ?? 0) - (vA.vx ?? 0);
      const rvy = (vB.vy ?? 0) - (vA.vy ?? 0);

      const vn = rvx * nx + rvy * ny;
      const vt = rvx * tx + rvy * ty;

      const strengthA = clamp01(crust.strength[i] ?? 0);
      const strengthB = clamp01(crust.strength[j] ?? 0);
      const resistance = clamp01((strengthA + strengthB) * 0.5);
      const weakness = clamp01(1 - resistance);

      const compressionScale = 0.85 + 0.3 * resistance;
      const extensionScale = 0.85 + 0.3 * weakness;
      const shearScale = 0.9 + 0.2 * weakness;

      const c = clampByte(Math.max(0, -vn) * intensityScale * compressionScale);
      const e = clampByte(Math.max(0, vn) * intensityScale * extensionScale);
      const s = clampByte(Math.abs(vt) * intensityScale * shearScale);
      const kind = boundaryRegimeFromIntensities({
        compression: c,
        extension: e,
        shear: s,
        minIntensity: regimeMinIntensity,
      });

      let pol = 0;
      if (kind === BOUNDARY_TYPE.convergent) {
        const aType = crust.type[i] ?? 0;
        const bType = crust.type[j] ?? 0;
        if (aType !== bType) {
          if (aType === 0 && bType === 1) pol = -1;
          if (aType === 1 && bType === 0) pol = 1;
        } else if (aType === 0) {
          const diff = strengthA - strengthB;
          if (Math.abs(diff) >= 0.03) pol = diff < 0 ? -1 : 1;
        }
      }

      const v = (() => {
        if (kind === BOUNDARY_TYPE.convergent) return clampByte(c * 0.6 + (pol !== 0 ? 40 : 0));
        if (kind === BOUNDARY_TYPE.divergent) return clampByte(e * 0.25);
        if (kind === BOUNDARY_TYPE.transform) return clampByte(s * 0.1);
        return 0;
      })();

      const f = (() => {
        if (kind === BOUNDARY_TYPE.transform) return clampByte(s * 0.7);
        if (kind === BOUNDARY_TYPE.divergent) return clampByte(e * 0.3);
        if (kind === BOUNDARY_TYPE.convergent) return clampByte(c * 0.2);
        return 0;
      })();

      const drift = normalizeToInt8(
        (plateMotion.plateVelocityX[plateAId] ?? 0) + (plateMotion.plateVelocityX[plateBId] ?? 0),
        (plateMotion.plateVelocityY[plateAId] ?? 0) + (plateMotion.plateVelocityY[plateBId] ?? 0)
      );

      aCell.push(i);
      bCell.push(j);
      plateA.push(plateAId);
      plateB.push(plateBId);
      regime.push(kind);
      polarity.push(pol);
      compression.push(c);
      extension.push(e);
      shear.push(s);
      volcanism.push(v);
      fracture.push(f);
      driftU.push(drift.u);
      driftV.push(drift.v);
    }
  }

  const segmentCount = aCell.length;

  return {
    segmentCount,
    aCell: Int32Array.from(aCell),
    bCell: Int32Array.from(bCell),
    plateA: Int16Array.from(plateA),
    plateB: Int16Array.from(plateB),
    regime: Uint8Array.from(regime),
    polarity: Int8Array.from(polarity),
    compression: Uint8Array.from(compression),
    extension: Uint8Array.from(extension),
    shear: Uint8Array.from(shear),
    volcanism: Uint8Array.from(volcanism),
    fracture: Uint8Array.from(fracture),
    driftU: Int8Array.from(driftU),
    driftV: Int8Array.from(driftV),
  } as const satisfies FoundationTectonicSegments;
}
