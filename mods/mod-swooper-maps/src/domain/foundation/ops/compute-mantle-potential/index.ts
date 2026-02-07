import { createOp } from "@swooper/mapgen-core/authoring";
import { clamp01, clampInt, wrapDeltaPeriodic } from "@swooper/mapgen-core/lib/math";
import { createLabelRng } from "@swooper/mapgen-core/lib/rng";

import { requireMesh } from "../../lib/require.js";
import ComputeMantlePotentialContract from "./contract.js";

function distanceSqWrapped(ax: number, ay: number, bx: number, by: number, wrapWidth: number): number {
  const dx = wrapDeltaPeriodic(ax - bx, wrapWidth);
  const dy = ay - by;
  return dx * dx + dy * dy;
}

function normalizeSigned(values: Float32Array): void {
  let maxAbs = 0;
  for (let i = 0; i < values.length; i++) {
    const v = values[i] ?? 0;
    const a = Math.abs(v);
    if (a > maxAbs) maxAbs = a;
  }
  if (maxAbs <= 0) return;
  const scale = 1 / maxAbs;
  for (let i = 0; i < values.length; i++) values[i] = (values[i] ?? 0) * scale;
}

function pickPoissonSeed(params: {
  mesh: { cellCount: number; wrapWidth: number; siteX: Float32Array; siteY: Float32Array };
  rng: (max: number, label?: string) => number;
  used: Uint8Array;
  existingSeeds: number[];
  minDistSq: number;
  label: string;
}): number {
  const cellCount = params.mesh.cellCount | 0;
  const attempts = 64;
  let bestCandidate = -1;
  let bestScore = -Infinity;

  const minDistanceSq = (cellId: number): number => {
    if (params.existingSeeds.length <= 0) return Number.POSITIVE_INFINITY;
    const cx = params.mesh.siteX[cellId] ?? 0;
    const cy = params.mesh.siteY[cellId] ?? 0;
    let minSq = Number.POSITIVE_INFINITY;
    for (let i = 0; i < params.existingSeeds.length; i++) {
      const seed = params.existingSeeds[i]!;
      const sx = params.mesh.siteX[seed] ?? 0;
      const sy = params.mesh.siteY[seed] ?? 0;
      const d = distanceSqWrapped(cx, cy, sx, sy, params.mesh.wrapWidth);
      if (d < minSq) minSq = d;
      if (minSq <= params.minDistSq) break;
    }
    return minSq;
  };

  for (let attempt = 0; attempt < attempts; attempt++) {
    const candidate = params.rng(cellCount, params.label) | 0;
    if (params.used[candidate]) continue;
    const minSq = minDistanceSq(candidate);
    if (minSq >= params.minDistSq) return candidate;
    if (minSq > bestScore) {
      bestScore = minSq;
      bestCandidate = candidate;
    }
  }

  // Deterministic fallback: scan from a seeded offset for the best available candidate.
  const start = params.rng(cellCount, `${params.label}-fallback`) | 0;
  for (let i = 0; i < cellCount; i++) {
    const candidate = (start + i) % cellCount;
    if (params.used[candidate]) continue;
    const minSq = minDistanceSq(candidate);
    if (minSq > bestScore) {
      bestScore = minSq;
      bestCandidate = candidate;
      if (bestScore >= params.minDistSq) break;
    }
  }

  if (bestCandidate < 0) {
    if (cellCount > 0) {
      return 0;
    }
    throw new Error("[Foundation] MantlePotential failed to select source cell.");
  }

  return bestCandidate;
}

