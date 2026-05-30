/**
 * A vegetation score can mean weak grassland or climate potential, not actual
 * tree/brush cover. The threshold keeps sparse cover features reserved for
 * tiles where moisture, energy, biomass, and stress signals agree strongly
 * enough to read as visible habitat on the playable map.
 */
export function admitVegetationIntent(
  candidate: Readonly<{ confidence01: number }>,
  policy: Readonly<{ minConfidence01: number }>
): boolean {
  const minConfidence01 = Number.isFinite(policy.minConfidence01)
    ? Math.max(0, Math.min(1, policy.minConfidence01))
    : 1;
  return candidate.confidence01 >= minConfidence01;
}
