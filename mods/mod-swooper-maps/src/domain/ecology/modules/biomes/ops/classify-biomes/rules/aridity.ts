type MoistureZone = "arid" | "semiArid" | "subhumid" | "humid" | "perhumid";

const MOISTURE_ORDER: ReadonlyArray<MoistureZone> = [
  "arid",
  "semiArid",
  "subhumid",
  "humid",
  "perhumid",
];

/**
 * Returns how many aridity thresholds the index exceeds (shift count).
 */
export function aridityShiftForIndex(index: number, thresholds: readonly number[]): number {
  let shift = 0;
  for (const threshold of thresholds) {
    if (index >= threshold) shift++;
  }
  return shift;
}

/**
 * Shifts a moisture zone toward drier classes by the requested shift count.
 */
export function shiftMoistureZone(zone: MoistureZone, shift: number): MoistureZone {
  const idx = MOISTURE_ORDER.indexOf(zone);
  if (idx < 0) return zone;
  const next = Math.max(0, idx - Math.max(0, shift));
  return MOISTURE_ORDER[next] ?? zone;
}
