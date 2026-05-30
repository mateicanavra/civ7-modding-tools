/**
 * Reef planning scores describe broad ocean suitability; they are not placement
 * commands by themselves. This policy keeps the reef-family intent threshold
 * with the reef planner so atoll, warm reef, cold reef, and lotus behavior can
 * evolve with reef habitat physics instead of routing through a generic helper.
 */
export function admitReefIntent(candidate: Readonly<{ confidence01: number }>): boolean {
  return candidate.confidence01 > 0.5;
}
