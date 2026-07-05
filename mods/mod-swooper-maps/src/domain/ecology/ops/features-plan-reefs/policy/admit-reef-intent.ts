/**
 * Reef planning scores describe broad ocean suitability; they are not placement
 * commands by themselves. This policy keeps the reef-family intent threshold
 * with the reef planner so atoll, warm reef, cold reef, and lotus behavior can
 * evolve with reef habitat physics instead of routing through a generic helper.
 */
export function admitReefIntent(
  candidate: Readonly<{ confidence01: number }>,
  policy: Readonly<{ minConfidence01: number }>
): boolean {
  const minConfidence01 = Number.isFinite(policy.minConfidence01)
    ? Math.max(0, Math.min(1, policy.minConfidence01))
    : 1;
  return candidate.confidence01 >= minConfidence01;
}

/**
 * Reef families are patch and bank features. A strong score identifies habitat;
 * the stride keeps repeated adjacent habitat from turning into a carpet while
 * preserving deterministic clusters that still look like reefs, atolls, or
 * lake lotus patches instead of random thinning.
 */
export function admitReefStride(
  candidate: Readonly<{ tileIndex: number }>,
  policy: Readonly<{ stride: number }>
): boolean {
  const stride = Number.isFinite(policy.stride) ? Math.max(1, policy.stride | 0) : 1;
  return candidate.tileIndex % stride === 0;
}
