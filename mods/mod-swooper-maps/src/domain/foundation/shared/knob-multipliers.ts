import { clampFinite } from "@swooper/mapgen-core/lib/math";

function clampActivity01(value: number | undefined): number {
  return clampFinite(value ?? 0.5, 0, 1, 0.5);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Plate activity scales orogeny emission INTENSITY — convergent uplift and
 * subduction volcanism — in foundation-tectonics, applied AFTER boundary-regime
 * classification. Because no boundary appears or disappears (the regime topology
 * is fixed), the lever is smooth and monotonic: higher activity = more vigorous
 * mountain building and arc volcanism, not relocated land. Projection then
 * materializes the resulting tectonic truth faithfully.
 *
 * Mapping: 0.0 -> 0.8, 0.5 -> 1.0, 1.0 -> 1.2 (piecewise linear). 0.5 is an exact no-op.
 */
export function resolvePlateActivityOrogenyMultiplier(value: number | undefined): number {
  const v = clampActivity01(value);
  if (v <= 0.5) return lerp(0.8, 1.0, v / 0.5);
  return lerp(1.0, 1.2, (v - 0.5) / 0.5);
}

// Piecewise-linear around a neutral midpoint (0.5 = the op default), the same smooth/monotonic shape
// as plate activity. Endpoints are physically-valid points inside the property ranges declared in
// compute-crust-evolution/config.ts — NOT output-tuned constants; the lever just co-varies a coupled
// pair along one author intent.
function knob01(value: number | undefined): number {
  return clampFinite(value ?? 0.5, 0, 1, 0.5);
}

function piecewise(value: number | undefined, lo: number, mid: number, hi: number): number {
  const v = knob01(value);
  return v <= 0.5 ? lerp(lo, mid, v / 0.5) : lerp(mid, hi, (v - 0.5) / 0.5);
}

/**
 * Continental abundance lever → the coupled `compute-crust-evolution` abundance pair. One intent
 * (how much land) drives both: more abundance ⇒ marginal crust survives (survival-maturity DOWN) and
 * resists rifting (breakup-resistance UP). 0.5 reproduces the op defaults (survival 0.60, breakup 0.10).
 *
 * survivalMaturity: 0.0 -> 0.85, 0.5 -> 0.60, 1.0 -> 0.40   (down with abundance)
 * breakupBase:      0.0 -> 0.05, 0.5 -> 0.10, 1.0 -> 0.30   (up with abundance)
 */
export function resolveContinentalAbundance(value: number | undefined): {
  continentalSurvivalMaturity: number;
  hyperextensionBreakupBase: number;
} {
  return {
    continentalSurvivalMaturity: piecewise(value, 0.85, 0.6, 0.4),
    hyperextensionBreakupBase: piecewise(value, 0.05, 0.1, 0.3),
  };
}

/**
 * Continental relief lever → the coupled `compute-crust-evolution` relief triple. One intent (how
 * dramatic the continent↔ocean transition) drives all three: more relief ⇒ continents stand higher
 * (freeboard UP), thinned margins subside deeper (shelf/basin depth UP), and the open-ocean floor
 * falls further from the margin to the abyssal plain (abyssal depth UP). Abyssal depth belongs to
 * the same intent: it is the deep end of the continent↔ocean relief — the offshore deepening the
 * gradient shelf classifier reads as a continental slope (without it a flat floor floods the basin
 * as shelf). 0.5 reproduces the op defaults (freeboard 0.35, thinningLoss 0.55, abyssalDepth 0.75).
 *
 * freeboard:     0.0 -> 0.15, 0.5 -> 0.35, 1.0 -> 0.55   (up with relief)
 * thinningLoss:  0.0 -> 0.40, 0.5 -> 0.55, 1.0 -> 0.72   (up with relief)
 * abyssalDepth:  0.0 -> 0.35, 0.5 -> 0.75, 1.0 -> 0.95   (up with relief)
 */
export function resolveContinentalRelief(value: number | undefined): {
  continentalFreeboard: number;
  thinningThicknessLoss: number;
  oceanicAbyssalDepth: number;
} {
  return {
    continentalFreeboard: piecewise(value, 0.15, 0.35, 0.55),
    thinningThicknessLoss: piecewise(value, 0.4, 0.55, 0.72),
    oceanicAbyssalDepth: piecewise(value, 0.35, 0.75, 0.95),
  };
}
