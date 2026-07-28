export type HydrologyDrynessKnob = "wet" | "mix" | "dry";
export type HydrologyTemperatureKnob = "cold" | "temperate" | "hot";
export type HydrologySeasonalityKnob = "low" | "normal" | "high";
export type HydrologyOceanCouplingKnob = "off" | "simple" | "earthlike";

/**
 * Multiplier through which the public dryness knob retunes evaporation, rainfall, and local
 * moisture bonuses while preserving each selected strategy's authored baseline.
 */
export const HYDROLOGY_DRYNESS_WETNESS_SCALE = {
  wet: 1.15,
  mix: 1.0,
  dry: 0.85,
} as const satisfies Record<HydrologyDrynessKnob, number>;

/**
 * Reference surface temperatures used to derive cold/hot deltas from the temperate recipe.
 * Normalization applies the delta across thermal baselines and equator-to-pole contrast.
 */
export const HYDROLOGY_TEMPERATURE_BASE_TEMPERATURE_C = {
  cold: 4,
  temperate: 9,
  hot: 14,
} as const satisfies Record<HydrologyTemperatureKnob, number>;

/**
 * Latitude-strategy jet counts whose delta from `normal` controls seasonal circulation complexity.
 */
export const HYDROLOGY_SEASONALITY_WIND_JET_STREAKS = {
  low: 2,
  normal: 3,
  high: 4,
} as const satisfies Record<HydrologySeasonalityKnob, number>;

/**
 * Relative wind-variance calibration used to scale either latitude noise or geostrophic pressure
 * variability without replacing the selected strategy's base configuration.
 */
export const HYDROLOGY_SEASONALITY_WIND_VARIANCE = {
  low: 0.45,
  normal: 0.6,
  high: 0.75,
} as const satisfies Record<HydrologySeasonalityKnob, number>;

/** Relative precipitation-noise amplitudes used to texture low, normal, and high seasonality. */
export const HYDROLOGY_SEASONALITY_PRECIP_NOISE_AMPLITUDE = {
  low: 5,
  normal: 6,
  high: 8,
} as const satisfies Record<HydrologySeasonalityKnob, number>;

/**
 * Seasonal-mode and axial-tilt defaults published into the normalized baseline climate config.
 * Mode count is intentionally limited to two or four so downstream seasonal aggregation stays
 * compatible with its fixed sampling model.
 */
export const HYDROLOGY_SEASONALITY_DEFAULTS = {
  low: { modeCount: 2 as const, axialTiltDeg: 12 },
  normal: { modeCount: 2 as const, axialTiltDeg: 18 },
  high: { modeCount: 4 as const, axialTiltDeg: 23.44 },
} as const satisfies Record<
  HydrologySeasonalityKnob,
  Readonly<{ modeCount: 2 | 4; axialTiltDeg: number }>
>;

/**
 * Wind-strength calibration by ocean-coupling mode, applied as a ratio to the Earthlike baseline.
 */
export const HYDROLOGY_OCEAN_COUPLING_WIND_JET_STRENGTH = {
  off: 0.85,
  simple: 1.0,
  earthlike: 1.05,
} as const satisfies Record<HydrologyOceanCouplingKnob, number>;

/**
 * Surface-current strength calibration by coupling mode; `off` suppresses current-driven effects.
 */
export const HYDROLOGY_OCEAN_COUPLING_CURRENT_STRENGTH = {
  off: 0,
  simple: 0.75,
  earthlike: 1.0,
} as const satisfies Record<HydrologyOceanCouplingKnob, number>;

/**
 * Moisture-solver iteration references whose delta from Earthlike shortens weaker coupling modes.
 */
export const HYDROLOGY_OCEAN_COUPLING_MOISTURE_TRANSPORT_ITERATIONS = {
  off: 18,
  simple: 24,
  earthlike: 28,
} as const satisfies Record<HydrologyOceanCouplingKnob, number>;

/**
 * Coastal-moisture reach references whose delta from Earthlike retunes precipitation strategy
 * radius without discarding map-specific configuration.
 */
export const HYDROLOGY_OCEAN_COUPLING_WATER_GRADIENT_RADIUS = {
  off: 4,
  simple: 5,
  earthlike: 6,
} as const satisfies Record<HydrologyOceanCouplingKnob, number>;

/**
 * Per-ring coastal rainfall references whose delta from Earthlike adjusts near-water wetness.
 */
export const HYDROLOGY_WATER_GRADIENT_PER_RING_BONUS_BASE = {
  off: 3,
  simple: 4,
  earthlike: 4,
} as const satisfies Record<HydrologyOceanCouplingKnob, number>;
