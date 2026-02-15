export const RIFT_RESET_THRESHOLD_MIN = 1;
export const ARC_RESET_THRESHOLD_MIN = 1;
export const HOTSPOT_RESET_THRESHOLD_MIN = 1;

export const RIFT_RESET_THRESHOLD_FRAC_OF_MAX = 0.6;
export const ARC_RESET_THRESHOLD_FRAC_OF_MAX = 0.75;
export const HOTSPOT_RESET_THRESHOLD_FRAC_OF_MAX = 0.8;
export const ADVECTION_STEPS_PER_ERA = 6;

export const EVENT_TYPE = {
  convergenceSubduction: 1,
  convergenceCollision: 2,
  divergenceRift: 3,
  transformShear: 4,
  intraplateHotspot: 5,
} as const;

export const OROGENY_ERA_GAIN_MIN = 0.85;
export const OROGENY_ERA_GAIN_MAX = 1.15;

export const ERA_COUNT_MIN = 5;
export const ERA_COUNT_MAX = 8;
