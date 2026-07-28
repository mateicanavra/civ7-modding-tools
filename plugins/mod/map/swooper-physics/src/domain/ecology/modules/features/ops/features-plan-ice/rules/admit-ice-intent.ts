/**
 * Ice planning should mark strong freeze evidence, not every tile with a
 * non-zero coldness score. This local policy keeps ice admission attached to
 * the ice feature family instead of making Ecology route through shared
 * feature-planner machinery.
 */
export function admitIceIntent(
  candidate: Readonly<{ confidence01: number }>,
  policy: Readonly<{ minConfidence01: number }>
): boolean {
  const minConfidence01 = Number.isFinite(policy.minConfidence01)
    ? Math.max(0, Math.min(1, policy.minConfidence01))
    : 1;
  return candidate.confidence01 >= minConfidence01;
}