const computeMantlePotential = createOp(ComputeMantlePotentialContract, {
  strategies: {
    default: {
      run: (input, config) => {
        const mesh = requireMesh(input.mesh, "foundation/compute-mantle-potential");
        const rngSeed = input.rngSeed | 0;
        const rng = createLabelRng(rngSeed);
        const cellCount = mesh.cellCount | 0;

        const plumeCount = clampInt(config.plumeCount ?? 6, 0, 32);
        const downwellingCount = clampInt(config.downwellingCount ?? 6, 0, 32);
        const plumeRadius = Math.max(1e-6, config.plumeRadius ?? 0.18);
        const downwellingRadius = Math.max(1e-6, config.downwellingRadius ?? 0.18);
        const plumeAmplitude = config.plumeAmplitude ?? 1.0;
        const downwellingAmplitude = config.downwellingAmplitude ?? -1.0;
        const smoothingIterations = clampInt(config.smoothingIterations ?? 2, 0, 4);
        const smoothingAlpha = clamp01(config.smoothingAlpha ?? 0.35);
        const minSeparationScale = Math.max(0, config.minSeparationScale ?? 0.85);

        const sourceCount = plumeCount + downwellingCount;
        const sourceType = new Int8Array(sourceCount);
        const sourceCell = new Uint32Array(sourceCount);
        const sourceAmplitude = new Float32Array(sourceCount);
        const sourceRadius = new Float32Array(sourceCount);

        const used = new Uint8Array(cellCount);
        const existingSeeds: number[] = [];

        const pickSources = (count: number, type: 1 | -1, radius: number, amplitude: number, label: string) => {
          if (count <= 0) return;
          const minDist = radius * minSeparationScale;
          const minDistSq = minDist * minDist;
          for (let i = 0; i < count; i++) {
            const seed = pickPoissonSeed({
              mesh,
              rng,
              used,
              existingSeeds,
              minDistSq,
              label: `${label}-${i}`,
            });
            used[seed] = 1;
            existingSeeds.push(seed);
            const idx = existingSeeds.length - 1;
            sourceType[idx] = type;
            sourceCell[idx] = seed >>> 0;
            sourceAmplitude[idx] = amplitude;
            sourceRadius[idx] = radius;
          }
        };

        pickSources(plumeCount, 1, plumeRadius, Math.abs(plumeAmplitude), "MantlePlume");
        pickSources(downwellingCount, -1, downwellingRadius, -Math.abs(downwellingAmplitude), "MantleDownwelling");

        if (existingSeeds.length !== sourceCount) {
          throw new Error("[Foundation] MantlePotential source selection mismatch.");
        }

        const potential = new Float32Array(cellCount);
        const sourceX = new Float32Array(sourceCount);
        const sourceY = new Float32Array(sourceCount);
        for (let s = 0; s < sourceCount; s++) {
          const cell = sourceCell[s] ?? 0;
          sourceX[s] = mesh.siteX[cell] ?? 0;
          sourceY[s] = mesh.siteY[cell] ?? 0;
        }

        for (let i = 0; i < cellCount; i++) {
          const x = mesh.siteX[i] ?? 0;
          const y = mesh.siteY[i] ?? 0;
          let value = 0;
          for (let s = 0; s < sourceCount; s++) {
            const dx = wrapDeltaPeriodic(x - (sourceX[s] ?? 0), mesh.wrapWidth);
            const dy = y - (sourceY[s] ?? 0);
            const r = sourceRadius[s] ?? 0.0001;
            const inv = 1 / (r * r);
            value += (sourceAmplitude[s] ?? 0) * Math.exp(-(dx * dx + dy * dy) * inv);
          }
          potential[i] = value;
        }

        normalizeSigned(potential);

        if (smoothingIterations > 0 && smoothingAlpha > 0) {
          let current = potential;
          let next = new Float32Array(cellCount);
          for (let iter = 0; iter < smoothingIterations; iter++) {
            for (let i = 0; i < cellCount; i++) {
              const start = mesh.neighborsOffsets[i] ?? 0;
              const end = mesh.neighborsOffsets[i + 1] ?? start;
              let sum = 0;
              let count = 0;
              for (let j = start; j < end; j++) {
                const n = mesh.neighbors[j] ?? -1;
                if (n < 0 || n >= cellCount) continue;
                sum += current[n] ?? 0;
                count += 1;
              }
              const base = current[i] ?? 0;
              const avg = count > 0 ? sum / count : base;
              next[i] = base + smoothingAlpha * (avg - base);
            }
            const tmp = current;
            current = next;
            next = tmp;
          }
          if (current !== potential) {
            potential.set(current);
          }
          normalizeSigned(potential);
        }

        return {
          mantlePotential: {
            version: 1,
            cellCount,
            potential,
            sourceCount,
            sourceType,
            sourceCell,
            sourceAmplitude,
            sourceRadius,
          },
        } as const;
      },
    },
  },
});

export default computeMantlePotential;
