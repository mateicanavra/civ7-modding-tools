import { createStrategy } from "@swooper/mapgen-core/authoring";
import { BOUNDARY_TYPE } from "@swooper/mapgen-core/lib/plates";
import { resolveBoundaryStrength } from "../../../model/policy/boundary-strength.js";
import { resolveDriverStrength } from "../../../model/policy/driver-strength.js";
import { normalizeMountainFractal } from "../../../model/policy/mountain-fractal.js";
import type {
  HillScorePolicy,
  OrogenyPotentialPolicy,
} from "../../../model/policy/mountain-scoring-policy.js";
import PlanFoothillsContract from "../contract.js";
import { computeHexDistanceToMask } from "../rules/distance-to-mask.js";
import { computeHillScore } from "../rules/hill-score.js";
import type { PlanFoothillsTypes } from "../types.js";

function validateFoothillsInputs(input: PlanFoothillsTypes["input"]): {
  size: number;
  landMask: Uint8Array;
  mountainMask: Uint8Array;
  mountainRegionMask: Uint8Array;
  mountainRegionIdByTile: Int32Array;
  boundaryCloseness: Uint8Array;
  boundaryType: Uint8Array;
  upliftPotential: Uint8Array;
  collisionPotential: Uint8Array;
  subductionPotential: Uint8Array;
  riftPotential: Uint8Array;
  tectonicStress: Uint8Array;
  beltAge: Uint8Array;
  fractalHill: Int16Array;
} {
  const { width, height } = input;
  const size = Math.max(0, (width | 0) * (height | 0));

  const landMask = input.landMask as Uint8Array;
  const mountainMask = input.mountainMask as Uint8Array;
  const mountainRegionMask = input.mountainRegionMask as Uint8Array;
  const mountainRegionIdByTile = input.mountainRegionIdByTile as Int32Array;
  const boundaryCloseness = input.boundaryCloseness as Uint8Array;
  const boundaryType = input.boundaryType as Uint8Array;
  const upliftPotential = input.upliftPotential as Uint8Array;
  const collisionPotential = input.collisionPotential as Uint8Array;
  const subductionPotential = input.subductionPotential as Uint8Array;
  const riftPotential = input.riftPotential as Uint8Array;
  const tectonicStress = input.tectonicStress as Uint8Array;
  const beltAge = input.beltAge as Uint8Array;
  const fractalHill = input.fractalHill as Int16Array;

  if (
    landMask.length !== size ||
    mountainMask.length !== size ||
    mountainRegionMask.length !== size ||
    mountainRegionIdByTile.length !== size ||
    boundaryCloseness.length !== size ||
    boundaryType.length !== size ||
    upliftPotential.length !== size ||
    collisionPotential.length !== size ||
    subductionPotential.length !== size ||
    riftPotential.length !== size ||
    tectonicStress.length !== size ||
    beltAge.length !== size ||
    fractalHill.length !== size
  ) {
    throw new Error("[PlanFoothills] Input tensors must match width*height.");
  }

  return {
    size,
    landMask,
    mountainMask,
    mountainRegionMask,
    mountainRegionIdByTile,
    boundaryCloseness,
    boundaryType,
    upliftPotential,
    collisionPotential,
    subductionPotential,
    riftPotential,
    tectonicStress,
    beltAge,
    fractalHill,
  };
}

function applyRangeEnvelope(closenessNorm: number, rangeEnvelopeScale: number): number {
  return Math.max(0, Math.min(1, closenessNorm * Math.max(0.25, rangeEnvelopeScale)));
}

