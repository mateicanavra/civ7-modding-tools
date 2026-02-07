import { createStrategy } from "@swooper/mapgen-core/authoring";

import PlanRidgesContract from "../contract.js";
import type { PlanRidgesTypes } from "../types.js";
import {
  computeFracturePotential,
  computeMountainScore,
  computeOrogenyPotential,
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
  riftPotential: Uint8Array;
  tectonicStress: Uint8Array;
  fractalMountain: Int16Array;
} {
  const { width, height } = input;
  const size = Math.max(0, (width | 0) * (height | 0));

  const landMask = input.landMask as Uint8Array;
  const boundaryCloseness = input.boundaryCloseness as Uint8Array;
  const boundaryType = input.boundaryType as Uint8Array;
  const upliftPotential = input.upliftPotential as Uint8Array;
  const riftPotential = input.riftPotential as Uint8Array;
  const tectonicStress = input.tectonicStress as Uint8Array;
  const fractalMountain = input.fractalMountain as Int16Array;

  if (
    landMask.length !== size ||
    boundaryCloseness.length !== size ||
    boundaryType.length !== size ||
    upliftPotential.length !== size ||
    riftPotential.length !== size ||
    tectonicStress.length !== size ||
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
    riftPotential,
    tectonicStress,
    fractalMountain,
  };
}

export const defaultStrategy = createStrategy(PlanRidgesContract, "default", {
  run: (input, config) => {
    const { size, landMask, boundaryCloseness, boundaryType, upliftPotential, riftPotential, tectonicStress, fractalMountain } =
      validateRidgesInputs(input);

    const mountainMask = new Uint8Array(size);
    const orogenyPotential = new Uint8Array(size);
    const fracturePotential = new Uint8Array(size);

    const boundaryGate = Math.min(0.99, Math.max(0, config.boundaryGate));
    const falloffExponent = config.boundaryExponent;

    for (let i = 0; i < size; i++) {
      if (landMask[i] === 0) continue;

      const closenessNorm = boundaryCloseness[i] / 255;
      const boundaryStrength = resolveBoundaryStrength(closenessNorm, boundaryGate, falloffExponent);
      // Diagnostics should remain continuous even when placement is gated.
      // The gate exists to prevent low-signal residual fields from producing mountains everywhere,
      // but the underlying physical proximity signal does not have a discontinuity.
      const boundaryInfluence = Math.pow(closenessNorm, falloffExponent);

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
        stress,
        rift,
        fractal,
        driverStrength,
        config,
      });

      if (score > config.mountainThreshold) {
        mountainMask[i] = 1;
      }
    }

    return { mountainMask, orogenyPotential, fracturePotential };
  },
});
