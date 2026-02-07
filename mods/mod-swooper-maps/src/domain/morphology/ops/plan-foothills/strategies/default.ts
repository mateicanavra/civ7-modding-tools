import { createStrategy } from "@swooper/mapgen-core/authoring";

import { BOUNDARY_TYPE } from "@mapgen/domain/foundation/constants.js";

import PlanFoothillsContract from "../contract.js";
import type { PlanFoothillsTypes } from "../types.js";

import {
  computeHillScore,
  computeHexDistanceToMask,
  normalizeMountainFractal,
  resolveBoundaryStrength,
  resolveDriverStrength,
} from "../../mountains-shared/rules.js";

function validateFoothillsInputs(input: PlanFoothillsTypes["input"]): {
  size: number;
  landMask: Uint8Array;
  mountainMask: Uint8Array;
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

export const defaultStrategy = createStrategy(PlanFoothillsContract, "default", {
  run: (input, config) => {
    const {
      size,
      landMask,
      mountainMask,
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
    const foothillMaxDistance = Math.max(0, Math.min(255, Math.round(config.foothillMaxDistance))) | 0;

    for (let i = 0; i < size; i++) {
      if (landMask[i] === 0) continue;
      if (mountainMask[i] === 1) continue;

      const closenessNorm = boundaryCloseness[i] / 255;
      const boundaryStrength = resolveBoundaryStrength(closenessNorm, boundaryGate, falloffExponent);

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
        config,
      });

      // Age shaping: old belts should degrade to hills more readily than mountains.
      const ageNorm = (beltAge[i] ?? 0) / 255;
      const ageScale = 1 + ageNorm * (oldBeltHillScale - 1);
      hillScoreByTile[i] = hillScore * ageScale;
    }

    const distanceToMountains =
      foothillMaxDistance > 0
        ? computeHexDistanceToMask({ mask: mountainMask, width: w, height: h, maxDistance: foothillMaxDistance })
        : new Uint8Array(size);
    if (foothillMaxDistance <= 0) distanceToMountains.fill(255);

    const threshold = Math.max(0, config.hillThreshold);

    for (let i = 0; i < size; i++) {
      if (landMask[i] === 0) continue;
      if (mountainMask[i] === 1) continue;
      const score = hillScoreByTile[i] ?? 0;
      if (!(score > threshold)) continue;

      const dist = distanceToMountains[i] ?? 255;
      const closeToMountains = dist !== 255 && dist <= foothillMaxDistance;

      // Allow foothills either as skirts adjacent to ridges, or as boundary-adjacent ruggedness
      // only when physics indicates meaningful deformation. This prevents planet-wide hills when
      // boundaryCloseness is treated as pure proximity (as it should be).
      const closenessNorm = boundaryCloseness[i] / 255;
      const boundaryStrength = resolveBoundaryStrength(closenessNorm, boundaryGate, falloffExponent);
      const closeToBoundary = boundaryStrength > 0;

      // Strong boundary deformation signals (byte-space) used to avoid "all hills everywhere".
      // The threshold is `driverSignalByteMin` so this remains coherent with determinism gates.
      const boundary = boundaryType[i] ?? 0;
      const collisionByte = collisionPotential[i] ?? 0;
      const subductionByte = subductionPotential[i] ?? 0;
      const riftByte = riftPotential[i] ?? 0;
      const stressByte = tectonicStress[i] ?? 0;

      const strongConvergence = collisionByte >= config.driverSignalByteMin || subductionByte >= config.driverSignalByteMin;
      const strongDivergence = boundary === BOUNDARY_TYPE.divergent && riftByte >= config.driverSignalByteMin;
      const strongTransform = boundary === BOUNDARY_TYPE.transform && stressByte >= config.driverSignalByteMin;
      const strongBoundaryDeformation = strongConvergence || strongDivergence || strongTransform;

      if (closeToMountains || (closeToBoundary && strongBoundaryDeformation)) {
        hillMask[i] = 1;
      }
    }

    return { hillMask };
  },
});
