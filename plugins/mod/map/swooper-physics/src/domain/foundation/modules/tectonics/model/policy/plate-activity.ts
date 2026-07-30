import { clampFinite } from "@swooper/mapgen-core/lib/math";

const OROGENY_ACTIVITY_GAIN_MIN = 0;
const OROGENY_ACTIVITY_GAIN_MAX = 10;
const OROGENY_ACTIVITY_GAIN_FALLBACK = 1;

function clampActivity01(value: number | undefined): number {
  return clampFinite(value ?? 0.5, 0, 1, 0.5);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Plate activity scales orogeny emission intensity in foundation-tectonics after
 * boundary-regime classification. The mapping is smooth and monotonic: higher
 * activity means more vigorous mountain building and arc volcanism, not relocated land.
 */
function resolvePlateActivityOrogenyMultiplier(value: number | undefined): number {
  const v = clampActivity01(value);
  if (v <= 0.5) return lerp(0.8, 1.0, v / 0.5);
  return lerp(1.0, 1.2, (v - 0.5) / 0.5);
}

/**
 * Applies the recipe's plate-activity posture to an authored orogeny gain.
 *
 * The neutral knob preserves the authored strategy value exactly; lower and
 * higher settings scale that value without exceeding the strategy contract.
 */
export function applyPlateActivityOrogenyGain(
  authoredGain: number,
  plateActivity: number | undefined
): number {
  return clampFinite(
    authoredGain * resolvePlateActivityOrogenyMultiplier(plateActivity),
    OROGENY_ACTIVITY_GAIN_MIN,
    OROGENY_ACTIVITY_GAIN_MAX,
    OROGENY_ACTIVITY_GAIN_FALLBACK
  );
}
