import { createStrategy } from "@swooper/mapgen-core/authoring";
import PlanRidgesAndFoothillsContract from "../contract.js";
import {
  computeFracture01,
  computeOrogenyPotential01,
  computeHillScore,
  computeMountainScore,
  encode01Byte,
  normalizeRidgeFractal,
  resolveBoundaryStrength,
  validateRidgesInputs,
} from "../rules/index.js";

const SCORE_NORMALIZATION_EPS = 1e-6;

export const defaultStrategy = createStrategy(PlanRidgesAndFoothillsContract, "default", {
  run: (input, config) => {
    const { size, landMask, boundaryCloseness, boundaryType, upliftPotential, riftPotential, tectonicStress, fractalMountain, fractalHill } =
      validateRidgesInputs(input);

    const scores = new Float32Array(size);
    const hillScores = new Float32Array(size);
    const orogenyPotential01 = new Uint8Array(size);
    const fracture01 = new Uint8Array(size);

    const boundaryGate = Math.min(0.99, Math.max(0, config.boundaryGate));
    const falloffExponent = config.boundaryExponent;

    let maxMountainScore = 0;
    let maxHillScore = 0;

    for (let i = 0; i < size; i++) {
      if (landMask[i] === 0) continue;

      const closenessNorm = boundaryCloseness[i] / 255;
      const boundaryStrength = resolveBoundaryStrength(closenessNorm, boundaryGate, falloffExponent);

      const uplift = upliftPotential[i] / 255;
      const stress = tectonicStress[i] / 255;
      const rift = riftPotential[i] / 255;
      const bType = boundaryType[i];

      const fractalMtn = normalizeRidgeFractal(fractalMountain[i]);
      const fractalHillValue = normalizeRidgeFractal(fractalHill[i]);

      const orogeny = computeOrogenyPotential01({
        boundaryStrength,
        boundaryType: bType,
        uplift,
        stress,
        rift,
      });
      orogenyPotential01[i] = encode01Byte(orogeny);

      const fracture = computeFracture01({ boundaryStrength, stress, rift });
      fracture01[i] = encode01Byte(fracture);

      scores[i] = computeMountainScore({
        boundaryStrength,
        boundaryType: bType,
        uplift,
        stress,
        rift,
        fractal: fractalMtn,
        config,
      });

      hillScores[i] = computeHillScore({
        boundaryStrength,
        boundaryType: bType,
        uplift,
        stress,
        rift,
        fractal: fractalHillValue,
        config,
      });

      if (scores[i] > maxMountainScore) maxMountainScore = scores[i];
      if (hillScores[i] > maxHillScore) maxHillScore = hillScores[i];
    }

    // Normalize by the in-map maxima so thresholds behave consistently even when physics driver magnitudes
    // are not saturating 0..255 (the spatial pattern remains physics-driven and deterministic).
    if (maxMountainScore > SCORE_NORMALIZATION_EPS) {
      for (let i = 0; i < size; i++) scores[i] = scores[i]! / maxMountainScore;
    }
    if (maxHillScore > SCORE_NORMALIZATION_EPS) {
      for (let i = 0; i < size; i++) hillScores[i] = hillScores[i]! / maxHillScore;
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

    return { mountainMask, hillMask, orogenyPotential01, fracture01 };
  },
});
