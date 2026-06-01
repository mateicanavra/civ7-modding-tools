/**
 * Wetland scores combine hydrology, relief, and climate signals. A weak
 * positive score can still describe a broadly moist tile, so the wetland
 * planner owns the final admission policy before marsh, bog, mangrove, oasis,
 * or watering-hole intents can claim occupancy.
 */
export function admitWetlandIntent(candidate: Readonly<{ confidence01: number }>): boolean {
  return candidate.confidence01 > 0.12;
}
