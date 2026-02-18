import { createOp } from "@swooper/mapgen-core/authoring";
import { clamp01, wrapDeltaPeriodic } from "@swooper/mapgen-core/lib/math";

import { BOUNDARY_TYPE } from "../../constants.js";
import { requireCrust, requireMesh, requirePlateGraph, requirePlateMotion } from "../../lib/require.js";
import { clampByte, normalizeToInt8 } from "../../lib/tectonics/shared.js";
import type { FoundationPlateMotion } from "../compute-plate-motion/contract.js";
import ComputeTectonicSegmentsContract from "./contract.js";

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

  // 2D rigid rotation: v_rot = omega * perp(r)
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

const computeTectonicSegments = createOp(ComputeTectonicSegmentsContract, {
  strategies: {
    default: {
      run: (input, config) => {
        const mesh = requireMesh(input.mesh, "foundation/compute-tectonic-segments");
        const crust = requireCrust(input.crust, mesh.cellCount | 0, "foundation/compute-tectonic-segments");
        const plateGraph = requirePlateGraph(input.plateGraph, mesh.cellCount | 0, "foundation/compute-tectonic-segments");
        const plateMotion = requirePlateMotion(
          input.plateMotion,
          mesh.cellCount | 0,
          plateGraph.plates.length | 0,
          "foundation/compute-tectonic-segments"
        );

        const cellCount = mesh.cellCount | 0;
        const wrapWidth = mesh.wrapWidth;
        const intensityScale = config.intensityScale;
        const regimeMinIntensity = config.regimeMinIntensity | 0;

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
            const len = Math.hypot(dx, dy);
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
            const kind = boundaryRegimeFromIntensities({ compression: c, extension: e, shear: s, minIntensity: regimeMinIntensity });

            let pol = 0;
            if (kind === BOUNDARY_TYPE.convergent) {
              const aType = crust.type[i] ?? 0;
              const bType = crust.type[j] ?? 0;
              if (aType !== bType) {
                // Oceanic crust subducts under continental crust.
                if (aType === 0 && bType === 1) pol = -1;
                if (aType === 1 && bType === 0) pol = 1;
              } else if (aType === 0) {
                // Bootstrap polarity only for oceanic-oceanic early when crust types are still uniform.
                // For continental-continent convergence, keep polarity neutral (0) so downstream logic
                // does not interpret it as a subduction direction.
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
          segments: {
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
          },
        } as const;
      },
    },
  },
});

export default computeTectonicSegments;
