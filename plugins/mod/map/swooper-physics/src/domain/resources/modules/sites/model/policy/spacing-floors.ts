/**
 * Per-type same-type spacing-floor policy. Floors are derived from the
 * resource and effective target count: Fish and Crabs keep a floor of 4 at every supply.
 * Other common types (target >= 12) keep the official Poisson average spacing of 3;
 * everything scarcer holds a floor of 4. Scaled by the perTypeSpacingFloorScale knob and
 * (1 + sparsity); never decays during selection (E2.6).
 */
export function spacingFloorFor(resourceType: string, targetCount: number): number {
  if (resourceType === "RESOURCE_FISH" || resourceType === "RESOURCE_CRABS") return 4;
  if (targetCount >= 12) return 3;
  return 4;
}
