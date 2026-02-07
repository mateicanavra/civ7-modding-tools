import { createStrategy } from "@swooper/mapgen-core/authoring";
import PlanRidgesAndFoothillsContract from "../contract.js";
import {
  computeFracturePotential,
  computeOrogenyPotential,
  computeHillScore,
  computeMountainScore,
  encodeNormalizedToU8,
  normalizeRidgeFractal,
  resolveBoundaryStrength,
  resolveDriverStrength,
  validateRidgesInputs,
} from "../rules/index.js";

export const defaultStrategy = createStrategy(PlanRidgesAndFoothillsContract, "default", {
  run: (input, config) => {
    const { size, landMask, boundaryCloseness, boundaryType, upliftPotential, riftPotential, tectonicStress, fractalMountain, fractalHill } =
      validateRidgesInputs(input);

    const scores = new Float32Array(size);
    const hillScores = new Float32Array(size);
    const orogenyPotential = new Uint8Array(size);
    const fracturePotential = new Uint8Array(size);

    const boundaryGate = Math.min(0.99, Math.max(0, config.boundaryGate));
    const falloffExponent = config.boundaryExponent;

    for (let i = 0; i < size; i++) {
      if (landMask[i] === 0) continue;

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

      const fractalMtn = normalizeRidgeFractal(fractalMountain[i]);
      const fractalHillValue = normalizeRidgeFractal(fractalHill[i]);

      const orogeny = computeOrogenyPotential({
        boundaryStrength,
        boundaryType: bType,
        uplift,
        stress,
        rift,
        config,
      });
      orogenyPotential[i] = encodeNormalizedToU8(orogeny);

      const fracture = computeFracturePotential({ boundaryStrength, stress, rift, config });
      fracturePotential[i] = encodeNormalizedToU8(fracture);

      scores[i] = computeMountainScore({
        boundaryStrength,
        boundaryType: bType,
        uplift,
        stress,
        rift,
        fractal: fractalMtn,
        driverStrength,
        config,
      });

      hillScores[i] = computeHillScore({
        boundaryStrength,
        boundaryType: bType,
        uplift,
        stress,
        rift,
        fractal: fractalHillValue,
        driverStrength,
        config,
      });
    }

    const mountainMask = new Uint8Array(size);
    const hillMask = new Uint8Array(size);

    for (let i = 0; i < size; i++) {
      if (landMask[i] === 0) continue;
      if (scores[i] > config.mountainThreshold) {
        mountainMask[i] = 1;
      }
    }

    for (let i = 0; i < size; i++) {
      if (landMask[i] === 0) continue;
      if (mountainMask[i] === 1) continue;
      if (hillScores[i] > config.hillThreshold) {
        hillMask[i] = 1;
      }
    }

    return { mountainMask, hillMask, orogenyPotential, fracturePotential };
  },
});
