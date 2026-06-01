import { createStrategy } from "@swooper/mapgen-core/authoring";
import { forEachHexNeighborOddQ } from "@swooper/mapgen-core/lib/grid";

import { BOUNDARY_TYPE } from "@mapgen/domain/foundation/constants.js";

import PlanRoughLandsContract from "../contract.js";
import type { PlanRoughLandsTypes } from "../types.js";
import {
  encodeNormalizedToU8,
  normalizeMountainFractal,
  resolveDriverStrength,
} from "../../mountains-shared/rules.js";

type RoughLandInputs = Readonly<{
  size: number;
  landMask: Uint8Array;
  mountainMask: Uint8Array;
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

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

function validateRoughLandInputs(input: PlanRoughLandsTypes["input"]): RoughLandInputs {
  const { width, height } = input;
  const size = Math.max(0, (width | 0) * (height | 0));

  const landMask = input.landMask as Uint8Array;
  const mountainMask = input.mountainMask as Uint8Array;
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
  return clamp01(Math.log1p(Math.max(0, value)) / 8);
}

export const defaultStrategy = createStrategy(PlanRoughLandsContract, "default", {
  run: (input, config) => {
    const {
      size,
      landMask,
      mountainMask,
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

    let landCount = 0;
    let mountainCount = 0;
    let foothillCount = 0;
    for (let i = 0; i < size; i++) {
      if (landMask[i] !== 1) continue;
      landCount += 1;
      if (mountainMask[i] === 1) mountainCount += 1;
      if (foothillMask[i] === 1) foothillCount += 1;
    }

    const threshold = Math.max(0.08, config.hillThreshold * 0.5);
    const candidates: number[] = [];

    for (let i = 0; i < size; i++) {
      if (landMask[i] !== 1) continue;
      if (mountainMask[i] === 1 || foothillMask[i] === 1) continue;

      const boundary = boundaryType[i] ?? BOUNDARY_TYPE.none;
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
      const resistantSubstrate = clamp01(1 - (erodibilityK[i] ?? 0.5));
      const thinSediment = clamp01(1 - (sedimentDepth[i] ?? 0.5));
      const coastInterior = clamp01((distanceToCoast[i] ?? 0) / 8);
      const elevationRelief = clamp01(((elevation[i] ?? 0) - input.seaLevel) / 35);
      const localRelief = clamp01(
        computeLocalRelief({ index: i, width, height, elevation, landMask }) / 16
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
      const escarpment =
        localRelief * (0.35 + coastInterior * 0.35 + resistantSubstrate * 0.3);
      const basinMargin = flowRelief * localRelief * thinSediment;
      const boundaryShoulder =
        boundaryNorm *
        (boundary === BOUNDARY_TYPE.convergent
          ? uplift
          : boundary === BOUNDARY_TYPE.divergent
            ? rift
            : stress);

      const score = clamp01(
        (oldHighland * 0.95 +
          rollingUpland * 0.75 +
          riftShoulder * 0.7 +
          plateau * 0.55 +
          escarpment * 0.65 +
          basinMargin * 0.4 +
          boundaryShoulder * 0.45) *
          Math.max(0, config.tectonicIntensity) *
          (0.75 + fractal * 0.5)
      );
      roughScoreByTile[i] = score;
      roughnessPotential[i] = encodeNormalizedToU8(score);

      const hasCausalSupport =
        oldHighland > 0.06 ||
        rollingUpland > 0.08 ||
        riftShoulder > 0.08 ||
        plateau > 0.08 ||
        escarpment > 0.1 ||
        basinMargin > 0.06 ||
        boundaryShoulder > 0.08;
      if (hasCausalSupport && score >= threshold) candidates.push(i);
    }

    const hillBudgetRaw = Math.floor(landCount * Math.max(0, Math.min(1, config.hillMaxFraction))) | 0;
    const hillCapacity = Math.max(0, landCount - mountainCount - foothillCount) | 0;
    const roughTarget = Math.max(
      0,
      Math.min(candidates.length, hillCapacity, hillBudgetRaw - foothillCount)
    ) | 0;

    candidates.sort((a, b) => {
      const sa = roughScoreByTile[a] ?? 0;
      const sb = roughScoreByTile[b] ?? 0;
      if (sb !== sa) return sb - sa;
      return a - b;
    });

    for (let k = 0; k < roughTarget; k++) {
      const idx = candidates[k]!;
      hillMask[idx] = 1;
    }

    return { hillMask, roughnessPotential };
  },
});
