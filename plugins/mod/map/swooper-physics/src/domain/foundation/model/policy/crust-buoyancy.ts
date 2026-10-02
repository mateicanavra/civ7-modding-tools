import { clamp01 } from "@swooper/mapgen-core/lib/math";

/**
 * Shared crust buoyancy / strength / classification model — the SINGLE SOURCE OF
 * TRUTH for how normalized crust-history state (maturity, effective thickness,
 * thermal age) maps to model support. Consumed by the t=0 seed (`compute-crust`)
 * and the era-integrated evolution (`compute-crust-evolution`) so the two can no
 * longer silently diverge (they previously carried byte-identical private copies).
 *
 * WHY here: both Lithosphere and Orogeny depend on the same Foundation-level
 * support law, so the nearest honest owner is `foundation/model/policy` rather
 * than either module. Buoyancy is NOT author-configurable: crust evolution
 * follows model history. These fixed model coefficients are not independently
 * calibrated physical constants or authoring knobs; never tune them to a
 * downstream land/ocean output ratio. No material mass-balance height is solved.
 */

/**
 * Normalized support floor every crust cell inherits before history differentiates it.
 * This is the baseline for ALL crust — the
 * oceanic-vs-continental split emerges from the maturity / thickness / age terms below,
 * not from this constant. (Formerly mis-named `OCEANIC_BASE_ELEVATION`.)
 */
const CRUST_BASE_BUOYANCY = 0.32;

/** Normalized age-depression amplitude; not a measured subsidence depth. */
const OCEANIC_AGE_DEPTH = 0.22;
/** Differentiated (mature) crust is more buoyant. */
const MATURITY_BUOYANCY_BOOST = 0.45;
/** Effective consolidated thickness raises model support. */
const THICKNESS_BUOYANCY_BOOST = 0.25;

/** Maturity at/above which a cell is classified continental crust. */
const MATURITY_CONTINENT_THRESHOLD = 0.55;

/**
 * Normalized effective-thickness ramp that attenuates the model's age-depression term.
 * At <=0.35 the full term applies; at >=0.75 it is suppressed. This is an aggregate
 * support assumption, not proof that a real thick mantle root cannot thermally subside.
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
 * Age-depression attenuation in [0,1] from effective normalized thickness:
 * zero admits the full age term; one suppresses it.
 */
function isostaticSupport(thickness: number): number {
  return smoothstep(ISOSTASY_THIN_THICKNESS, ISOSTASY_THICK_THICKNESS, clamp01(thickness));
}

/**
 * Dimensionless support from crust-history state, published as `baseElevation` and
 * remapped by base topography into model relief. Its distribution influences hypsometry;
 * this function does not establish metres, geological time or a material density column.
 *
 * Maturity and effective thickness add support. The normalized age-depression term
 * is attenuated by thickness rather than crust type. The same aggregate contributes
 * to strength below; neither response separately computes crust or mantle inventory.
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
 * Maps effective normalized thickness to the shared model strength contribution.
 *
 * @param thickness - Admitted aggregate support thickness for the crust cell.
 * @returns A bounded factor that increases strength with effective thickness.
 */
export function strengthFromThickness(thickness: number): number {
  return STRENGTH_THICKNESS_MIN + (1 - STRENGTH_THICKNESS_MIN) * clamp01(thickness);
}
