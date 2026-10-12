type TemperatureZonePolicy = Readonly<{
  polarCutoff: number;
  tundraCutoff: number;
  tropicalColdMonthMeanMinC: number;
}>;

/**
 * Keeps annual cold-zone meaning while admitting persistent tropical warmth
 * from Hydrology's baseline coldest-month-like mean.
 */
export function temperatureZoneOf(
  value: number,
  coldestMonthMeanC: number,
  cfg: TemperatureZonePolicy
): "polar" | "cold" | "temperate" | "tropical" {
  if (value <= cfg.polarCutoff) return "polar";
  if (value <= cfg.tundraCutoff) return "cold";
  if (coldestMonthMeanC < cfg.tropicalColdMonthMeanMinC) return "temperate";
  return "tropical";
}
