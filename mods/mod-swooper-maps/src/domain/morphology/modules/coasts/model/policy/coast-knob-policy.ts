export type MorphologySeaLevelPosture = "land-heavy" | "earthlike" | "water-heavy";

export type MorphologyCoastRuggednessPosture = "smooth" | "normal" | "rugged";

/** Converts the sea-level posture into the water-coverage adjustment consumed by sea-level solving. */
export const MORPHOLOGY_SEA_LEVEL_TARGET_WATER_PERCENT_DELTA: Readonly<
  Record<MorphologySeaLevelPosture, number>
> = {
  "land-heavy": -7,
  earthlike: 0,
  "water-heavy": 15,
};

/** Scales authored coastline-carving strength without changing the underlying ruggedness model. */
export const MORPHOLOGY_COAST_RUGGEDNESS_MULTIPLIER: Readonly<
  Record<MorphologyCoastRuggednessPosture, number>
> = {
  smooth: 0.65,
  normal: 1.0,
  rugged: 1.4,
};
