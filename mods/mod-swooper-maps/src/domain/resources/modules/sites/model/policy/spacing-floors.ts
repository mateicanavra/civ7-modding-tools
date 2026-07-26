/**
 * Per-type same-type spacing-floor policy. Floors are derived from the
 * effective target count: common types (target >= 12) keep the official
 * Poisson average spacing of 3; everything scarcer holds a floor of 4 so
 * rare types never bunch. Scaled by the perTypeSpacingFloorScale knob and
 * (1 + sparsity); never decays during selection (E2.6).
 */
export function spacingFloorFor(targetCount: number): number {
  if (targetCount >= 12) return 3;
  return 4;
}
