type TemperatureZonePolicy = Readonly<{
  polarCutoff: number;
  tundraCutoff: number;
  midLatitude: number;
  tropicalThreshold: number;
}>;

/**
 * Maps a temperature value to a coarse temperature zone.
 */
export function temperatureZoneOf(
  value: number,
  cfg: TemperatureZonePolicy
): "polar" | "cold" | "temperate" | "tropical" {
  if (value <= cfg.polarCutoff) return "polar";
  if (value <= cfg.tundraCutoff) return "cold";
  if (value <= cfg.midLatitude) return "temperate";
  if (value < cfg.tropicalThreshold) return "temperate";
  return "tropical";
}
