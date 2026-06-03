import { createStrategy } from "@swooper/mapgen-core/authoring";
import { forEachHexNeighborOddQ } from "@swooper/mapgen-core/lib/grid";

import PlanRidgesContract from "../contract.js";
import type { PlanRidgesTypes } from "../types.js";
import {
  computeFracturePotential,
  computeMountainScore,
  computeOrogenyPotential,
  isStrictLocalMaximumHexWithTies,
  encodeNormalizedToU8,
  normalizeMountainFractal,
  resolveBoundaryStrength,
  resolveDriverStrength,
} from "../../mountains-shared/rules.js";

function validateRidgesInputs(input: PlanRidgesTypes["input"]): {
  size: number;
  landMask: Uint8Array;
  boundaryCloseness: Uint8Array;
  boundaryType: Uint8Array;
  upliftPotential: Uint8Array;
  collisionPotential: Uint8Array;
  subductionPotential: Uint8Array;
  riftPotential: Uint8Array;
  tectonicStress: Uint8Array;
  beltAge: Uint8Array;
  fractalMountain: Int16Array;
} {
  const { width, height } = input;
  const size = Math.max(0, (width | 0) * (height | 0));

  const landMask = input.landMask as Uint8Array;
  const boundaryCloseness = input.boundaryCloseness as Uint8Array;
  const boundaryType = input.boundaryType as Uint8Array;
  const upliftPotential = input.upliftPotential as Uint8Array;
  const collisionPotential = input.collisionPotential as Uint8Array;
  const subductionPotential = input.subductionPotential as Uint8Array;
  const riftPotential = input.riftPotential as Uint8Array;
  const tectonicStress = input.tectonicStress as Uint8Array;
  const beltAge = input.beltAge as Uint8Array;
  const fractalMountain = input.fractalMountain as Int16Array;

  if (
    landMask.length !== size ||
    boundaryCloseness.length !== size ||
    boundaryType.length !== size ||
    upliftPotential.length !== size ||
    collisionPotential.length !== size ||
    subductionPotential.length !== size ||
    riftPotential.length !== size ||
    tectonicStress.length !== size ||
    beltAge.length !== size ||
    fractalMountain.length !== size
  ) {
    throw new Error("[PlanRidges] Input tensors must match width*height.");
  }

  return {
    size,
    landMask,
    boundaryCloseness,
    boundaryType,
    upliftPotential,
    collisionPotential,
    subductionPotential,
    riftPotential,
    tectonicStress,
    beltAge,
    fractalMountain,
  };
}

function markSpineExclusion(params: {
  exclusionMask: Uint8Array;
  startIndex: number;
  width: number;
  height: number;
  maxDistance: number;
}): void {
  const { exclusionMask, startIndex, width, height } = params;
  const maxDistance = Math.max(0, Math.min(12, Math.round(params.maxDistance))) | 0;
  const distance = new Uint8Array(exclusionMask.length);
  distance.fill(255);
  const queue = [startIndex];
  distance[startIndex] = 0;
  exclusionMask[startIndex] = 1;

  let head = 0;
  while (head < queue.length) {
    const i = queue[head++]!;
    const d = distance[i] ?? 255;
    if (d >= maxDistance) continue;

    const x = i % width;
    const y = Math.floor(i / width);
    forEachHexNeighborOddQ(x, y, width, height, (nx, ny) => {
      const ni = ny * width + nx;
      if ((distance[ni] ?? 255) <= d + 1) return;
      distance[ni] = (d + 1) as number;
      exclusionMask[ni] = 1;
      queue.push(ni);
    });
  }
}

function applyRangeEnvelope(closenessNorm: number, rangeEnvelopeScale: number): number {
  return Math.max(0, Math.min(1, closenessNorm * Math.max(0.25, rangeEnvelopeScale)));
}

