import { clamp } from "@swooper/mapgen-core/lib/math";
import type { MorphologyMountainRangesKnob } from "../../index.js";

/**
 * Derives the stage's shared ridge, foothill, and rough-land strategy posture from physical controls.
 *
 * The recipe schema admits ranges and integer fields before this function runs. The resulting
 * strategy configuration remains a deterministic authoring projection, not another validation
 * boundary.
 */
export function resolveMountainRangesControl(config: MorphologyMountainRangesKnob) {
  const {
    tectonicActivity,
    rangeSystemSpacingTiles,
    rangeSystemLengthTiles,
    provinceRadiusTiles,
    ridgeWidthTiles,
    foothillExtentTiles,
    interiorHighlandExpression,
    terrainTextureFractalMix,
    erosionMaturity,
    tectonicSignalSensitivity,
  } = config;

  const ridgeWidthScale = ridgeWidthTiles / 4;
  const foothillScale = foothillExtentTiles / 12;
  const provinceScale = provinceRadiusTiles / 12;
  const activityScale = tectonicActivity / 3;

  const mountainMaxFraction = clamp(
    0.035 + tectonicActivity * 0.047 + ridgeWidthTiles * 0.012,
    0,
    0.18
  );
  const mountainMinFraction = clamp(
    Math.min(mountainMaxFraction * 0.75, 0.018 + tectonicActivity * 0.035 + ridgeWidthTiles * 0.01),
    0,
    mountainMaxFraction
  );
  const hillMaxFraction = clamp(
    0.14 + foothillExtentTiles * 0.016 + interiorHighlandExpression * 0.075,
    0,
    0.42
  );
  const foothillMaxFraction = clamp(
    0.045 + foothillExtentTiles * 0.012 + tectonicActivity * 0.006,
    0,
    hillMaxFraction
  );
  const roughLandMaxFraction = clamp(
    0.025 + interiorHighlandExpression * 0.045 + terrainTextureFractalMix * 0.025,
    0,
    Math.max(0, hillMaxFraction - foothillMaxFraction * 0.35)
  );

  return {
    tectonicIntensity: clamp(tectonicActivity, 0, 10),
    driverSignalByteMin: clamp(
      Math.round(30 - tectonicSignalSensitivity * 16 - tectonicActivity * 2),
      0,
      255
    ),
    driverExponent: clamp(1.24 - tectonicSignalSensitivity * 0.3, 0.35, 2),
    mountainMaxFraction,
    mountainMinFraction,
    hillMaxFraction,
    mountainSpineFraction: clamp(0.01 + ridgeWidthScale * 0.045 + activityScale * 0.035, 0, 0.12),
    mountainRangeSpacingTiles: rangeSystemSpacingTiles,
    mountainRangeLengthTiles: rangeSystemLengthTiles,
    mountainRegionRadiusTiles: provinceRadiusTiles,
    mountainSpineDilationSteps: ridgeWidthTiles,
    mountainShoulderThresholdScale: clamp(
      0.58 - ridgeWidthTiles * 0.09 - tectonicActivity * 0.04,
      0.22,
      0.7
    ),
    mountainSpineMinDistance: clamp(
      Math.round(Math.max(ridgeWidthTiles * 2 + 1, rangeSystemSpacingTiles * 0.28)),
      0,
      32
    ),
    oldBeltMountainScale: clamp(0.92 - erosionMaturity * 0.42, 0.35, 0.94),
    oldBeltHillScale: clamp(1 + erosionMaturity * 0.32, 1, 1.6),
    foothillMaxDistance: foothillExtentTiles,
    foothillMinFraction: clamp(
      0.012 + foothillExtentTiles * 0.006 + tectonicActivity * 0.002,
      0,
      foothillMaxFraction
    ),
    foothillMaxFraction,
    mountainThreshold: clamp(
      0.44 - tectonicActivity * 0.13 - tectonicSignalSensitivity * 0.04 - ridgeWidthTiles * 0.02,
      0.06,
      1.2
    ),
    hillThreshold: clamp(
      0.28 -
        tectonicActivity * 0.05 -
        interiorHighlandExpression * 0.04 -
        terrainTextureFractalMix * 0.05,
      0.08,
      1.2
    ),
    upliftWeight: clamp(0.28 + tectonicActivity * 0.12, 0, 10),
    fractalWeight: clamp(0.14 + terrainTextureFractalMix * 0.52, 0, 10),
    orogenyCollisionStressWeight: clamp(0.58 + tectonicActivity * 0.06, 0, 10),
    orogenyCollisionUpliftWeight: clamp(0.36 + tectonicActivity * 0.08, 0, 10),
    orogenyTransformStressWeight: clamp(0.28 + terrainTextureFractalMix * 0.32, 0, 10),
    orogenyDivergentRiftWeight: clamp(0.42 + tectonicActivity * 0.08, 0, 10),
    orogenyDivergentStressWeight: clamp(0.1 + terrainTextureFractalMix * 0.12, 0, 10),
    fractureBoundaryWeight: clamp(0.62 + provinceScale * 0.32, 0, 10),
    fractureStressWeight: clamp(0.18 + terrainTextureFractalMix * 0.22, 0, 10),
    fractureRiftWeight: clamp(0.09 + tectonicActivity * 0.04, 0, 10),
    mountainCollisionStressWeight: clamp(0.44 + tectonicActivity * 0.08, 0, 10),
    mountainCollisionUpliftWeight: clamp(0.42 + tectonicActivity * 0.1, 0, 10),
    mountainSubductionUpliftWeight: clamp(0.2 + tectonicActivity * 0.09, 0, 10),
    mountainInteriorUpliftScale: clamp(0.12 + interiorHighlandExpression * 0.09, 0, 10),
    mountainFractalScale: clamp(0.24 + terrainTextureFractalMix * 0.5, 0, 10),
    mountainConvergenceFractalBase: clamp(0.68 - terrainTextureFractalMix * 0.3, 0, 10),
    mountainConvergenceFractalSpan: clamp(0.32 + terrainTextureFractalMix * 0.3, 0, 10),
    riftDepth: clamp(0.16 + erosionMaturity * 0.14, 0, 1),
    boundaryWeight: clamp(0.78 + tectonicActivity * 0.18 + provinceScale * 0.3, 0, 10),
    boundaryGate: clamp(0.13 - tectonicSignalSensitivity * 0.07 - tectonicActivity * 0.02, 0, 0.99),
    boundaryExponent: clamp(
      1.78 - provinceRadiusTiles * 0.11 - tectonicSignalSensitivity * 0.12,
      0.25,
      10
    ),
    rangeEnvelopeScale: clamp(1 + provinceRadiusTiles * 0.13 + tectonicActivity * 0.22, 0.25, 4),
    interiorPenaltyWeight: clamp(
      0.24 - interiorHighlandExpression * 0.11 + ridgeWidthScale * 0.04,
      0,
      10
    ),
    convergenceBonus: clamp(0.72 + tectonicActivity * 0.27, 0, 10),
    transformPenalty: clamp(
      0.78 - terrainTextureFractalMix * 0.18 - tectonicActivity * 0.02,
      0,
      10
    ),
    riftPenalty: clamp(0.95 + erosionMaturity * 0.12, 0, 10),
    hillBoundaryWeight: clamp(0.34 + foothillExtentTiles * 0.045, 0, 10),
    hillRiftBonus: clamp(0.18 + foothillScale * 0.28 + terrainTextureFractalMix * 0.08, 0, 10),
    hillFoothillBase: clamp(0.4 + foothillScale * 0.32, 0, 10),
    hillFoothillFractalGain: clamp(0.42 + terrainTextureFractalMix * 1.1, 0, 10),
    hillConvergentFoothill: clamp(0.3 + foothillExtentTiles * 0.055, 0, 10),
    hillInteriorFalloff: clamp(
      0.26 - interiorHighlandExpression * 0.1 - terrainTextureFractalMix * 0.03,
      0,
      10
    ),
    hillUpliftWeight: clamp(0.18 + interiorHighlandExpression * 0.17, 0, 10),
    hillFractalScale: clamp(0.62 + terrainTextureFractalMix * 0.9, 0, 10),
    hillUpliftScale: clamp(0.28 + interiorHighlandExpression * 0.48, 0, 10),
    hillRiftBonusScale: clamp(0.42 + terrainTextureFractalMix * 0.34, 0, 10),
    hillRiftDepthScale: clamp(0.55 - terrainTextureFractalMix * 0.26, 0, 10),
    roughLandMaxFraction,
    roughLandFractalFloor: clamp(0.55 - terrainTextureFractalMix * 0.52, 0, 10),
    roughLandFractalGain: clamp(0.62 + terrainTextureFractalMix * 1.05, 0, 10),
    roughLandInteriorScale: clamp(0.54 + interiorHighlandExpression * 0.56, 0, 10),
  };
}
