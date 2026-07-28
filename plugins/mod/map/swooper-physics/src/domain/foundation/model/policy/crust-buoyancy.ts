import { clamp01 } from "@swooper/mapgen-core/lib/math";

/**
 * Shared crust buoyancy / strength / classification model — the SINGLE SOURCE OF
 * TRUTH for how crust-history state (maturity, thickness, thermal age) maps to
 * isostatic buoyancy. Consumed by both the t=0 basaltic-lid seed (`compute-crust`)
 * and the era-integrated evolution (`compute-crust-evolution`) so the two can no
 * longer silently diverge (they previously carried byte-identical private copies).
 *
 * WHY here: both Lithosphere and Orogeny depend on the same Foundation-level
 * buoyancy law, so the nearest honest owner is `foundation/model/policy` rather
 * than either module. Buoyancy is NOT author-configurable: crust evolution
 * follows tectonic history, so these are physical coefficients, never authoring
 * knobs, and must never be tuned to a downstream land/ocean output ratio.
 */

/**
 * Isostatic buoyancy floor every crust cell inherits before history differentiates it
 * (the basaltic oceanic lid at t=0). This is the baseline for ALL crust — the
 * oceanic-vs-continental split emerges from the maturity / thickness / age terms below,
 * not from this constant. (Formerly mis-named `OCEANIC_BASE_ELEVATION`.)
 */
const CRUST_BASE_BUOYANCY = 0.32;

/** Thermal subsidence depth: cooling lithosphere sinks with thermal age. */
const OCEANIC_AGE_DEPTH = 0.22;
/** Differentiated (mature) crust is more buoyant. */
const MATURITY_BUOYANCY_BOOST = 0.45;
/** Thicker crust floats higher (isostasy). */
const THICKNESS_BUOYANCY_BOOST = 0.25;

/** Maturity at/above which a cell is classified continental crust. */
const MATURITY_CONTINENT_THRESHOLD = 0.55;

/**
 * Isostatic-support ramp over crustal thickness. Thin crust (basaltic oceanic lithosphere; thinned
 * or young continental margins) is poorly supported and subsides as it cools; thick crust (cratonic
 * keels / orogenic roots) is isostatically buoyant and does not subside. Brackets the basaltic floor
 * (~0.25–0.35 → full subsidence) and a consolidated keel (~0.75+ → none).
 */
const ISOSTASY_THIN_THICKNESS = 0.35;
const ISOSTASY_THICK_THICKNESS = 0.75;

/** Minimum lithospheric-strength contribution before thermal aging. */
const STRENGTH_BASE_MIN = 0.45;
const STRENGTH_MATURITY_MIN = 0.5;
const STRENGTH_THICKNESS_MIN = 0.55;

interface CrustBuoyancyInputs {
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
 * Isostatic support in [0,1] from crustal thickness: 0 = thin / poorly supported (subsides with
 * age), 1 = thick / buoyant (does not subside).
 */
function isostaticSupport(thickness: number): number {
  return smoothstep(ISOSTASY_THIN_THICKNESS, ISOSTASY_THICK_THICKNESS, clamp01(thickness));
}

/**
 * Isostatic crust buoyancy in [0,1] from crust-history state. Higher rides higher (emerges as land /
 * shallow shelf); lower sinks (deep ocean). `baseElevation := this`, and base-topography linearly
 * remaps it into the absolute relief band — so the SHAPE of this function's output distribution IS
 * the hypsometry.
 *
 * Thermal subsidence (cooling lithosphere contracts and sinks with age) is gated by ISOSTASY rather
 * than crust type: it acts fully on THIN crust — basaltic oceanic lithosphere (young ridge high →
 * old abyss deep) and thinned/young continental margins (which subside into real shelves) — and
 * fades to zero as crust thickens into an isostatically-supported cratonic keel (old cratons ride
 * highest, never sinking). This deepens old ocean, keeps cratons high, AND leaves thin margins low,
 * yielding a natural shelf→coast→highland spread rather than a drowned flat band (old uniform
 * subsidence) or a uniform high plateau. It also retires the prior mis-model where a saturated,
 * signal-free continental thermalAge dragged all crust down uniformly.
 */
export function deriveBuoyancy(params: CrustBuoyancyInputs): number {
  const maturity = clamp01(params.maturity);
  const thickness = clamp01(params.thickness);
  const maturityBoost = MATURITY_BUOYANCY_BOOST * maturity;
  const thicknessBoost = THICKNESS_BUOYANCY_BOOST * thickness;
  const subsidence =
    OCEANIC_AGE_DEPTH * clamp01(params.thermalAge01) * (1 - isostaticSupport(thickness));
  return clamp01(CRUST_BASE_BUOYANCY + maturityBoost + thicknessBoost - subsidence);
}

/** Continental-crust classification from maturity. */
export function isContinentalMaturity(maturity: number): boolean {
  return maturity >= MATURITY_CONTINENT_THRESHOLD;
}

/**
 * Maps normalized thermal age to the crust-strength factor shared by initialization and evolution.
 *
 * @param age01 - Admitted thermal age, where zero is newly formed crust and one is fully cooled.
 * @returns A bounded factor that strengthens crust as it cools.
 */
export function strengthFromThermalAge(age01: number): number {
  return STRENGTH_BASE_MIN + (1 - STRENGTH_BASE_MIN) * clamp01(age01);
}

/**
 * Maps normalized compositional maturity to the strength factor used by both crust vintages.
 *
 * @param maturity - Admitted differentiation maturity from basaltic to continental composition.
 * @returns A bounded factor that strengthens crust as differentiation matures.
 */
export function strengthFromMaturity(maturity: number): number {
  return STRENGTH_MATURITY_MIN + (1 - STRENGTH_MATURITY_MIN) * clamp01(maturity);
}

/**
 * Maps normalized crustal thickness to the shared isostatic strength contribution.
 *
 * @param thickness - Admitted relative thickness for the crust cell being classified.
 * @returns A bounded factor that increases strength for thicker crust.
 */
export function strengthFromThickness(thickness: number): number {
  return STRENGTH_THICKNESS_MIN + (1 - STRENGTH_THICKNESS_MIN) * clamp01(thickness);
}
