/**
 * Ice planning should mark strong freeze evidence, not every tile with a
 * non-zero coldness score. This local policy keeps ice admission attached to
 * the ice feature family instead of making Ecology route through shared
 * feature-planner machinery.
 */
export function admitIceIntent(candidate: Readonly<{ confidence01: number }>): boolean {
  return candidate.confidence01 > 0.5;
}
