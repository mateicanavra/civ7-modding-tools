import { createStrategy } from "@swooper/mapgen-core/authoring";
import {
  collectMaskComponentsOddQ,
  computeMaskDistanceFieldOddQ,
  forEachHexNeighborOddQ,
} from "@swooper/mapgen-core/lib/grid";

import { BOUNDARY_TYPE } from "@mapgen/domain/foundation/constants.js";
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

type SpineCandidate = Readonly<{
  idx: number;
  score: number;
  distanceFromAxisStart: number;
}>;

function selectEvenly<T>(items: readonly T[], count: number): T[] {
  const target = Math.max(0, Math.min(items.length, count | 0));
  if (target <= 0) return [];
  if (target >= items.length) return [...items];
  const out: T[] = [];
  for (let k = 0; k < target; k++) {
    const idx = Math.min(items.length - 1, Math.floor((k * items.length) / target));
    out.push(items[idx]!);
  }
  return out;
}

function traceAxisPathOddQ(input: Readonly<{
  start: number;
  end: number;
  width: number;
  height: number;
  componentMask: Uint8Array;
  distanceToEnd: Int16Array;
  score: Float32Array;
}>): number[] {
  const path: number[] = [];
  const { start, end, width, height, componentMask, distanceToEnd, score } = input;
  if (start < 0 || end < 0 || componentMask[start] !== 1 || componentMask[end] !== 1) return path;

  let current = start;
  let guard = Math.max(1, width * height);
  while (guard-- > 0) {
    path.push(current);
    if (current === end) break;

    const currentDistance = distanceToEnd[current] ?? -1;
    if (currentDistance <= 0) break;
    const x = current % width;
    const y = (current / width) | 0;
    let next = -1;
    let nextScore = Number.NEGATIVE_INFINITY;
    forEachHexNeighborOddQ(x, y, width, height, (nx, ny) => {
      const ni = ny * width + nx;
      if (componentMask[ni] !== 1) return;
      if ((distanceToEnd[ni] ?? -1) !== currentDistance - 1) return;
      const s = score[ni] ?? 0;
      if (s > nextScore || (s === nextScore && ni < next)) {
        next = ni;
        nextScore = s;
      }
    });
    if (next < 0) break;
    current = next;
  }

  return path;
}

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
  beltMask: Uint8Array;
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
  const beltMask = input.beltMask as Uint8Array | undefined;
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
    (beltMask !== undefined && beltMask.length !== size) ||
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
    beltMask: beltMask ?? new Uint8Array(size),
    fractalMountain,
  };
}

