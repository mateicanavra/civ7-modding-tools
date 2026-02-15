/**
 * Maps a normalized moisture value to a moisture zone bucket.
 */
export function moistureZoneOf(
  value: number,
  thresholds: readonly number[]
): "arid" | "semiArid" | "subhumid" | "humid" | "perhumid" {
  if (value < thresholds[0]!) return "arid";
  if (value < thresholds[1]!) return "semiArid";
  if (value < thresholds[2]!) return "subhumid";
  if (value < thresholds[3]!) return "humid";
  return "perhumid";
}
