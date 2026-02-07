import { createStrategy } from "@swooper/mapgen-core/authoring";

import PlanFoothillsContract from "../contract.js";
import type { PlanFoothillsTypes } from "../types.js";

import {
  computeHillScore,
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
  riftPotential: Uint8Array;
  tectonicStress: Uint8Array;
  fractalHill: Int16Array;
} {
  const { width, height } = input;
  const size = Math.max(0, (width | 0) * (height | 0));

  const landMask = input.landMask as Uint8Array;
  const mountainMask = input.mountainMask as Uint8Array;
  const boundaryCloseness = input.boundaryCloseness as Uint8Array;
  const boundaryType = input.boundaryType as Uint8Array;
  const upliftPotential = input.upliftPotential as Uint8Array;
  const riftPotential = input.riftPotential as Uint8Array;
  const tectonicStress = input.tectonicStress as Uint8Array;
  const fractalHill = input.fractalHill as Int16Array;

  if (
    landMask.length !== size ||
    mountainMask.length !== size ||
    boundaryCloseness.length !== size ||
    boundaryType.length !== size ||
    upliftPotential.length !== size ||
    riftPotential.length !== size ||
    tectonicStress.length !== size ||
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
    riftPotential,
    tectonicStress,
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
      riftPotential,
      tectonicStress,
      fractalHill,
    } = validateFoothillsInputs(input);

    const hillMask = new Uint8Array(size);

    const boundaryGate = Math.min(0.99, Math.max(0, config.boundaryGate));
    const falloffExponent = config.boundaryExponent;

    for (let i = 0; i < size; i++) {
      if (landMask[i] === 0) continue;
      if (mountainMask[i] === 1) continue;

      const closenessNorm = boundaryCloseness[i] / 255;
      const boundaryStrength = resolveBoundaryStrength(closenessNorm, boundaryGate, falloffExponent);

      const uplift = upliftPotential[i] / 255;
      const stress = tectonicStress[i] / 255;
      const rift = riftPotential[i] / 255;
      const bType = boundaryType[i];

      const driverByte = Math.max(upliftPotential[i] ?? 0, tectonicStress[i] ?? 0, riftPotential[i] ?? 0);
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

      if (hillScore > config.hillThreshold) {
        hillMask[i] = 1;
      }
    }

    return { hillMask };
  },
});
