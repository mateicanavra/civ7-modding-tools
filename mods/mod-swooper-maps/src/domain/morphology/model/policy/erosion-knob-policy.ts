export type MorphologyErosionPosture = "low" | "normal" | "high";

export const MORPHOLOGY_EROSION_RATE_MULTIPLIER: Readonly<
  Record<MorphologyErosionPosture, number>
> = {
  low: 0.75,
  normal: 1.0,
  high: 1.35,
};
