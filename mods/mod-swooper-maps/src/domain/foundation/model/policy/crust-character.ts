import { clampFinite } from "@swooper/mapgen-core/lib/math";

function knob01(value: number | undefined): number {
  return clampFinite(value ?? 0.5, 0, 1, 0.5);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function piecewise(value: number | undefined, lo: number, mid: number, hi: number): number {
  const v = knob01(value);
  return v <= 0.5 ? lerp(lo, mid, v / 0.5) : lerp(mid, hi, (v - 0.5) / 0.5);
}

/**
 * Continental abundance resolves to the coupled compute-crust-evolution
 * abundance pair. Higher abundance lets marginal crust survive and resist rifting.
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
 * Continental relief resolves to the coupled compute-crust-evolution relief
 * triple. Higher relief raises continents while deepening margins and abyssal floors.
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
