export type MorphologySeaLevelPosture = "land-heavy" | "earthlike" | "water-heavy";

export type MorphologyCoastRuggednessPosture = "smooth" | "normal" | "rugged";

export const MORPHOLOGY_SEA_LEVEL_TARGET_WATER_PERCENT_DELTA: Readonly<
  Record<MorphologySeaLevelPosture, number>
> = {
  "land-heavy": -7,
  earthlike: 0,
  "water-heavy": 15,
};

export const MORPHOLOGY_COAST_RUGGEDNESS_MULTIPLIER: Readonly<
  Record<MorphologyCoastRuggednessPosture, number>
> = {
  smooth: 0.65,
  normal: 1.0,
  rugged: 1.4,
};
