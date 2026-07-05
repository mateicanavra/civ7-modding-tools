export type MorphologyShelfWidthPosture = "narrow" | "normal" | "wide";

export const MORPHOLOGY_SHELF_WIDTH_MULTIPLIER: Readonly<
  Record<MorphologyShelfWidthPosture, number>
> = {
  narrow: 0.75,
  normal: 1.0,
  wide: 1.25,
};
