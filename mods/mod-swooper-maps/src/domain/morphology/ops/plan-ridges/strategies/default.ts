import { createStrategy } from "@swooper/mapgen-core/authoring";
import {
  forEachHexNeighborOddQ,
  forEachHexNeighborOddQWithDirection,
  hexDistanceOddQPeriodicX,
  resolveTileAreaSpacingTarget,
} from "@swooper/mapgen-core/lib/grid";
import { resolveBoundaryStrength } from "../../../model/policy/boundary-strength.js";
import { resolveDriverStrength } from "../../../model/policy/driver-strength.js";
import { normalizeMountainFractal } from "../../../model/policy/mountain-fractal.js";
import type {
  FracturePotentialPolicy,
  MountainScorePolicy,
  OrogenyPotentialPolicy,
} from "../../../model/policy/mountain-scoring-policy.js";
import { encodeNormalizedToU8 } from "../../../model/policy/normalized-byte.js";
import { computeOrogenyPotential } from "../../../model/policy/orogeny-potential.js";
import { computeFracturePotential } from "../rules/fracture-potential.js";
import { isStrictLocalMaximumHexWithTies } from "../rules/local-maximum.js";
import { computeMountainScore } from "../rules/mountain-score.js";
import PlanRidgesContract from "../contract.js";
import type { PlanRidgesTypes } from "../types.js";

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
  const maxDistance = Math.max(0, Math.min(32, Math.round(params.maxDistance))) | 0;
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

function resolveStrongestDriverByte(params: {
  i: number;
  upliftPotential: Uint8Array;
  collisionPotential: Uint8Array;
  subductionPotential: Uint8Array;
  riftPotential: Uint8Array;
  tectonicStress: Uint8Array;
}): number {
  const {
    i,
    upliftPotential,
    collisionPotential,
    subductionPotential,
    riftPotential,
    tectonicStress,
  } = params;
  return Math.max(
    upliftPotential[i] ?? 0,
    collisionPotential[i] ?? 0,
    subductionPotential[i] ?? 0,
    tectonicStress[i] ?? 0,
    riftPotential[i] ?? 0
  );
}

function findCompatibleAdjacentRangeOwner(params: {
  i: number;
  width: number;
  height: number;
  mountainMask: Uint8Array;
  rangeOwner: Int32Array;
}): number {
  const { i, width, height, mountainMask, rangeOwner } = params;
  const x = i % width;
  const y = Math.floor(i / width);
  let owner = -1;
  let conflict = false;
  forEachHexNeighborOddQ(x, y, width, height, (nx, ny) => {
    const ni = ny * width + nx;
    if (mountainMask[ni] !== 1) return;
    const neighborOwner = rangeOwner[ni] ?? -1;
    if (neighborOwner < 0) return;
    if (owner < 0) {
      owner = neighborOwner;
      return;
    }
    if (owner !== neighborOwner) conflict = true;
  });
  return conflict ? -2 : owner;
}

const LARGE_MAP_AREA = 96 * 60;
const OPPOSITE_DIRECTION = [1, 0, 3, 2, 5, 4] as const;

function resolveMapScaledRangeLength(width: number, height: number, lengthTiles: number): number {
  if (!Number.isFinite(lengthTiles) || lengthTiles <= 1) return 0;
  const scale = Math.sqrt(Math.max(1, width * height) / LARGE_MAP_AREA);
  return Math.max(2, Math.round(lengthTiles * scale)) | 0;
}

function directionContinuationScore(previousDirection: number, nextDirection: number): number {
  if (previousDirection < 0) return 0;
  if (nextDirection === previousDirection) return 1.4;
  if (nextDirection === (OPPOSITE_DIRECTION[previousDirection] ?? -1)) return -3;
  return 0;
}

function axisDirectionScore(axisDirection: number, nextDirection: number): number {
  if (axisDirection < 0) return 0;
  if (nextDirection === axisDirection) return 7;
  if (nextDirection === (OPPOSITE_DIRECTION[axisDirection] ?? -1)) return -10;
  return -1.25;
}

