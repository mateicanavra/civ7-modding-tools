import { createOp } from "@swooper/mapgen-core/authoring";
import { clamp01, wrapDeltaPeriodic } from "@swooper/mapgen-core/lib/math";

import { requireMantleForcing, requireMesh, requirePlateGraph } from "../../lib/require.js";
import ComputePlateMotionContract from "./contract.js";

function clampByte(value: number): number {
  if (!Number.isFinite(value)) return 0;
  if (value <= 0) return 0;
  if (value >= 255) return 255;
  return Math.round(value) | 0;
}

function clampInt(value: number, bounds: { min: number; max: number }): number {
  const rounded = Math.round(value);
  return Math.max(bounds.min, Math.min(bounds.max, rounded));
}

const EPS = 1e-9;

const computePlateMotion = createOp(ComputePlateMotionContract, {
  strategies: {
    default: {
      run: (input, config) => {
        const mesh = requireMesh(input.mesh, "foundation/compute-plate-motion");
        const plateGraph = requirePlateGraph(
          input.plateGraph,
          mesh.cellCount | 0,
          "foundation/compute-plate-motion"
        );
        const mantleForcing = requireMantleForcing(
          input.mantleForcing,
          mesh.cellCount | 0,
          "foundation/compute-plate-motion"
        );

        const cellCount = mesh.cellCount | 0;
        const plateCount = plateGraph.plates.length | 0;
        const wrapWidth = mesh.wrapWidth;

        const omegaFactor = Math.max(0, config.omegaFactor ?? 1);
        const plateRadiusMin = Math.max(1e-6, config.plateRadiusMin ?? 1);
        const residualNormScale = Math.max(0.01, config.residualNormScale ?? 1);
        const p90NormScale = Math.max(0.01, config.p90NormScale ?? 1);
        const histogramBins = clampInt(config.histogramBins ?? 32, { min: 8, max: 128 });
        const smoothingSteps = clampInt(config.smoothingSteps ?? 0, { min: 0, max: 1 });

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
          const omegaMax =
            omegaFactor > 0
              ? (omegaFactor * meanForcingSpeed) / Math.max(plateRadiusMin, radiusRms)
              : 0;
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

        // Compute P90 from an uncapped residual distribution.
        // residualNorm is a normalization scale, not a cap; P90 can exceed residualNorm where warranted.
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

          // Use log-spaced bins so extreme outliers do not collapse all residuals into the first bucket.
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
          plateMotion: {
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
          },
        } as const;
      },
    },
  },
});

export default computePlateMotion;
