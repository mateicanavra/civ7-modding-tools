import { createOp } from "@swooper/mapgen-core/authoring";
import { clamp01, wrapDeltaPeriodic } from "@swooper/mapgen-core/lib/math";

import { requireMantlePotential, requireMesh } from "../../lib/require.js";
import ComputeMantleForcingContract from "./contract.js";

function clampSigned(value: number): number {
  if (!Number.isFinite(value)) return 0;
  if (value <= -1) return -1;
  if (value >= 1) return 1;
  return value;
}

const computeMantleForcing = createOp(ComputeMantleForcingContract, {
  strategies: {
    default: {
      run: (input, config) => {
        const mesh = requireMesh(input.mesh, "foundation/compute-mantle-forcing");
        const mantlePotential = requireMantlePotential(
          input.mantlePotential,
          mesh.cellCount,
          "foundation/compute-mantle-forcing"
        );
        const cellCount = mesh.cellCount | 0;

        const velocityScale = config.velocityScale ?? 1.0;
        const rotationScale = config.rotationScale ?? 0.2;
        const stressNorm = config.stressNorm ?? 1.0;
        const curvatureWeight = config.curvatureWeight ?? 0.35;
        const upwellingThreshold = clamp01(config.upwellingThreshold ?? 0.35);
        const downwellingThreshold = clamp01(config.downwellingThreshold ?? 0.35);

        const gradX = new Float32Array(cellCount);
        const gradY = new Float32Array(cellCount);
        const laplacian = new Float32Array(cellCount);

        for (let i = 0; i < cellCount; i++) {
          const start = mesh.neighborsOffsets[i] ?? 0;
          const end = mesh.neighborsOffsets[i + 1] ?? start;
          const x0 = mesh.siteX[i] ?? 0;
          const y0 = mesh.siteY[i] ?? 0;
          const base = mantlePotential.potential[i] ?? 0;

          let gx = 0;
          let gy = 0;
          let lap = 0;
          let count = 0;

          for (let j = start; j < end; j++) {
            const n = mesh.neighbors[j] ?? -1;
            if (n < 0 || n >= cellCount) continue;
            const dx = wrapDeltaPeriodic((mesh.siteX[n] ?? 0) - x0, mesh.wrapWidth);
            const dy = (mesh.siteY[n] ?? 0) - y0;
            const distSq = dx * dx + dy * dy;
            if (!Number.isFinite(distSq) || distSq <= 1e-8) continue;
            const invDist = 1 / Math.sqrt(distSq);
            const diff = (mantlePotential.potential[n] ?? 0) - base;
            gx += diff * dx * invDist;
            gy += diff * dy * invDist;
            lap += diff;
            count += 1;
          }

          if (count > 0) {
            const inv = 1 / count;
            gradX[i] = gx * inv;
            gradY[i] = gy * inv;
            laplacian[i] = lap * inv;
          } else {
            gradX[i] = 0;
            gradY[i] = 0;
            laplacian[i] = 0;
          }
        }

        const stress = new Float32Array(cellCount);
        const forcingU = new Float32Array(cellCount);
        const forcingV = new Float32Array(cellCount);
        const forcingMag = new Float32Array(cellCount);
        const upwellingClass = new Int8Array(cellCount);
        const divergence = new Float32Array(cellCount);

        let maxForcingMag = 0;
        let maxAbsLap = 0;

        for (let i = 0; i < cellCount; i++) {
          const gx = gradX[i] ?? 0;
          const gy = gradY[i] ?? 0;
          const lap = laplacian[i] ?? 0;
          const gradMag = Math.hypot(gx, gy);
          const curv = Math.abs(lap);
          stress[i] = clamp01((gradMag + curvatureWeight * curv) / Math.max(1e-6, stressNorm));

          const rotX = -gy;
          const rotY = gx;
          const ux = -velocityScale * gx + rotationScale * rotX;
          const vy = -velocityScale * gy + rotationScale * rotY;
          forcingU[i] = ux;
          forcingV[i] = vy;
          const mag = Math.hypot(ux, vy);
          forcingMag[i] = mag;

          if (mag > maxForcingMag) maxForcingMag = mag;
          const absLap = Math.abs(lap);
          if (absLap > maxAbsLap) maxAbsLap = absLap;
        }

        const magScale = maxForcingMag > 0 ? 1 / maxForcingMag : 0;
        const divScale = maxAbsLap > 0 ? 1 / maxAbsLap : 0;

        for (let i = 0; i < cellCount; i++) {
          forcingMag[i] = clamp01((forcingMag[i] ?? 0) * magScale);
          divergence[i] = clampSigned((laplacian[i] ?? 0) * divScale);

          const phi = mantlePotential.potential[i] ?? 0;
          const start = mesh.neighborsOffsets[i] ?? 0;
          const end = mesh.neighborsOffsets[i + 1] ?? start;
          let maxNeighbor = Number.NEGATIVE_INFINITY;
          let minNeighbor = Number.POSITIVE_INFINITY;
          for (let j = start; j < end; j++) {
            const n = mesh.neighbors[j] ?? -1;
            if (n < 0 || n >= cellCount) continue;
            const v = mantlePotential.potential[n] ?? 0;
            if (v > maxNeighbor) maxNeighbor = v;
            if (v < minNeighbor) minNeighbor = v;
          }

          const eps = 1e-6;
          if (phi >= maxNeighbor - eps && phi >= upwellingThreshold) {
            upwellingClass[i] = 1;
          } else if (phi <= minNeighbor + eps && phi <= -downwellingThreshold) {
            upwellingClass[i] = -1;
          } else {
            upwellingClass[i] = 0;
          }
        }

        return {
          mantleForcing: {
            version: 1,
            cellCount,
            stress,
            forcingU,
            forcingV,
            forcingMag,
            upwellingClass,
            divergence,
          },
        } as const;
      },
    },
  },
});

export default computeMantleForcing;