export const defaultStrategy = createStrategy(PlanRidgesContract, "default", {
  run: (input, config) => {
    const { width, height } = input;
    const w = width | 0;
    const h = height | 0;
    const {
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
    } = validateRidgesInputs(input);

    const mountainMask = new Uint8Array(size);
    const mountainRegionMask = new Uint8Array(size);
    const mountainRegionIdByTile = new Int32Array(size);
    mountainRegionIdByTile.fill(-1);
    const orogenyPotential = new Uint8Array(size);
    const fracturePotential = new Uint8Array(size);
    const mountainScoreByTile = new Float32Array(size);

    const boundaryGate = Math.min(0.99, Math.max(0, config.boundaryGate));
    const falloffExponent = config.boundaryExponent;
    const oldBeltMountainScale = Math.max(0, Math.min(1, config.oldBeltMountainScale));
    const mountainMaxFraction = Math.max(0, Math.min(1, config.mountainMaxFraction));
    const mountainMinFraction = Math.max(
      0,
      Math.min(mountainMaxFraction, config.mountainMinFraction)
    );
    const mountainSpineFraction = Math.max(0, Math.min(1, config.mountainSpineFraction));
    const mountainRangeSpacingTiles = Math.max(0, config.mountainRangeSpacingTiles);
    const rangeSystemTarget = resolveTileAreaSpacingTarget({
      width: w,
      height: h,
      spacingTiles: mountainRangeSpacingTiles,
    });
    const mountainRegionRadiusTiles =
      Math.max(0, Math.min(32, Math.round(config.mountainRegionRadiusTiles))) | 0;
    const mountainThreshold = Math.max(0, config.mountainThreshold);
    const mountainShoulderThreshold =
      mountainThreshold * Math.max(0, Math.min(1, config.mountainShoulderThresholdScale));
    const mountainFloorDriverByteMin = Math.max(0, Math.round(config.driverSignalByteMin)) | 0;
    const orogenyPolicy: OrogenyPotentialPolicy = {
      orogenyCollisionStressWeight: config.orogenyCollisionStressWeight,
      orogenyCollisionUpliftWeight: config.orogenyCollisionUpliftWeight,
      orogenyTransformStressWeight: config.orogenyTransformStressWeight,
      orogenyDivergentRiftWeight: config.orogenyDivergentRiftWeight,
      orogenyDivergentStressWeight: config.orogenyDivergentStressWeight,
    };
    const fracturePolicy: FracturePotentialPolicy = {
      fractureBoundaryWeight: config.fractureBoundaryWeight,
      fractureStressWeight: config.fractureStressWeight,
      fractureRiftWeight: config.fractureRiftWeight,
    };
    const mountainScorePolicy: MountainScorePolicy = {
      ...orogenyPolicy,
      tectonicIntensity: config.tectonicIntensity,
      boundaryWeight: config.boundaryWeight,
      convergenceBonus: config.convergenceBonus,
      upliftWeight: config.upliftWeight,
      fractalWeight: config.fractalWeight,
      riftPenalty: config.riftPenalty,
      transformPenalty: config.transformPenalty,
      interiorPenaltyWeight: config.interiorPenaltyWeight,
      mountainFractalScale: config.mountainFractalScale,
      mountainInteriorUpliftScale: config.mountainInteriorUpliftScale,
      mountainCollisionStressWeight: config.mountainCollisionStressWeight,
      mountainCollisionUpliftWeight: config.mountainCollisionUpliftWeight,
      mountainSubductionUpliftWeight: config.mountainSubductionUpliftWeight,
      mountainConvergenceFractalBase: config.mountainConvergenceFractalBase,
      mountainConvergenceFractalSpan: config.mountainConvergenceFractalSpan,
      riftDepth: config.riftDepth,
    };
    const dilationSteps =
      Math.max(0, Math.min(6, Math.round(config.mountainSpineDilationSteps))) | 0;
    const spineMinDistance =
      Math.max(0, Math.min(32, Math.round(config.mountainSpineMinDistance))) | 0;
    const rangeLengthTarget = resolveMapScaledRangeLength(w, h, config.mountainRangeLengthTiles);
    // Range spacing derives how many systems a map should carry. It must not
    // also act as a hidden exclusion radius, or the count knob asks for ranges
    // that the selection pass later forbids from existing.
    const effectiveSpineMinDistance =
      rangeSystemTarget > 0 ? Math.max(spineMinDistance, dilationSteps * 2 + 1) : spineMinDistance;
    const rangeEnvelopeScale = Math.max(0.25, Math.min(4, config.rangeEnvelopeScale));

    let landCount = 0;
    for (let i = 0; i < size; i++) if (landMask[i] === 1) landCount++;

    for (let i = 0; i < size; i++) {
      if (landMask[i] === 0) continue;

      const closenessNorm = applyRangeEnvelope(boundaryCloseness[i] / 255, rangeEnvelopeScale);
      const boundaryStrength = resolveBoundaryStrength(
        closenessNorm,
        boundaryGate,
        falloffExponent
      );
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

      const driverByte = resolveStrongestDriverByte({
        i,
        upliftPotential,
        collisionPotential,
        subductionPotential,
        riftPotential,
        tectonicStress,
      });
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
        config: orogenyPolicy,
      });
      orogenyPotential[i] = encodeNormalizedToU8(orogeny);

      const fracture = computeFracturePotential({
        boundaryStrength: boundaryInfluence,
        stress,
        rift,
        config: fracturePolicy,
      });
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
        config: mountainScorePolicy,
      });

      // Age attenuation: old belts should transition from "mountain" ridges to hills/plateaus.
      const ageNorm = (beltAge[i] ?? 0) / 255;
      const ageScale = 1 - ageNorm * (1 - oldBeltMountainScale);
      mountainScoreByTile[i] = score * ageScale;
    }

    const mountainTarget =
      Math.max(0, Math.min(landCount, Math.round(landCount * mountainMaxFraction))) | 0;
    const mountainMinTarget =
      Math.max(0, Math.min(mountainTarget, Math.round(landCount * mountainMinFraction))) | 0;
    if (mountainTarget > 0) {
      const computeRangeSeedPotential = (i: number): number => {
        const score = mountainScoreByTile[i] ?? 0;
        const driverByte = resolveStrongestDriverByte({
          i,
          upliftPotential,
          collisionPotential,
          subductionPotential,
          riftPotential,
          tectonicStress,
        });
        const corridorPotential = Math.max(
          (orogenyPotential[i] ?? 0) / 255,
          ((fracturePotential[i] ?? 0) / 255) * 0.75,
          ((boundaryCloseness[i] ?? 0) / 255) * 0.45
        );
        return score + corridorPotential * 0.55 + (driverByte / 255) * 0.35;
      };
      const hasRangeSeedSupport = (i: number): boolean => {
        if (landMask[i] !== 1) return false;
        if (computeRangeSeedPotential(i) <= 0) return false;
        const driverByte = resolveStrongestDriverByte({
          i,
          upliftPotential,
          collisionPotential,
          subductionPotential,
          riftPotential,
          tectonicStress,
        });
        return (
          driverByte >= Math.max(0, Math.round(mountainFloorDriverByteMin * 0.35)) ||
          (orogenyPotential[i] ?? 0) > 0 ||
          (fracturePotential[i] ?? 0) > 0 ||
          (boundaryCloseness[i] ?? 0) > 0
        );
      };

      // 1) Select ridge spines as local maxima of the mountain score.
      const spineCandidates: number[] = [];
      const spineCandidateMask = new Uint8Array(size);
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
          spineCandidateMask[i] = 1;
        }
      }

      if (rangeSystemTarget > 0 && spineCandidates.length < rangeSystemTarget) {
        for (let i = 0; i < size; i++) {
          if (landMask[i] === 0) continue;
          if (spineCandidateMask[i] === 1) continue;
          const score = mountainScoreByTile[i] ?? 0;
          if (!(score >= mountainThreshold)) continue;
          spineCandidates.push(i);
          spineCandidateMask[i] = 1;
        }
      }

      spineCandidates.sort((a, b) => {
        const sa = mountainScoreByTile[a] ?? 0;
        const sb = mountainScoreByTile[b] ?? 0;
        if (sb !== sa) return sb - sa;
        return a - b;
      });

      let spineTarget =
        rangeSystemTarget > 0
          ? rangeSystemTarget
          : Math.round(landCount * mountainSpineFraction) | 0;
      spineTarget = Math.max(0, Math.min(spineCandidates.length, spineTarget));
      // Ensure at least one spine when mountains are allowed and candidates exist.
      if (spineTarget === 0 && spineCandidates.length > 0) spineTarget = 1;
      // If the overall mountain cap is smaller, clamp spines to it.
      spineTarget = Math.min(spineTarget, mountainTarget);

      const spineExclusionMask = new Uint8Array(size);
      const selectedCandidateMask = new Uint8Array(size);
      const selectedSpines: number[] = [];
      const rangeOwner = new Int32Array(size);
      rangeOwner.fill(-1);
      let mountainCount = 0;
      const addLocalShoulders = (
        owner: number,
        spine: number,
        maxShoulders: number,
        target: number
      ): void => {
        if (mountainCount >= target) return;
        const localShoulders: number[] = [];
        const x = spine % w;
        const y = Math.floor(spine / w);
        forEachHexNeighborOddQ(x, y, w, h, (nx, ny) => {
          const ni = ny * w + nx;
          if (landMask[ni] === 0) return;
          if (mountainMask[ni] === 1) return;
          const score = mountainScoreByTile[ni] ?? 0;
          if (!(score >= mountainShoulderThreshold)) return;
          localShoulders.push(ni);
        });
        localShoulders.sort((a, b) => {
          const sa = mountainScoreByTile[a] ?? 0;
          const sb = mountainScoreByTile[b] ?? 0;
          if (sb !== sa) return sb - sa;
          return a - b;
        });
        for (const i of localShoulders.slice(0, Math.max(0, maxShoulders | 0))) {
          if (mountainCount >= target) break;
          if (mountainMask[i] === 1) continue;
          const adjacentOwner = findCompatibleAdjacentRangeOwner({
            i,
            width: w,
            height: h,
            mountainMask,
            rangeOwner,
          });
          if (adjacentOwner >= 0 && adjacentOwner !== owner) continue;
          if (adjacentOwner === -2) continue;
          mountainMask[i] = 1;
          rangeOwner[i] = owner;
          mountainCount++;
        }
      };
      const addDistributedFloorAnchors = (desiredOwnerCount: number, target: number): void => {
        if (rangeSystemTarget <= 0 || effectiveSpineMinDistance <= 0) return;
        const ownerTarget = Math.max(0, Math.min(desiredOwnerCount | 0, target));
        while (selectedSpines.length < ownerTarget && mountainCount < target) {
          let bestIdx = -1;
          let bestRank = Number.NEGATIVE_INFINITY;
          for (let i = 0; i < size; i++) {
            if (landMask[i] === 0) continue;
            if (mountainMask[i] === 1) continue;
            if (spineExclusionMask[i] === 1) continue;
            const adjacentOwner = findCompatibleAdjacentRangeOwner({
              i,
              width: w,
              height: h,
              mountainMask,
              rangeOwner,
            });
            if (adjacentOwner !== -1) continue;
            if (!hasRangeSeedSupport(i)) continue;
            const rangeSeedPotential = computeRangeSeedPotential(i);

            let nearestSelectedDistance = Number.POSITIVE_INFINITY;
            for (const selected of selectedSpines) {
              const distance = hexDistanceOddQPeriodicX(i, selected, w);
              if (distance < nearestSelectedDistance) nearestSelectedDistance = distance;
            }
            const distributionScale =
              selectedSpines.length === 0
                ? 1
                : Math.min(
                    1,
                    nearestSelectedDistance / Math.max(1, effectiveSpineMinDistance * 1.5)
                  );
            const rank = rangeSeedPotential * (0.35 + distributionScale * 0.65);
            if (rank > bestRank || (rank === bestRank && (bestIdx < 0 || i < bestIdx))) {
              bestIdx = i;
              bestRank = rank;
            }
          }

          if (bestIdx < 0) break;
          const owner = selectedSpines.length;
          selectedSpines.push(bestIdx);
          mountainMask[bestIdx] = 1;
          rangeOwner[bestIdx] = owner;
          mountainCount++;
          markSpineExclusion({
            exclusionMask: spineExclusionMask,
            startIndex: bestIdx,
            width: w,
            height: h,
            maxDistance: effectiveSpineMinDistance,
          });
          addLocalShoulders(owner, bestIdx, 2, target);
        }
      };
      const extendRangeSpines = (targetLength: number, target: number): void => {
        if (targetLength <= 1 || selectedSpines.length === 0) return;

        const regionSupportDriverMin =
          Math.max(1, Math.round(config.driverSignalByteMin * 0.25)) | 0;
        const ownerMountainCounts = new Uint16Array(selectedSpines.length);
        const ownerCorridorCounts = new Uint16Array(selectedSpines.length);
        const ownerAxisCounts = new Uint16Array(selectedSpines.length);
        const rangeAxisMask = new Uint8Array(size);
        for (let owner = 0; owner < selectedSpines.length; owner++) {
          const spine = selectedSpines[owner]!;
          if (landMask[spine] !== 1) continue;
          rangeAxisMask[spine] = 1;
          ownerAxisCounts[owner] = 1;
        }
        for (let i = 0; i < size; i++) {
          const owner = rangeOwner[i] ?? -1;
          if (owner < 0 || owner >= selectedSpines.length) continue;
          ownerCorridorCounts[owner] = (ownerCorridorCounts[owner] ?? 0) + 1;
          if (mountainMask[i] === 1)
            ownerMountainCounts[owner] = (ownerMountainCounts[owner] ?? 0) + 1;
        }

        const ownerMountainBudget =
          Math.max(1, Math.floor(target / Math.max(1, selectedSpines.length))) | 0;
        const nominalArmBudget = Math.max(1, Math.floor((targetLength - 1) / 2)) | 0;
        const fullArmBudget = Math.max(1, targetLength - 1) | 0;

        const promoteCorridorTile = (owner: number, index: number): void => {
          if (rangeOwner[index] < 0) {
            rangeOwner[index] = owner;
            ownerCorridorCounts[owner] = (ownerCorridorCounts[owner] ?? 0) + 1;
          }
          if (rangeAxisMask[index] !== 1) {
            rangeAxisMask[index] = 1;
            ownerAxisCounts[owner] = (ownerAxisCounts[owner] ?? 0) + 1;
          }
          if (mountainMask[index] === 1) return;
          if (mountainCount >= target) return;
          if ((ownerMountainCounts[owner] ?? 0) >= ownerMountainBudget) return;

          const score = mountainScoreByTile[index] ?? 0;
          const driverByte = resolveStrongestDriverByte({
            i: index,
            upliftPotential,
            collisionPotential,
            subductionPotential,
            riftPotential,
            tectonicStress,
          });
          const mountainSupported =
            score >= mountainShoulderThreshold * 0.55 ||
            driverByte >= Math.max(regionSupportDriverMin, mountainFloorDriverByteMin);
          if (!mountainSupported) return;

          mountainMask[index] = 1;
          ownerMountainCounts[owner] = (ownerMountainCounts[owner] ?? 0) + 1;
          mountainCount++;
        };

        const pickAxisStep = (params: {
          owner: number;
          current: number;
          seen: Uint8Array;
          axisDirection: number;
          previousDirection: number;
        }): { index: number; direction: number; rank: number } | undefined => {
          const { owner, current, seen, axisDirection, previousDirection } = params;
          const x = current % w;
          const y = Math.floor(current / w);
          let bestIndex = -1;
          let bestDirection = -1;
          let bestRank = Number.NEGATIVE_INFINITY;

          forEachHexNeighborOddQWithDirection(x, y, w, h, (nx, ny, direction) => {
            const ni = ny * w + nx;
            if (landMask[ni] !== 1) return;
            if (seen[ni] === 1) return;
            const existingOwner = rangeOwner[ni] ?? -1;
            if (existingOwner >= 0 && existingOwner !== owner) return;

            const score = mountainScoreByTile[ni] ?? 0;
            const driverByte = resolveStrongestDriverByte({
              i: ni,
              upliftPotential,
              collisionPotential,
              subductionPotential,
              riftPotential,
              tectonicStress,
            });
            const rangeSeedPotential = computeRangeSeedPotential(ni);
            const supported =
              rangeSeedPotential > 0 ||
              driverByte >= regionSupportDriverMin ||
              (boundaryCloseness[ni] ?? 0) > 0;
            if (!supported && direction !== axisDirection) return;

            const rank =
              axisDirectionScore(axisDirection, direction) +
              directionContinuationScore(previousDirection, direction) +
              rangeSeedPotential * 1.35 +
              score * 0.75 +
              driverByte / 255 +
              ((boundaryCloseness[ni] ?? 0) / 255) * 0.5;
            if (rank > bestRank || (rank === bestRank && (bestIndex < 0 || ni < bestIndex))) {
              bestIndex = ni;
              bestDirection = direction;
              bestRank = rank;
            }
          });

          if (bestIndex < 0) return undefined;
          return { index: bestIndex, direction: bestDirection, rank: bestRank };
        };

        const scoreAxisArm = (
          owner: number,
          startIndex: number,
          axisDirection: number
        ): {
          score: number;
          length: number;
        } => {
          const seen = new Uint8Array(size);
          seen[startIndex] = 1;
          let current = startIndex;
          let previousDirection = axisDirection;
          let score = 0;
          let length = 1;
          for (let step = 0; step < fullArmBudget; step++) {
            const next = pickAxisStep({ owner, current, seen, axisDirection, previousDirection });
            if (!next) break;
            seen[next.index] = 1;
            current = next.index;
            previousDirection = next.direction;
            score += next.rank;
            length++;
          }
          return { score, length };
        };

        const chooseAxisDirection = (owner: number, startIndex: number): number => {
          let bestDirection = -1;
          let bestScore = Number.NEGATIVE_INFINITY;
          for (let direction = 0; direction < 6; direction++) {
            const opposite = OPPOSITE_DIRECTION[direction] ?? -1;
            if (opposite < 0 || opposite < direction) continue;
            const forward = scoreAxisArm(owner, startIndex, direction);
            const reverse = scoreAxisArm(owner, startIndex, opposite);
            const score = (forward.length + reverse.length) * 4 + forward.score + reverse.score;
            if (
              score > bestScore ||
              (score === bestScore && (bestDirection < 0 || direction < bestDirection))
            ) {
              bestDirection = direction;
              bestScore = score;
            }
          }
          return bestDirection;
        };

        const extendArm = (
          owner: number,
          startIndex: number,
          seen: Uint8Array,
          axisDirection: number,
          maxSteps: number
        ): void => {
          let current = startIndex;
          let previousDirection = axisDirection;
          for (let step = 0; step < maxSteps; step++) {
            if ((ownerAxisCounts[owner] ?? 0) >= targetLength) return;
            const next = pickAxisStep({ owner, current, seen, axisDirection, previousDirection });
            if (!next) return;
            seen[next.index] = 1;
            promoteCorridorTile(owner, next.index);
            current = next.index;
            previousDirection = next.direction;
          }
        };

        for (let owner = 0; owner < selectedSpines.length; owner++) {
          const spine = selectedSpines[owner]!;
          if (landMask[spine] !== 1) continue;
          rangeOwner[spine] = owner;
          const axisDirection = chooseAxisDirection(owner, spine);
          if (axisDirection < 0) continue;
          const seen = new Uint8Array(size);
          seen[spine] = 1;
          extendArm(owner, spine, seen, axisDirection, nominalArmBudget);
          extendArm(owner, spine, seen, OPPOSITE_DIRECTION[axisDirection] ?? -1, fullArmBudget);
        }
      };
      while (mountainCount < spineTarget) {
        let bestIdx = -1;
        let bestRank = Number.NEGATIVE_INFINITY;
        for (const idx of spineCandidates) {
          if (selectedCandidateMask[idx] === 1) continue;
          if (effectiveSpineMinDistance > 0 && spineExclusionMask[idx] === 1) continue;

          let nearestSelectedDistance = Number.POSITIVE_INFINITY;
          for (const selected of selectedSpines) {
            const distance = hexDistanceOddQPeriodicX(idx, selected, w);
            if (distance < nearestSelectedDistance) nearestSelectedDistance = distance;
          }
          const distributionScale =
            selectedSpines.length === 0 || effectiveSpineMinDistance <= 0
              ? 1
              : Math.min(1, nearestSelectedDistance / Math.max(1, effectiveSpineMinDistance * 1.5));
          const score = mountainScoreByTile[idx] ?? 0;
          const rank = rangeSystemTarget > 0 ? score * (0.35 + distributionScale * 0.65) : score;
          if (rank > bestRank || (rank === bestRank && idx < bestIdx)) {
            bestIdx = idx;
            bestRank = rank;
          }
        }
        if (bestIdx < 0) break;
        const idx = bestIdx;
        if (mountainCount >= spineTarget) break;
        selectedCandidateMask[idx] = 1;
        mountainMask[idx] = 1;
        rangeOwner[idx] = selectedSpines.length;
        selectedSpines.push(idx);
        mountainCount++;
        if (effectiveSpineMinDistance > 0) {
          markSpineExclusion({
            exclusionMask: spineExclusionMask,
            startIndex: idx,
            width: w,
            height: h,
            maxDistance: effectiveSpineMinDistance,
          });
        }
      }

      // Give each selected range anchor a small local shoulder before global
      // dilation competes for budget, so the range-count lever manifests as
      // multiple multi-tile systems instead of isolated peaks plus a few large chains.
      for (let owner = 0; owner < selectedSpines.length; owner++) {
        if (mountainCount >= mountainTarget) break;
        const spine = selectedSpines[owner]!;
        addLocalShoulders(owner, spine, 2, mountainTarget);
      }

      if (
        rangeSystemTarget > 0 &&
        selectedSpines.length < rangeSystemTarget &&
        mountainCount < mountainTarget
      ) {
        addDistributedFloorAnchors(rangeSystemTarget, mountainTarget);
      }

      extendRangeSpines(rangeLengthTarget, mountainTarget);

      // 2) Expand around spines for limited ridge width, respecting the hard cap.
      for (let step = 0; step < dilationSteps && mountainCount < mountainTarget; step++) {
        const frontierByOwner: number[][] = Array.from({ length: selectedSpines.length }, () => []);
        for (let i = 0; i < size; i++) {
          if (landMask[i] === 0) continue;
          if (mountainMask[i] === 1) continue;
          const score = mountainScoreByTile[i] ?? 0;
          if (!(score >= mountainShoulderThreshold)) continue;

          const owner = findCompatibleAdjacentRangeOwner({
            i,
            width: w,
            height: h,
            mountainMask,
            rangeOwner,
          });
          if (owner < 0) continue;
          frontierByOwner[owner]?.push(i);
        }

        for (const frontier of frontierByOwner) {
          frontier.sort((a, b) => {
            const sa = mountainScoreByTile[a] ?? 0;
            const sb = mountainScoreByTile[b] ?? 0;
            if (sb !== sa) return sb - sa;
            return a - b;
          });
        }

        const frontierOffsets = new Uint16Array(frontierByOwner.length);
        let grew = true;
        while (mountainCount < mountainTarget && grew) {
          grew = false;
          for (
            let owner = 0;
            owner < frontierByOwner.length && mountainCount < mountainTarget;
            owner++
          ) {
            const frontier = frontierByOwner[owner]!;
            while (frontierOffsets[owner]! < frontier.length) {
              const i = frontier[frontierOffsets[owner]++]!;
              if (mountainMask[i] === 1) continue;
              const adjacentOwner = findCompatibleAdjacentRangeOwner({
                i,
                width: w,
                height: h,
                mountainMask,
                rangeOwner,
              });
              if (adjacentOwner !== owner) continue;
              mountainMask[i] = 1;
              rangeOwner[i] = owner;
              mountainCount++;
              grew = true;
              break;
            }
          }
        }
      }

      // If dilation can't reach the target (e.g. very sparse ridges), fill remaining budget by
      // selecting the best remaining physics-gated tiles globally.
      if (mountainCount < mountainTarget && rangeSystemTarget <= 0) {
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
          if (effectiveSpineMinDistance > 0 && spineExclusionMask[i] === 1) continue;
          mountainMask[i] = 1;
          rangeOwner[i] = selectedSpines.length;
          mountainCount++;
          if (effectiveSpineMinDistance > 0) {
            markSpineExclusion({
              exclusionMask: spineExclusionMask,
              startIndex: i,
              width: w,
              height: h,
              maxDistance: effectiveSpineMinDistance,
            });
          }
        }
      }

      if (
        rangeSystemTarget > 0 &&
        selectedSpines.length < rangeSystemTarget &&
        mountainCount < mountainTarget
      ) {
        addDistributedFloorAnchors(rangeSystemTarget, mountainTarget);
      }

      // Keep large Earthlike worlds from visually collapsing to a handful of peaks when the
      // absolute threshold is too conservative for the current Foundation belt intensities.
      // Scores remain physics-gated, so this cannot create noise-only mountain belts.
      if (mountainCount < mountainMinTarget) {
        let grewAdjacent = true;
        while (mountainCount < mountainMinTarget && grewAdjacent) {
          grewAdjacent = false;
          const adjacentCandidatesByOwner: number[][] = Array.from(
            { length: selectedSpines.length },
            () => []
          );
          for (let i = 0; i < size; i++) {
            if (landMask[i] === 0) continue;
            if (mountainMask[i] === 1) continue;
            const driverByte = resolveStrongestDriverByte({
              i,
              upliftPotential,
              collisionPotential,
              subductionPotential,
              riftPotential,
              tectonicStress,
            });
            if (driverByte < mountainFloorDriverByteMin) continue;
            const score = mountainScoreByTile[i] ?? 0;
            if (!(score > 0)) continue;

            const owner = findCompatibleAdjacentRangeOwner({
              i,
              width: w,
              height: h,
              mountainMask,
              rangeOwner,
            });
            if (owner < 0) continue;
            adjacentCandidatesByOwner[owner]?.push(i);
          }
          for (const adjacentCandidates of adjacentCandidatesByOwner) {
            adjacentCandidates.sort((a, b) => {
              const sa = mountainScoreByTile[a] ?? 0;
              const sb = mountainScoreByTile[b] ?? 0;
              if (sb !== sa) return sb - sa;
              return a - b;
            });
          }

          const adjacentOffsets = new Uint16Array(adjacentCandidatesByOwner.length);
          let grewRound = true;
          while (mountainCount < mountainMinTarget && grewRound) {
            grewRound = false;
            for (
              let owner = 0;
              owner < adjacentCandidatesByOwner.length && mountainCount < mountainMinTarget;
              owner++
            ) {
              const adjacentCandidates = adjacentCandidatesByOwner[owner]!;
              while (adjacentOffsets[owner]! < adjacentCandidates.length) {
                const i = adjacentCandidates[adjacentOffsets[owner]++]!;
                if (mountainMask[i] === 1) continue;
                const adjacentOwner = findCompatibleAdjacentRangeOwner({
                  i,
                  width: w,
                  height: h,
                  mountainMask,
                  rangeOwner,
                });
                if (adjacentOwner !== owner) continue;
                mountainMask[i] = 1;
                rangeOwner[i] = owner;
                mountainCount++;
                grewAdjacent = true;
                grewRound = true;
                break;
              }
            }
          }
        }

        const floorCandidates: number[] = [];
        for (let i = 0; i < size; i++) {
          if (landMask[i] === 0) continue;
          if (mountainMask[i] === 1) continue;
          const driverByte = resolveStrongestDriverByte({
            i,
            upliftPotential,
            collisionPotential,
            subductionPotential,
            riftPotential,
            tectonicStress,
          });
          if (driverByte < mountainFloorDriverByteMin) continue;
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
        if (rangeSystemTarget > 0) {
          while (mountainCount < mountainMinTarget && selectedSpines.length < rangeSystemTarget) {
            let bestIdx = -1;
            let bestRank = Number.NEGATIVE_INFINITY;
            for (const i of floorCandidates) {
              if (mountainMask[i] === 1) continue;
              if (effectiveSpineMinDistance > 0 && spineExclusionMask[i] === 1) continue;
              const adjacentOwner = findCompatibleAdjacentRangeOwner({
                i,
                width: w,
                height: h,
                mountainMask,
                rangeOwner,
              });
              if (adjacentOwner !== -1) continue;

              let nearestSelectedDistance = Number.POSITIVE_INFINITY;
              for (const selected of selectedSpines) {
                const distance = hexDistanceOddQPeriodicX(i, selected, w);
                if (distance < nearestSelectedDistance) nearestSelectedDistance = distance;
              }
              const distributionScale =
                selectedSpines.length === 0 || effectiveSpineMinDistance <= 0
                  ? 1
                  : Math.min(
                      1,
                      nearestSelectedDistance / Math.max(1, effectiveSpineMinDistance * 1.5)
                    );
              const score = mountainScoreByTile[i] ?? 0;
              const rank = score * (0.35 + distributionScale * 0.65);
              if (rank > bestRank || (rank === bestRank && i < bestIdx)) {
                bestIdx = i;
                bestRank = rank;
              }
            }

            if (bestIdx < 0) break;

            const owner = selectedSpines.length;
            selectedSpines.push(bestIdx);
            mountainMask[bestIdx] = 1;
            rangeOwner[bestIdx] = owner;
            mountainCount++;
            if (effectiveSpineMinDistance > 0) {
              markSpineExclusion({
                exclusionMask: spineExclusionMask,
                startIndex: bestIdx,
                width: w,
                height: h,
                maxDistance: effectiveSpineMinDistance,
              });
            }
            addLocalShoulders(owner, bestIdx, 2, mountainMinTarget);
          }
        } else {
          for (const i of floorCandidates) {
            if (mountainCount >= mountainMinTarget) break;
            if (mountainMask[i] === 1) continue;
            mountainMask[i] = 1;
            rangeOwner[i] = selectedSpines.length;
            mountainCount++;
          }
        }
      }

      const regionSupportDriverMin = Math.max(1, Math.round(config.driverSignalByteMin * 0.35)) | 0;
      const regionInnerDistance =
        Math.max(1, Math.floor(Math.max(1, mountainRegionRadiusTiles) * 0.5)) | 0;
      const regionDistance = new Uint8Array(size);
      regionDistance.fill(255);
      const regionQueue: number[] = [];
      for (let i = 0; i < size; i++) {
        const owner = rangeOwner[i] ?? -1;
        if (owner < 0 || landMask[i] !== 1) continue;
        mountainRegionIdByTile[i] = owner;
        mountainRegionMask[i] = 1;
        regionDistance[i] = 0;
        regionQueue.push(i);
      }

      let regionHead = 0;
      while (regionHead < regionQueue.length) {
        const i = regionQueue[regionHead++]!;
        const distance = regionDistance[i] ?? 255;
        if (distance >= mountainRegionRadiusTiles) continue;
        const owner = mountainRegionIdByTile[i] ?? -1;
        if (owner < 0) continue;

        const x = i % w;
        const y = Math.floor(i / w);
        forEachHexNeighborOddQ(x, y, w, h, (nx, ny) => {
          const ni = ny * w + nx;
          if (landMask[ni] !== 1) return;
          if (mountainRegionMask[ni] === 1) return;
          const nextDistance = distance + 1;
          const score = mountainScoreByTile[ni] ?? 0;
          const driverByte = resolveStrongestDriverByte({
            i: ni,
            upliftPotential,
            collisionPotential,
            subductionPotential,
            riftPotential,
            tectonicStress,
          });
          const supported =
            score > 0 ||
            driverByte >= regionSupportDriverMin ||
            (nextDistance <= regionInnerDistance && (boundaryCloseness[ni] ?? 0) > 0);
          if (!supported) return;

          mountainRegionMask[ni] = 1;
          mountainRegionIdByTile[ni] = owner;
          regionDistance[ni] = nextDistance;
          regionQueue.push(ni);
        });
      }

      for (let i = 0; i < size; i++) {
        if (mountainMask[i] !== 1) continue;
        mountainRegionMask[i] = 1;
        if (mountainRegionIdByTile[i] >= 0) continue;
        const owner = rangeOwner[i] ?? -1;
        mountainRegionIdByTile[i] = owner >= 0 ? owner : 0;
      }
    }

    return {
      mountainMask,
      mountainRegionMask,
      mountainRegionIdByTile,
      orogenyPotential,
      fracturePotential,
    };
  },
});
