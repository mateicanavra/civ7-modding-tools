/**
 * Wetland scores combine hydrology, relief, and climate signals. A weak
 * positive score can still describe a broadly moist tile, so the wetland
 * planner owns the final admission policy before marsh, bog, mangrove, oasis,
 * or watering-hole intents can claim occupancy.
 */
export function admitWetlandIntent(
  candidate: Readonly<{ confidence01: number }>,
  policy: Readonly<{ minConfidence01: number }>
): boolean {
  const minConfidence01 = Number.isFinite(policy.minConfidence01)
    ? Math.max(0, Math.min(1, policy.minConfidence01))
    : 1;
  return candidate.confidence01 >= minConfidence01;
}
