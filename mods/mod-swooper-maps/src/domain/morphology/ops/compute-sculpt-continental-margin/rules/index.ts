import { clamp, clamp01 } from "@swooper/mapgen-core/lib/math";

import type { ComputeSculptContinentalMarginTypes } from "../types.js";

/** Boundary type codes (mirror foundation/constants BOUNDARY_TYPE; kept op-local to avoid a cross-domain import). */
export const BOUNDARY_CONVERGENT = 1;
export const BOUNDARY_DIVERGENT = 2;
export const BOUNDARY_TRANSFORM = 3;

/** Sentinel for "no margin reached this tile" in the margin-hop BFS (matches u16 UNREACHED convention). */
export const MARGIN_UNREACHED = 65535;

/**
 * Ratio of continental-SLOPE steepness to continental-APRON steepness.
 *
 * The whole point of a continental margin is the BREAK: a knee where a gentle shelf apron
 * gives way to a markedly steeper slope. The break only exists if the slope is steeper than
 * the apron — i.e. this ratio must be > 1. At a fixed relief, a steeper slope is a SHORTER
 * run, so the slope length scale is the apron length scale divided by this ratio. A value of
 * 4 means the slope drops four times as fast as the apron, producing a clear, readable break.
 */
export const BREAK_SLOPE_RATIO = 4;

type Config = ComputeSculptContinentalMarginTypes["config"]["default"];

/**
 * Relief datums for the margin profile, SINGLE-SOURCED from compute-base-topography (this map's
 * REAL relief) and threaded in as op INPUTS, never duplicated as config. The derive/evaluate
 * functions take this object so the profile endpoints always re-derive against the active map's
 * hypsometry rather than a stale mirrored default.
 */
export type Relief = {
  /** Normalized oceanic-crust baseline (base-topography.oceanicHeight). */
  oceanicHeight: number;
  /** Normalized continental-crust baseline (base-topography.continentalHeight). */
  continentalHeight: number;
  /** Absolute-elevation quantization scale (base-topography DEFAULT_ELEVATION_SCALE). */
  elevationScale: number;
};

/**
 * Ensures sculpt inputs match the expected map size and exposes them as concrete typed arrays,
 * plus the single-sourced relief datums (validated as finite numbers).
 */
export function validateSculptInputs(input: ComputeSculptContinentalMarginTypes["input"]): {
  size: number;
  relief: Relief;
  elevation: Int16Array;
  crustType: Uint8Array;
  crustAge: Uint8Array;
  crustBuoyancy: Float32Array;
  boundaryCloseness: Uint8Array;
  boundaryType: Uint8Array;
} {
  const { width, height } = input;
  const size = Math.max(0, (width | 0) * (height | 0));
  const oceanicHeight = input.oceanicHeight;
  const continentalHeight = input.continentalHeight;
  const elevationScale = input.elevationScale;
  if (
    !Number.isFinite(oceanicHeight) ||
    !Number.isFinite(continentalHeight) ||
    !Number.isFinite(elevationScale)
  ) {
    throw new Error(
      "[SculptContinentalMargin] Relief datums (oceanicHeight/continentalHeight/elevationScale) must be finite numbers."
    );
  }
  const elevation = input.elevation as Int16Array;
  const crustType = input.crustType as Uint8Array;
  const crustAge = input.crustAge as Uint8Array;
  const crustBuoyancy = input.crustBuoyancy as Float32Array;
  const boundaryCloseness = input.boundaryCloseness as Uint8Array;
  const boundaryType = input.boundaryType as Uint8Array;
  if (
    elevation.length !== size ||
    crustType.length !== size ||
    crustAge.length !== size ||
    crustBuoyancy.length !== size ||
    boundaryCloseness.length !== size ||
    boundaryType.length !== size
  ) {
    throw new Error("[SculptContinentalMargin] Input tensors must match width*height.");
  }
  return {
    size,
    relief: { oceanicHeight, continentalHeight, elevationScale },
    elevation,
    crustType,
    crustAge,
    crustBuoyancy,
    boundaryCloseness,
    boundaryType,
  };
}

/**
 * Computes the physical apron LENGTH SCALE (tiles) for a margin seed tile, as a multiplicative
 * posture on the base length:
 *  - active margins (convergent/transform, high closeness) => narrow (activeApronFactor < 1);
 *  - divergent rifts => narrow (riftApronFactor < 1);
 *  - everything else (passive) => wide (passiveApronFactor > 1), further widened by crust age
 *    (more accumulated sediment) and crust buoyancy (broader shed apron).
 * These are physical ratios, not output-tuned counts.
 */
