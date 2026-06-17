import { BOUNDARY_TYPE } from "@mapgen/domain/foundation/constants.js";
import { clampPct } from "@swooper/mapgen-core";
import { createStrategy } from "@swooper/mapgen-core/authoring";
import { forEachHexNeighborOddQ } from "@swooper/mapgen-core/lib/grid";
import {
  encodeNormalizedToU8,
  normalizeMountainFractal,
  resolveDriverStrength,
} from "../../mountains-shared/rules.js";
import PlanRoughLandsContract from "../contract.js";
import type { PlanRoughLandsTypes } from "../types.js";

type RoughLandInputs = Readonly<{
  size: number;
  landMask: Uint8Array;
  mountainMask: Uint8Array;
  mountainRegionMask: Uint8Array;
  mountainRegionIdByTile: Int32Array;
  foothillMask: Uint8Array;
  elevation: Int16Array;
  boundaryCloseness: Uint8Array;
  boundaryType: Uint8Array;
  upliftPotential: Uint8Array;
  riftPotential: Uint8Array;
  tectonicStress: Uint8Array;
  beltAge: Uint8Array;
  erodibilityK: Float32Array;
  sedimentDepth: Float32Array;
  flowAccum: Float32Array;
  distanceToCoast: Uint16Array;
  fractalRoughLand: Int16Array;
}>;

function validateRoughLandInputs(input: PlanRoughLandsTypes["input"]): RoughLandInputs {
  const { width, height } = input;
  const size = Math.max(0, (width | 0) * (height | 0));

  const landMask = input.landMask as Uint8Array;
  const mountainMask = input.mountainMask as Uint8Array;
  const mountainRegionMask = input.mountainRegionMask as Uint8Array;
  const mountainRegionIdByTile = input.mountainRegionIdByTile as Int32Array;
  const foothillMask = input.foothillMask as Uint8Array;
  const elevation = input.elevation as Int16Array;
  const boundaryCloseness = input.boundaryCloseness as Uint8Array;
  const boundaryType = input.boundaryType as Uint8Array;
  const upliftPotential = input.upliftPotential as Uint8Array;
  const riftPotential = input.riftPotential as Uint8Array;
  const tectonicStress = input.tectonicStress as Uint8Array;
  const beltAge = input.beltAge as Uint8Array;
  const erodibilityK = input.erodibilityK as Float32Array;
  const sedimentDepth = input.sedimentDepth as Float32Array;
  const flowAccum = input.flowAccum as Float32Array;
  const distanceToCoast = input.distanceToCoast as Uint16Array;
  const fractalRoughLand = input.fractalRoughLand as Int16Array;

  if (
    landMask.length !== size ||
    mountainMask.length !== size ||
    mountainRegionMask.length !== size ||
    mountainRegionIdByTile.length !== size ||
    foothillMask.length !== size ||
    elevation.length !== size ||
    boundaryCloseness.length !== size ||
    boundaryType.length !== size ||
    upliftPotential.length !== size ||
    riftPotential.length !== size ||
    tectonicStress.length !== size ||
    beltAge.length !== size ||
    erodibilityK.length !== size ||
    sedimentDepth.length !== size ||
    flowAccum.length !== size ||
    distanceToCoast.length !== size ||
    fractalRoughLand.length !== size
  ) {
    throw new Error("[PlanRoughLands] Input tensors must match width*height.");
  }

  return {
    size,
    landMask,
    mountainMask,
    mountainRegionMask,
    mountainRegionIdByTile,
    foothillMask,
    elevation,
    boundaryCloseness,
    boundaryType,
    upliftPotential,
    riftPotential,
    tectonicStress,
    beltAge,
    erodibilityK,
    sedimentDepth,
    flowAccum,
    distanceToCoast,
    fractalRoughLand,
  };
}

function computeLocalRelief(params: {
  index: number;
  width: number;
  height: number;
  elevation: Int16Array;
  landMask: Uint8Array;
}): number {
  const { index, width, height, elevation, landMask } = params;
  const base = elevation[index] ?? 0;
  const x = index % width;
  const y = Math.floor(index / width);
  let maxRelief = 0;
  forEachHexNeighborOddQ(x, y, width, height, (nx, ny) => {
    const ni = ny * width + nx;
    if (landMask[ni] !== 1) return;
    maxRelief = Math.max(maxRelief, Math.abs(base - (elevation[ni] ?? base)));
  });
  return maxRelief;
}

function normalizeFlowAccum(value: number): number {
  return clampPct(Math.log1p(Math.max(0, value)) / 8, 0, 1, 0);
}