export const defaultStrategy = createStrategy(PlanRidgesContract, "default", {
  run: (input, config) => {
    const { width, height } = input;
    const w = width | 0;
    const h = height | 0;
    const { size, landMask, boundaryCloseness, boundaryType, upliftPotential, collisionPotential, subductionPotential, riftPotential, tectonicStress, beltAge, beltMask, fractalMountain } =
      validateRidgesInputs(input);

    const mountainMask = new Uint8Array(size);
    const orogenyPotential = new Uint8Array(size);
    const fracturePotential = new Uint8Array(size);
    const mountainScoreByTile = new Float32Array(size);

    const boundaryGate = Math.min(0.99, Math.max(0, config.boundaryGate));
    const falloffExponent = config.boundaryExponent;
    const oldBeltMountainScale = Math.max(0, Math.min(1, config.oldBeltMountainScale));
    const mountainMaxFraction = Math.max(0, Math.min(1, config.mountainMaxFraction));
    const mountainSpineFraction = Math.max(0, Math.min(1, config.mountainSpineFraction));
    const mountainThreshold = Math.max(0, config.mountainThreshold);
    const mountainShoulderThreshold = mountainThreshold * 0.6;
    const dilationSteps = Math.max(0, Math.min(6, Math.round(config.mountainSpineDilationSteps))) | 0;
    const rangeRegionThreshold = mountainThreshold * Math.max(0, Math.min(1, config.rangeRegionThresholdScale));
    const rangeRegionMinDiameter = Math.max(0, Math.round(config.rangeRegionMinDiameter)) | 0;
    const rangeCorridorSlack = Math.max(0, Math.round(config.rangeCorridorSlack)) | 0;
    const rangeSpineDensity = Math.max(0.1, config.rangeSpineDensity);
    const rangePassFractalCutoff = Math.max(0, Math.min(1, config.rangePassFractalCutoff));

    let landCount = 0;
    for (let i = 0; i < size; i++) if (landMask[i] === 1) landCount++;

    for (let i = 0; i < size; i++) {
      if (landMask[i] === 0) continue;

      const closenessNorm = boundaryCloseness[i] / 255;
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
    if (mountainTarget > 0) {
      // 1) Trace range regions first, then classify true mountain spines inside them.
      //
      // Earlier versions picked local maxima first and then dilated. That can create believable width,
      // but it cannot create long ranges because the planner has already thrown away the corridor.
      const rangeRegionMask = new Uint8Array(size);
      for (let i = 0; i < size; i++) {
        if (landMask[i] === 0) continue;
        const score = mountainScoreByTile[i] ?? 0;
        const isBeltCorridor = beltMask[i] === 1 && (boundaryType[i] ?? 0) !== BOUNDARY_TYPE.divergent;
        if (score < rangeRegionThreshold && !isBeltCorridor) continue;
        rangeRegionMask[i] = 1;
      }

      const rangeComponents = collectMaskComponentsOddQ({
        mask: rangeRegionMask,
        width: w,
        height: h,
      }).sort((a, b) => {
        if (b.diameter !== a.diameter) return b.diameter - a.diameter;
        if (b.size !== a.size) return b.size - a.size;
        return a.id - b.id;
      });

      const componentMask = new Uint8Array(size);
      const selectedSpines: SpineCandidate[] = [];
      for (const component of rangeComponents) {
        if (selectedSpines.length >= mountainTarget) break;
        if (component.size <= 0) continue;

        for (const idx of component.indices) componentMask[idx] = 1;
        const distanceFromA = computeMaskDistanceFieldOddQ({
          mask: componentMask,
          width: w,
          height: h,
          sources: [component.endpointA],
        });
        const distanceFromB = computeMaskDistanceFieldOddQ({
          mask: componentMask,
          width: w,
          height: h,
          sources: [component.endpointB],
        });

        const axisPath = traceAxisPathOddQ({
          start: component.endpointA,
          end: component.endpointB,
          width: w,
          height: h,
          componentMask,
          distanceToEnd: distanceFromB,
          score: mountainScoreByTile,
        });
        const axisCandidateIds = new Set(axisPath);
        const axisCandidates = axisPath.map((idx) => ({
            idx,
            score: mountainScoreByTile[idx] ?? 0,
            distanceFromAxisStart: distanceFromA[idx] ?? 0,
        }));

        const candidates: SpineCandidate[] = [];
        for (const idx of component.indices) {
          if (axisCandidateIds.has(idx)) continue;
          const score = mountainScoreByTile[idx] ?? 0;
          const da = distanceFromA[idx] ?? -1;
          const db = distanceFromB[idx] ?? -1;
          if (da < 0 || db < 0) continue;

          const onAxisCorridor = da + db <= component.diameter + rangeCorridorSlack;
          if (!onAxisCorridor && score < mountainThreshold) continue;

          const fractal = normalizeMountainFractal(fractalMountain[idx]);
          const isPass =
            fractal < rangePassFractalCutoff &&
            score < mountainThreshold &&
            component.diameter >= rangeRegionMinDiameter;
          if (isPass) continue;

          candidates.push({ idx, score, distanceFromAxisStart: da });
        }

        const uniqueSideCandidates = new Map<number, SpineCandidate>();
        for (const candidate of candidates) {
          const existing = uniqueSideCandidates.get(candidate.idx);
          if (!existing || candidate.score > existing.score) uniqueSideCandidates.set(candidate.idx, candidate);
        }

        const sortedSideCandidates = [...uniqueSideCandidates.values()].sort((a, b) => {
          if (a.distanceFromAxisStart !== b.distanceFromAxisStart) {
            return a.distanceFromAxisStart - b.distanceFromAxisStart;
          }
          if (b.score !== a.score) return b.score - a.score;
          return a.idx - b.idx;
        });

        const preferredLength = Math.max(
          component.diameter >= rangeRegionMinDiameter ? component.diameter : Math.sqrt(component.size),
          1
        );
        const componentSpineTarget = Math.max(
          axisCandidates.length,
          Math.round(preferredLength * rangeSpineDensity)
        );
        const sampled = [
          ...axisCandidates,
          ...selectEvenly(sortedSideCandidates, componentSpineTarget - axisCandidates.length),
        ];
        for (const candidate of sampled) {
          if (selectedSpines.length >= mountainTarget) break;
          selectedSpines.push(candidate);
        }

        for (const idx of component.indices) componentMask[idx] = 0;
      }

      for (const candidate of selectedSpines) {
        mountainMask[candidate.idx] = 1;
      }

      // Fallback: preserve local-max behavior for unusually sparse or thresholded maps.
      const spineCandidates: number[] = [];
      if (selectedSpines.length === 0) {
        for (let i = 0; i < size; i++) {
          if (landMask[i] === 0) continue;
          const score = mountainScoreByTile[i] ?? 0;
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
      }

      spineCandidates.sort((a, b) => {
        const sa = mountainScoreByTile[a] ?? 0;
        const sb = mountainScoreByTile[b] ?? 0;
        if (sb !== sa) return sb - sa;
        return a - b;
      });

      let spineTarget = selectedSpines.length;
      if (selectedSpines.length === 0) {
        spineTarget = Math.round(landCount * mountainSpineFraction) | 0;
        spineTarget = Math.max(0, Math.min(spineCandidates.length, spineTarget));
        // Ensure at least one spine when mountains are allowed and candidates exist.
        if (spineTarget === 0 && spineCandidates.length > 0) spineTarget = 1;
        // If the overall mountain cap is smaller, clamp spines to it.
        spineTarget = Math.min(spineTarget, mountainTarget);
      }

      for (let i = 0; i < spineTarget; i++) {
        const idx = spineCandidates[i]!;
        if (idx !== undefined) mountainMask[idx] = 1;
      }

      let mountainCount = 0;
      for (let i = 0; i < size; i++) if (mountainMask[i] === 1) mountainCount++;

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
          mountainMask[i] = 1;
          mountainCount++;
        }
      }
    }

    return { mountainMask, orogenyPotential, fracturePotential };
  },
});