export const defaultStrategy = createStrategy(PlanFoothillsContract, "default", {
  run: (input, config) => {
    const {
      size,
      landMask,
      mountainMask,
      mountainRegionMask,
      mountainRegionIdByTile,
      boundaryCloseness,
      boundaryType,
      upliftPotential,
      collisionPotential,
      subductionPotential,
      riftPotential,
      tectonicStress,
      beltAge,
      fractalHill,
    } = validateFoothillsInputs(input);

    const { width, height } = input;
    const w = width | 0;
    const h = height | 0;

    const hillMask = new Uint8Array(size);
    const hillScoreByTile = new Float32Array(size);

    const boundaryGate = Math.min(0.99, Math.max(0, config.boundaryGate));
    const falloffExponent = config.boundaryExponent;
    const oldBeltHillScale = Math.max(0, Math.min(2, config.oldBeltHillScale));
    const foothillMaxDistance =
      Math.max(0, Math.min(255, Math.round(config.foothillMaxDistance))) | 0;
    const hillMaxFraction = Math.max(0, Math.min(1, config.hillMaxFraction));
    const foothillMinFraction = Math.max(0, Math.min(1, config.foothillMinFraction));
    const foothillMaxFraction =
      config.foothillMaxFraction > 0
        ? Math.max(0, Math.min(1, config.foothillMaxFraction))
        : hillMaxFraction;
    const rangeEnvelopeScale = Math.max(0.25, Math.min(4, config.rangeEnvelopeScale));
    const orogenyPolicy: OrogenyPotentialPolicy = {
      orogenyCollisionStressWeight: config.orogenyCollisionStressWeight,
      orogenyCollisionUpliftWeight: config.orogenyCollisionUpliftWeight,
      orogenyTransformStressWeight: config.orogenyTransformStressWeight,
      orogenyDivergentRiftWeight: config.orogenyDivergentRiftWeight,
      orogenyDivergentStressWeight: config.orogenyDivergentStressWeight,
    };
    const hillScorePolicy: HillScorePolicy = {
      ...orogenyPolicy,
      tectonicIntensity: config.tectonicIntensity,
      fractalWeight: config.fractalWeight,
      hillBoundaryWeight: config.hillBoundaryWeight,
      hillConvergentFoothill: config.hillConvergentFoothill,
      hillUpliftWeight: config.hillUpliftWeight,
      hillFractalScale: config.hillFractalScale,
      hillFoothillBase: config.hillFoothillBase,
      hillFoothillFractalGain: config.hillFoothillFractalGain,
      hillRiftBonus: config.hillRiftBonus,
      hillRiftBonusScale: config.hillRiftBonusScale,
      hillUpliftScale: config.hillUpliftScale,
      hillRiftDepthScale: config.hillRiftDepthScale,
      hillInteriorFalloff: config.hillInteriorFalloff,
      riftDepth: config.riftDepth,
    };

    let landCount = 0;
    let mountainCount = 0;
    for (let i = 0; i < size; i++) {
      if (landMask[i] === 1) landCount += 1;
      if (mountainMask[i] === 1) mountainCount += 1;
    }

    for (let i = 0; i < size; i++) {
      if (landMask[i] === 0) continue;
      if (mountainMask[i] === 1) continue;

      const closenessNorm = applyRangeEnvelope(boundaryCloseness[i] / 255, rangeEnvelopeScale);
      const boundaryStrength = resolveBoundaryStrength(
        closenessNorm,
        boundaryGate,
        falloffExponent
      );

      const collisionUplift = collisionPotential[i] / 255;
      const subductionUplift = subductionPotential[i] / 255;
      const uplift = Math.max(upliftPotential[i] / 255, collisionUplift, subductionUplift);
      const stress = tectonicStress[i] / 255;
      const rift = riftPotential[i] / 255;
      const bType = boundaryType[i];

      const driverByte = Math.max(
        upliftPotential[i] ?? 0,
        collisionPotential[i] ?? 0,
        subductionPotential[i] ?? 0,
        tectonicStress[i] ?? 0,
        riftPotential[i] ?? 0
      );
      const driverStrength = resolveDriverStrength({
        driverByte,
        driverSignalByteMin: config.driverSignalByteMin,
        driverExponent: config.driverExponent,
      });

      const fractal = normalizeMountainFractal(fractalHill[i]);
      const hillScore = computeHillScore({
        boundaryStrength,
        boundaryType: bType,
        uplift,
        stress,
        rift,
        fractal,
        driverStrength,
        config: hillScorePolicy,
      });

      // Age shaping: old belts should degrade to hills more readily than mountains.
      const ageNorm = (beltAge[i] ?? 0) / 255;
      const ageScale = 1 + ageNorm * (oldBeltHillScale - 1);
      hillScoreByTile[i] = hillScore * ageScale;
    }

    const distanceToMountains =
      foothillMaxDistance > 0
        ? computeHexDistanceToMask({
            mask: mountainMask,
            width: w,
            height: h,
            maxDistance: foothillMaxDistance,
          })
        : new Uint8Array(size);
    if (foothillMaxDistance <= 0) distanceToMountains.fill(255);

    const threshold = Math.max(0, config.hillThreshold);

    const candidates: number[] = [];
    const relaxedCandidates: number[] = [];
    for (let i = 0; i < size; i++) {
      if (landMask[i] === 0) continue;
      if (mountainMask[i] === 1) continue;
      const score = hillScoreByTile[i] ?? 0;

      const dist = distanceToMountains[i] ?? 255;
      const closeToMountains = dist !== 255 && dist <= foothillMaxDistance;
      const insideMountainRegion = mountainRegionMask[i] === 1;
      const namedMountainRegion = (mountainRegionIdByTile[i] ?? -1) >= 0;

      // Allow foothills either as skirts adjacent to ridges, or as boundary-adjacent ruggedness
      // only when physics indicates meaningful deformation. This prevents planet-wide hills when
      // boundaryCloseness is treated as pure proximity (as it should be).
      const closenessNorm = applyRangeEnvelope(boundaryCloseness[i] / 255, rangeEnvelopeScale);
      const boundaryStrength = resolveBoundaryStrength(
        closenessNorm,
        boundaryGate,
        falloffExponent
      );
      const closeToBoundary = boundaryStrength > 0;

      // Strong boundary deformation signals (byte-space) used to avoid "all hills everywhere".
      // The threshold is `driverSignalByteMin` so this remains coherent with determinism gates.
      const boundary = boundaryType[i] ?? 0;
      const collisionByte = collisionPotential[i] ?? 0;
      const subductionByte = subductionPotential[i] ?? 0;
      const riftByte = riftPotential[i] ?? 0;
      const stressByte = tectonicStress[i] ?? 0;
      const upliftByte = upliftPotential[i] ?? 0;

      const strongConvergence =
        collisionByte >= config.driverSignalByteMin || subductionByte >= config.driverSignalByteMin;
      const strongDivergence =
        boundary === BOUNDARY_TYPE.divergent && riftByte >= config.driverSignalByteMin;
      const strongTransform =
        boundary === BOUNDARY_TYPE.transform && stressByte >= config.driverSignalByteMin;
      const strongBoundaryDeformation = strongConvergence || strongDivergence || strongTransform;
      const relaxedDriverMin = Math.max(1, Math.round(config.driverSignalByteMin * 0.35));
      const relaxedBoundaryDeformation =
        Math.max(collisionByte, subductionByte, riftByte, stressByte, upliftByte) >=
        relaxedDriverMin;

      const ridgeSkirt = foothillMaxDistance > 0 && closeToMountains && score > 0;
      const relaxedRidgeSkirt = foothillMaxDistance > 0 && closeToMountains;
      const regionPassOrShoulder =
        insideMountainRegion &&
        namedMountainRegion &&
        score > threshold * (0.5 + Math.min(0.4, dist === 255 ? 0.2 : dist * 0.08));
      const relaxedRegionPassOrShoulder = insideMountainRegion && namedMountainRegion && score > 0;

      if (
        ((ridgeSkirt || (closeToBoundary && strongBoundaryDeformation)) && score > threshold) ||
        regionPassOrShoulder
      ) {
        candidates.push(i);
      }
      if (
        relaxedRidgeSkirt ||
        relaxedRegionPassOrShoulder ||
        (closeToBoundary && relaxedBoundaryDeformation && score > 0)
      ) {
        relaxedCandidates.push(i);
      }
    }

    const hillTargetRaw = Math.floor(landCount * foothillMaxFraction) | 0;
    const hillCapacity = Math.max(0, landCount - mountainCount) | 0;
    const hillTarget = Math.max(0, Math.min(candidates.length, hillCapacity, hillTargetRaw)) | 0;
    const hillMinTarget =
      Math.max(
        0,
        Math.min(hillCapacity, hillTargetRaw, Math.round(landCount * foothillMinFraction))
      ) | 0;

    candidates.sort((a, b) => {
      const sa = hillScoreByTile[a] ?? 0;
      const sb = hillScoreByTile[b] ?? 0;
      if (sb !== sa) return sb - sa;
      return a - b;
    });
    for (let k = 0; k < hillTarget; k++) {
      const idx = candidates[k]!;
      hillMask[idx] = 1;
    }
    if (hillTarget < hillMinTarget) {
      relaxedCandidates.sort((a, b) => {
        const sa = hillScoreByTile[a] ?? 0;
        const sb = hillScoreByTile[b] ?? 0;
        if (sb !== sa) return sb - sa;
        return a - b;
      });
      let hillCount = hillTarget;
      for (const idx of relaxedCandidates) {
        if (hillCount >= hillMinTarget) break;
        if (hillMask[idx] === 1) continue;
        hillMask[idx] = 1;
        hillCount++;
      }
    }

    return { hillMask };
  },
});