function countAcceptedWithinHexDistance(params: {
  index: number;
  width: number;
  height: number;
  mask: Uint8Array;
  maxDistance: number;
}): number {
  const { index, width, height, mask, maxDistance } = params;
  if (maxDistance <= 0) return mask[index] === 1 ? 1 : 0;

  const visited = new Uint8Array(mask.length);
  const queue: Array<{ idx: number; distance: number }> = [{ idx: index, distance: 0 }];
  visited[index] = 1;
  let count = 0;
  let head = 0;

  while (head < queue.length) {
    const { idx, distance } = queue[head++]!;
    if (mask[idx] === 1) count += 1;
    if (distance >= maxDistance) continue;

    const x = idx % width;
    const y = (idx / width) | 0;
    forEachHexNeighborOddQ(x, y, width, height, (nx, ny) => {
      const next = ny * width + nx;
      if (visited[next] === 1) return;
      visited[next] = 1;
      queue.push({ idx: next, distance: distance + 1 });
    });
  }

  return count;
}

export const defaultStrategy = createStrategy(PlanRoughLandsContract, "default", {
  run: (input, config) => {
    const {
      size,
      landMask,
      mountainMask,
      mountainRegionMask,
      mountainRegionIdByTile,
      foothillMask,
      elevation,
      boundaryCloseness,
      boundaryType,
      upliftPotential,
      riftPotential,
      tectonicStress,
      beltAge,
      erodibilityK,
      sedimentDepth,
      flowAccum,
      distanceToCoast,
      fractalRoughLand,
    } = validateRoughLandInputs(input);
    const width = input.width | 0;
    const height = input.height | 0;
    const hillMask = new Uint8Array(size);
    const roughnessPotential = new Uint8Array(size);
    const roughScoreByTile = new Float32Array(size);
    const roughLandMaxFraction = Math.max(0, Math.min(1, config.roughLandMaxFraction));

    let landCount = 0;
    let mountainCount = 0;
    let foothillCount = 0;
    for (let i = 0; i < size; i++) {
      if (landMask[i] !== 1) continue;
      landCount += 1;
      if (mountainMask[i] === 1) mountainCount += 1;
      if (foothillMask[i] === 1) foothillCount += 1;
    }

    const threshold = Math.max(0.1, config.hillThreshold);
    const candidates: number[] = [];

    for (let i = 0; i < size; i++) {
      if (landMask[i] !== 1) continue;
      if (mountainMask[i] === 1 || foothillMask[i] === 1) continue;

      const boundary = boundaryType[i] ?? BOUNDARY_TYPE.none;
      const insideMountainRegion =
        mountainRegionMask[i] === 1 && (mountainRegionIdByTile[i] ?? -1) >= 0;
      const boundaryNorm = (boundaryCloseness[i] ?? 0) / 255;
      const uplift = (upliftPotential[i] ?? 0) / 255;
      const rift = (riftPotential[i] ?? 0) / 255;
      const stress = (tectonicStress[i] ?? 0) / 255;
      const ageNorm = (beltAge[i] ?? 0) / 255;
      const fractal = normalizeMountainFractal(fractalRoughLand[i]);
      const driverByte = Math.max(
        upliftPotential[i] ?? 0,
        riftPotential[i] ?? 0,
        tectonicStress[i] ?? 0
      );
      const driverStrength = resolveDriverStrength({
        driverByte,
        driverSignalByteMin: config.driverSignalByteMin,
        driverExponent: config.driverExponent,
      });
      const resistantSubstrate = clampPct(1 - (erodibilityK[i] ?? 0.5), 0, 1, 0);
      const thinSediment = clampPct(1 - (sedimentDepth[i] ?? 0.5), 0, 1, 0);
      const coastInterior = clampPct((distanceToCoast[i] ?? 0) / 8, 0, 1, 0);
      const elevationRelief = clampPct(((elevation[i] ?? 0) - input.seaLevel) / 35, 0, 1, 0);
      const localRelief = clampPct(
        computeLocalRelief({ index: i, width, height, elevation, landMask }) / 16,
        0,
        1,
        0
      );
      const flowRelief = normalizeFlowAccum(flowAccum[i] ?? 0);

      const oldHighland =
        driverStrength * (0.35 + ageNorm * 0.65) * (0.45 + resistantSubstrate * 0.55);
      const rollingUpland =
        coastInterior *
        thinSediment *
        (0.25 + fractal * 0.75) *
        (0.25 + uplift * 0.35 + stress * 0.2 + ageNorm * 0.2);
      const riftShoulder =
        (boundary === BOUNDARY_TYPE.divergent ? 1 : 0.45) *
        rift *
        (0.45 + stress * 0.35 + fractal * 0.2);
      const plateau =
        elevationRelief * coastInterior * (0.35 + resistantSubstrate * 0.35 + ageNorm * 0.3);
      const escarpment = localRelief * (0.35 + coastInterior * 0.35 + resistantSubstrate * 0.3);
      const basinMargin = flowRelief * localRelief * thinSediment;
      const boundaryShoulder =
        boundaryNorm *
        (boundary === BOUNDARY_TYPE.convergent
          ? uplift
          : boundary === BOUNDARY_TYPE.divergent
            ? rift
            : stress);
      const orographicBasinMargin = insideMountainRegion
        ? (0.18 + flowRelief * 0.22 + localRelief * 0.2 + thinSediment * 0.18) *
          (0.45 + fractal * 0.55)
        : 0;
      const localReliefSupport = clampPct(
        localRelief * 1.2 + escarpment * 0.8 + basinMargin * 0.5,
        0,
        1,
        0
      );
      const activeDeformationSupport = clampPct(
        boundaryShoulder * 0.85 +
          riftShoulder * 0.65 +
          stress * (boundary === BOUNDARY_TYPE.transform ? 0.45 : 0.15),
        0,
        1,
        0
      );
      const dissectedUplandSupport = clampPct(
        (oldHighland * 0.3 + rollingUpland * 0.25 + plateau * 0.45) *
          (0.15 + localReliefSupport * 0.65 + fractal * 0.2),
        0,
        1,
        0
      );

      const score = clampPct(
        (oldHighland * 0.25 +
          rollingUpland * 0.35 +
          riftShoulder * 0.7 +
          plateau * 0.2 +
          escarpment * 0.85 +
          basinMargin * 0.4 +
          boundaryShoulder * 0.45 +
          orographicBasinMargin * 0.55 +
          dissectedUplandSupport * 0.8) *
          Math.max(0, config.tectonicIntensity) *
          (0.45 + fractal * 0.65),
        0,
        1,
        0
      );
      roughScoreByTile[i] = score;
      roughnessPotential[i] = encodeNormalizedToU8(score);

      const hasCausalSupport =
        localReliefSupport > 0.12 ||
        activeDeformationSupport > 0.16 ||
        riftShoulder > 0.12 ||
        escarpment > 0.12 ||
        basinMargin > 0.06 ||
        orographicBasinMargin > 0.12 ||
        (dissectedUplandSupport > 0.08 &&
          fractal > 0.48 &&
          (localReliefSupport > 0.08 || activeDeformationSupport > 0.12 || flowRelief > 0.25));
      const textureGate =
        fractal > 0.42 || localReliefSupport > 0.2 || activeDeformationSupport > 0.28;
      if (hasCausalSupport && textureGate && score >= threshold) candidates.push(i);
    }

    const hillBudgetRaw =
      Math.floor(landCount * Math.max(0, Math.min(1, config.hillMaxFraction))) | 0;
    const roughLandBudgetRaw =
      roughLandMaxFraction > 0 ? Math.floor(landCount * roughLandMaxFraction) | 0 : hillBudgetRaw;
    const hillCapacity = Math.max(0, landCount - mountainCount - foothillCount) | 0;
    const roughTarget =
      Math.max(
        0,
        Math.min(candidates.length, hillCapacity, hillBudgetRaw - foothillCount, roughLandBudgetRaw)
      ) | 0;

    candidates.sort((a, b) => {
      const sa = roughScoreByTile[a] ?? 0;
      const sb = roughScoreByTile[b] ?? 0;
      if (sb !== sa) return sb - sa;
      return a - b;
    });

    let accepted = 0;
    for (let k = 0; k < candidates.length && accepted < roughTarget; k++) {
      const idx = candidates[k]!;
      const nearbyAccepted = countAcceptedWithinHexDistance({
        index: idx,
        width,
        height,
        mask: hillMask,
        maxDistance: 2,
      });
      const score = roughScoreByTile[idx] ?? 0;
      const localDensityLimit = score > threshold * 2.25 ? 5 : score > threshold * 1.5 ? 4 : 2;
      if (nearbyAccepted >= localDensityLimit) continue;
      hillMask[idx] = 1;
      accepted += 1;
    }

    return { hillMask, roughnessPotential };
  },
});