export function computeApronLengthScale(params: {
  boundaryTypeCode: number;
  closenessNorm: number;
  ageNorm: number;
  buoyancyNorm: number;
  config: Config;
}): number {
  const { boundaryTypeCode, closenessNorm, ageNorm, buoyancyNorm, config } = params;
  const isActive =
    (boundaryTypeCode === BOUNDARY_CONVERGENT || boundaryTypeCode === BOUNDARY_TRANSFORM) &&
    closenessNorm >= config.activeClosenessThreshold;
  const isRift = boundaryTypeCode === BOUNDARY_DIVERGENT;

  let posture: number;
  if (isActive) {
    posture = config.activeApronFactor;
  } else if (isRift) {
    posture = config.riftApronFactor;
  } else {
    // Passive margin: wide base, widened by age + buoyancy (sediment accumulation proxies).
    const ageWiden = 1 + config.ageApronGain * clamp01(ageNorm);
    const buoyancyWiden = 1 + config.buoyancyApronGain * clamp01(buoyancyNorm);
    posture = config.passiveApronFactor * ageWiden * buoyancyWiden;
  }
  // A length scale is strictly positive (the BFS divides by it).
  return Math.max(0.25, config.baseApronLengthTiles * posture);
}

/**
 * Derives the shelf BREAK elevation (absolute engine int16 units) from the input hypsometric
 * scale: the drowned outer continental edge sits at a physical mid-relief crust fraction.
 * breakElevation = (oceanicHeight + reliefSpan*breakCrustFraction)*elevationScale. No foreign
 * magic depth — re-derives against the map's REAL (single-sourced) relief datums.
 */
export function deriveBreakElevation(relief: Relief, config: Config): number {
  const reliefSpan = relief.continentalHeight - relief.oceanicHeight;
  return Math.round(
    (relief.oceanicHeight + reliefSpan * config.breakCrustFraction) * relief.elevationScale
  );
}

/**
 * Derives the oceanic FLOOR elevation (absolute engine int16 units) = oceanicHeight*elevationScale.
 * This is the real deep-ocean floor base topography already laid down; the slope descends to it
 * and the carve-down min never invents anything deeper. No foreign magic depth.
 */
export function deriveOceanicFloor(relief: Relief): number {
  return Math.round(relief.oceanicHeight * relief.elevationScale);
}

/**
 * Derives the apron-top shore anchor CEILING (absolute engine int16 units): the submerged outer
 * continental shelf sits above the break but below land.
 * ceiling = (oceanicHeight + reliefSpan*apronTopCrustFraction)*elevationScale. By construction
 * (apronTopCrustFraction > breakCrustFraction and < ~1) it satisfies oceanicFloor < break <
 * ceiling, so it bounds the apron RAMP above the break. It is NOT a hard guarantee that the apron
 * stays underwater (the ceiling can equal/exceed the solved sea level); the apron stays water by
 * raise-only writes + the local submerged-continental anchor + the targetWaterPercent solver
 * intent (empirically verified 0 crossings).
 */
export function deriveApronAnchorCeiling(relief: Relief, config: Config): number {
  const reliefSpan = relief.continentalHeight - relief.oceanicHeight;
  return Math.round(
    (relief.oceanicHeight + reliefSpan * config.apronTopCrustFraction) * relief.elevationScale
  );
}

/**
 * Evaluates the APRON target elevation (absolute units) over SUBMERGED CONTINENTAL crust at a
 * given shoreward hop-distance from the crust-type break. The apron shoals from the break
 * elevation UP to the per-seed shore anchor across the apron length L: hop 0 (the break edge)
 * sits AT the break elevation, hop L reaches the shore anchor. Gentle because the (anchor-break)
 * relief is spread over the full L-hop run. This is a WRITE-TOWARD target (blended in by the
 * strategy), so it actually imprints rather than being killed by the deep oceanic base.
 */
export function evaluateApronTarget(params: {
  hop: number;
  apronLength: number;
  shoreAnchor: number;
  relief: Relief;
  config: Config;
}): number {
  const { hop, apronLength, shoreAnchor, relief, config } = params;
  const breakEl = deriveBreakElevation(relief, config);
  const L = Math.max(0.25, apronLength);
  const t = clamp01(hop / L); // 0 at break edge, 1 at apron shoreward end
  return breakEl + (shoreAnchor - breakEl) * t;
}

/**
 * Evaluates the SLOPE target elevation (absolute units) over OCEANIC crust at a given oceanward
 * hop-distance from the crust-type break. From the break elevation the steep continental slope
 * descends to the oceanic floor over slopeL = L/BREAK_SLOPE_RATIO hops, then flat abyssal floor
 * beyond. The slope is BREAK_SLOPE_RATIO times steeper than the apron, so the break is a readable
 * knee. This is a CARVE-DOWN target (min with existing), bounded below by the real oceanic floor.
 */
export function evaluateSlopeTarget(params: {
  hop: number;
  apronLength: number;
  relief: Relief;
  config: Config;
}): number {
  const { hop, apronLength, relief, config } = params;
  const breakEl = deriveBreakElevation(relief, config);
  const floorEl = deriveOceanicFloor(relief);
  const slopeL = Math.max(0.25, Math.max(0.25, apronLength) / BREAK_SLOPE_RATIO);
  if (hop <= 0) return breakEl;
  if (hop >= slopeL) return floorEl;
  return breakEl - (breakEl - floorEl) * clamp01(hop / slopeL);
}

/** Normalizes a 0..255 byte field into 0..1, clamped. */
export function byteToUnit(value: number): number {
  return clamp(value / 255, 0, 1);
}
