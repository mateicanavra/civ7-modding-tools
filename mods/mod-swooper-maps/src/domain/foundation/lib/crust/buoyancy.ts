import { clamp01 } from "@swooper/mapgen-core/lib/math";

/**
 * Shared crust buoyancy / strength / classification model — the SINGLE SOURCE OF
 * TRUTH for how crust-history state (maturity, thickness, thermal age) maps to
 * isostatic buoyancy. Consumed by both the t=0 basaltic-lid seed (`compute-crust`)
 * and the era-integrated evolution (`compute-crust-evolution`) so the two can no
 * longer silently diverge (they previously carried byte-identical private copies).
 *
 * WHY here: foundation-internal physical constants live under `domain/foundation/lib`
 * (cf. `lib/tectonics/constants.ts`). Buoyancy is NOT author-configurable — crust
 * evolution follows the tectonic history — so these are physical coefficients, never
 * authoring knobs, and must never be tuned to a downstream land/ocean output ratio.
 */

/**
 * Isostatic buoyancy floor every crust cell inherits before history differentiates it
 * (the basaltic oceanic lid at t=0). This is the baseline for ALL crust — the
 * oceanic-vs-continental split emerges from the maturity / thickness / age terms below,
 * not from this constant. (Formerly mis-named `OCEANIC_BASE_ELEVATION`.)
 */
export const CRUST_BASE_BUOYANCY = 0.32;

/** Thermal subsidence depth: cooling lithosphere sinks with thermal age. */
export const OCEANIC_AGE_DEPTH = 0.22;
/** Differentiated (mature) crust is more buoyant. */
export const MATURITY_BUOYANCY_BOOST = 0.45;
/** Thicker crust floats higher (isostasy). */
export const THICKNESS_BUOYANCY_BOOST = 0.25;

/** Maturity at/above which a cell is classified continental crust. */
export const MATURITY_CONTINENT_THRESHOLD = 0.55;

/**
 * Continentality ramp: maturity at which crust begins / finishes behaving as felsic continental
 * lithosphere (thick-rooted, buoyant) rather than mafic oceanic lithosphere (dense, subsiding).
 * Brackets {@link MATURITY_CONTINENT_THRESHOLD} so the oceanic↔continental transition is smooth,
 * not a hard discontinuity at the type cut.
 */
export const CONTINENTAL_FADE_LO = 0.4;
export const CONTINENTAL_FADE_HI = 0.6;

/** Lithospheric-strength factor floors (thermalAge / maturity / thickness). */
export const STRENGTH_BASE_MIN = 0.45;
export const STRENGTH_MATURITY_MIN = 0.5;
export const STRENGTH_THICKNESS_MIN = 0.55;

export interface CrustBuoyancyInputs {
  maturity: number;
  thickness: number;
  thermalAge01: number;
}

/** Hermite smoothstep in [0,1]; 0 below edge0, 1 above edge1. */
function smoothstep(edge0: number, edge1: number, x: number): number {
  if (edge1 <= edge0) return x >= edge1 ? 1 : 0;
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

/**
 * Continentality in [0,1]: 0 = oceanic (mafic, dense, subsides with age), 1 = continental
 * (felsic, thick-rooted, buoyant), ramping across the continent threshold. Gates processes
 * that physically act on only one crust type.
 */
export function continentality(maturity: number): number {
  return smoothstep(CONTINENTAL_FADE_LO, CONTINENTAL_FADE_HI, clamp01(maturity));
}

/**
 * Isostatic crust buoyancy in [0,1] from crust-history state. Higher rides higher (emerges as
 * land / shallow shelf); lower sinks (deep ocean). `baseElevation := this`, and base-topography
 * linearly remaps it into the absolute relief band — so the SHAPE of this function's output
 * distribution IS the hypsometry.
 *
 * Thermal subsidence is an OCEANIC process: cooling mafic lithosphere contracts and sinks with
 * thermal age (young ridge high → old abyss deep). Continental (felsic, thick-rooted) crust does
 * NOT thermally subside — old cratons are the highest, most stable crust. We therefore gate the
 * subsidence term by (1 − continentality): full on oceanic crust, fading to zero as the cell
 * matures continental. This lifts the aged continental band off the waterline instead of dragging
 * exactly the crust that should ride highest down onto it. (It also retires the prior mis-model
 * where a saturated, signal-free continental thermalAge applied a uniform ~−0.21 to all crust.)
 */
export function deriveBuoyancy(params: CrustBuoyancyInputs): number {
  const maturity = clamp01(params.maturity);
  const maturityBoost = MATURITY_BUOYANCY_BOOST * maturity;
  const thicknessBoost = THICKNESS_BUOYANCY_BOOST * clamp01(params.thickness);
  const oceanic = 1 - continentality(maturity);
  const subsidence = OCEANIC_AGE_DEPTH * clamp01(params.thermalAge01) * oceanic;
  return clamp01(CRUST_BASE_BUOYANCY + maturityBoost + thicknessBoost - subsidence);
}

/** Continental-crust classification from maturity. */
export function isContinentalMaturity(maturity: number): boolean {
  return maturity >= MATURITY_CONTINENT_THRESHOLD;
}

export function strengthFromThermalAge(age01: number): number {
  return STRENGTH_BASE_MIN + (1 - STRENGTH_BASE_MIN) * clamp01(age01);
}

export function strengthFromMaturity(maturity: number): number {
  return STRENGTH_MATURITY_MIN + (1 - STRENGTH_MATURITY_MIN) * clamp01(maturity);
}

export function strengthFromThickness(thickness: number): number {
  return STRENGTH_THICKNESS_MIN + (1 - STRENGTH_THICKNESS_MIN) * clamp01(thickness);
}
