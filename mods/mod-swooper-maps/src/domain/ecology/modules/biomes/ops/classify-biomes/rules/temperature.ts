type TemperatureZonePolicy = Readonly<{
  polarCutoff: number;
  tundraCutoff: number;
  midLatitude: number;
  tropicalThreshold: number;
}>;

type SurfaceTemperaturePolicy = Readonly<{
  equator: number;
  pole: number;
  lapseRate: number;
  seaLevel: number;
  bias: number;
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

/**
 * Computes surface temperature from latitude and elevation using configured lapse rates.
 */
export function computeTemperature(params: {
  latitudeAbs: number;
  maxLatitude: number;
  elevationMeters: number;
  cfg: SurfaceTemperaturePolicy;
}): number {
  const { latitudeAbs, maxLatitude, elevationMeters, cfg } = params;
  const latFactor = 1 - Math.max(0, Math.min(1, latitudeAbs / maxLatitude));
  const baseTemp = cfg.equator * latFactor + cfg.pole * (1 - latFactor);
  const elevationPenalty = ((elevationMeters - cfg.seaLevel) / 1000) * cfg.lapseRate;
  return baseTemp - elevationPenalty + cfg.bias;
}