export const defaultStrategy = createStrategy(PlanRidgesContract, "default", {
  run: (input, config) => {
    const { width, height } = input;
    const w = width | 0;
    const h = height | 0;
    const { size, landMask, boundaryCloseness, boundaryType, upliftPotential, collisionPotential, subductionPotential, riftPotential, tectonicStress, beltAge, fractalMountain } =
      validateRidgesInputs(input);

    const mountainMask = new Uint8Array(size);
    const orogenyPotential = new Uint8Array(size);
    const fracturePotential = new Uint8Array(size);
    const mountainScoreByTile = new Float32Array(size);

    const boundaryGate = Math.min(0.99, Math.max(0, config.boundaryGate));
    const falloffExponent = config.boundaryExponent;
    const oldBeltMountainScale = Math.max(0, Math.min(1, config.oldBeltMountainScale));
    const mountainMaxFraction = Math.max(0, Math.min(1, config.mountainMaxFraction));
    const mountainMinFraction = Math.max(0, Math.min(mountainMaxFraction, config.mountainMinFraction));
    const mountainSpineFraction = Math.max(0, Math.min(1, config.mountainSpineFraction));
    const mountainThreshold = Math.max(0, config.mountainThreshold);
    const mountainShoulderThreshold =
      mountainThreshold * Math.max(0, Math.min(1, config.mountainShoulderThresholdScale));
    const dilationSteps = Math.max(0, Math.min(6, Math.round(config.mountainSpineDilationSteps))) | 0;
    const spineMinDistance = Math.max(0, Math.min(12, Math.round(config.mountainSpineMinDistance))) | 0;
    const rangeEnvelopeScale = Math.max(0.25, Math.min(4, config.rangeEnvelopeScale));

    let landCount = 0;
    for (let i = 0; i < size; i++) if (landMask[i] === 1) landCount++;

    for (let i = 0; i < size; i++) {
      if (landMask[i] === 0) continue;

      const closenessNorm = applyRangeEnvelope(boundaryCloseness[i] / 255, rangeEnvelopeScale);
      const boundaryStrength = resolveBoundaryStrength(closenessNorm, boundaryGate, falloffExponent);
      // Diagnostics should remain continuous even when placement is gated.
      // The gate exists to prevent low-signal residual fields from producing mountains everywhere,
      // but the underlying physical proximity signal does not have a discontinuity.
      const boundaryInfluence = Math.pow(closenessNorm, falloffExponent);

      const collisionUplift = collisionPotential[i] / 255;
      const subductionUplift = subductionPotential[i] / 255;
      const uplift = Math.max(upliftPotential[i] / 255, collisionUplift, subductionUplift);
      const stress = tectonicStress[i] / 255;
      const rift = riftPotential[i] / 255;
      const bType = boundaryType[i];

      const driverByte = Math.max(upliftPotential[i] ?? 0, collisionPotential[i] ?? 0, subductionPotential[i] ?? 0, tectonicStress[i] ?? 0, riftPotential[i] ?? 0);
      const driverStrength = resolveDriverStrength({
        driverByte,
        driverSignalByteMin: config.driverSignalByteMin,
        driverExponent: config.driverExponent,
      });

      const fractal = normalizeMountainFractal(fractalMountain[i]);

      const orogeny = computeOrogenyPotential({
        boundaryStrength: boundaryInfluence,
        boundaryType: bType,
        uplift,
        stress,
        rift,
        config,
      });
      orogenyPotential[i] = encodeNormalizedToU8(orogeny);

      const fracture = computeFracturePotential({ boundaryStrength: boundaryInfluence, stress, rift, config });
      fracturePotential[i] = encodeNormalizedToU8(fracture);

      const score = computeMountainScore({
        boundaryStrength,
        boundaryType: bType,
        uplift,
        collisionUplift,
        subductionUplift,
        stress,
        rift,
        fractal,
        driverStrength,
        config,
      });

      // Age attenuation: old belts should transition from "mountain" ridges to hills/plateaus.
      const ageNorm = (beltAge[i] ?? 0) / 255;
      const ageScale = 1 - ageNorm * (1 - oldBeltMountainScale);
      mountainScoreByTile[i] = score * ageScale;
    }

    const mountainTarget = Math.max(0, Math.min(landCount, Math.round(landCount * mountainMaxFraction))) | 0;
    const mountainMinTarget = Math.max(0, Math.min(mountainTarget, Math.round(landCount * mountainMinFraction))) | 0;
    if (mountainTarget > 0) {
      // 1) Select ridge spines as local maxima of the mountain score.
      const spineCandidates: number[] = [];
      for (let i = 0; i < size; i++) {
        if (landMask[i] === 0) continue;
        const score = mountainScoreByTile[i] ?? 0;
        // Score is already physics-gated by driver strength; mountainThreshold is an authored cutoff.
        if (!(score >= mountainThreshold)) continue;
        if (
          isStrictLocalMaximumHexWithTies({
            i,
            width: w,
            height: h,
            values: mountainScoreByTile,
            mask: landMask,
          })
        ) {
          spineCandidates.push(i);
        }
      }

      spineCandidates.sort((a, b) => {
        const sa = mountainScoreByTile[a] ?? 0;
        const sb = mountainScoreByTile[b] ?? 0;
        if (sb !== sa) return sb - sa;
        return a - b;
      });

      let spineTarget = Math.round(landCount * mountainSpineFraction) | 0;
      spineTarget = Math.max(0, Math.min(spineCandidates.length, spineTarget));
      // Ensure at least one spine when mountains are allowed and candidates exist.
      if (spineTarget === 0 && spineCandidates.length > 0) spineTarget = 1;
      // If the overall mountain cap is smaller, clamp spines to it.
      spineTarget = Math.min(spineTarget, mountainTarget);

      const spineExclusionMask = new Uint8Array(size);
      let mountainCount = 0;
      for (const idx of spineCandidates) {
        if (mountainCount >= spineTarget) break;
        if (spineMinDistance > 0 && spineExclusionMask[idx] === 1) continue;
        mountainMask[idx] = 1;
        mountainCount++;
        if (spineMinDistance > 0) {
          markSpineExclusion({
            exclusionMask: spineExclusionMask,
            startIndex: idx,
            width: w,
            height: h,
            maxDistance: spineMinDistance,
          });
        }
      }

      // 2) Expand around spines for limited ridge width, respecting the hard cap.
      for (let step = 0; step < dilationSteps && mountainCount < mountainTarget; step++) {
        const frontier: number[] = [];
        for (let i = 0; i < size; i++) {
          if (landMask[i] === 0) continue;
          if (mountainMask[i] === 1) continue;
          const score = mountainScoreByTile[i] ?? 0;
          if (!(score >= mountainShoulderThreshold)) continue;

          const x = i % w;
          const y = Math.floor(i / w);
          let near = false;
          forEachHexNeighborOddQ(x, y, w, h, (nx, ny) => {
            const ni = ny * w + nx;
            if (mountainMask[ni] === 1) near = true;
          });
          if (!near) continue;
          frontier.push(i);
        }

        frontier.sort((a, b) => {
          const sa = mountainScoreByTile[a] ?? 0;
          const sb = mountainScoreByTile[b] ?? 0;
          if (sb !== sa) return sb - sa;
          return a - b;
        });

        for (const i of frontier) {
          if (mountainCount >= mountainTarget) break;
          if (mountainMask[i] === 1) continue;
          mountainMask[i] = 1;
          mountainCount++;
        }
      }

      // If dilation can't reach the target (e.g. very sparse ridges), fill remaining budget by
      // selecting the best remaining physics-gated tiles globally.
      if (mountainCount < mountainTarget) {
        const remaining: number[] = [];
        for (let i = 0; i < size; i++) {
          if (landMask[i] === 0) continue;
          if (mountainMask[i] === 1) continue;
          const score = mountainScoreByTile[i] ?? 0;
          if (!(score >= mountainShoulderThreshold)) continue;
          remaining.push(i);
        }
        remaining.sort((a, b) => {
          const sa = mountainScoreByTile[a] ?? 0;
          const sb = mountainScoreByTile[b] ?? 0;
          if (sb !== sa) return sb - sa;
          return a - b;
        });
        for (const i of remaining) {
          if (mountainCount >= mountainTarget) break;
          if (spineMinDistance > 0 && spineExclusionMask[i] === 1) continue;
          mountainMask[i] = 1;
          mountainCount++;
          if (spineMinDistance > 0) {
            markSpineExclusion({
              exclusionMask: spineExclusionMask,
              startIndex: i,
              width: w,
              height: h,
              maxDistance: spineMinDistance,
            });
          }
        }
      }

      // Keep large Earthlike worlds from visually collapsing to a handful of peaks when the
      // absolute threshold is too conservative for the current Foundation belt intensities.
      // Scores remain physics-gated, so this cannot create noise-only mountain belts.
      if (mountainCount < mountainMinTarget) {
        const floorCandidates: number[] = [];
        for (let i = 0; i < size; i++) {
          if (landMask[i] === 0) continue;
          if (mountainMask[i] === 1) continue;
          const score = mountainScoreByTile[i] ?? 0;
          if (!(score > 0)) continue;
          floorCandidates.push(i);
        }
        floorCandidates.sort((a, b) => {
          const sa = mountainScoreByTile[a] ?? 0;
          const sb = mountainScoreByTile[b] ?? 0;
          if (sb !== sa) return sb - sa;
          return a - b;
        });
        for (const i of floorCandidates) {
          if (mountainCount >= mountainMinTarget) break;
          if (mountainMask[i] === 1) continue;
          mountainMask[i] = 1;
          mountainCount++;
        }
      }
    }

    return { mountainMask, orogenyPotential, fracturePotential };
  },
});
