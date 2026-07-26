export type MorphologySeaLevelPosture = "land-heavy" | "earthlike" | "water-heavy";

/** Converts the sea-level posture into the water-coverage adjustment consumed by sea-level solving. */
export const MORPHOLOGY_SEA_LEVEL_TARGET_WATER_PERCENT_DELTA: Readonly<
  Record<MorphologySeaLevelPosture, number>
> = {
  "land-heavy": -7,
  earthlike: 0,
  "water-heavy": 15,
};
