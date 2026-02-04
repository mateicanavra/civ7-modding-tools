import { Type, type Static } from "@swooper/mapgen-core/authoring";

/**
 * Morphology sea level knob (semantic intent).
 *
 * Meaning:
 * - Sea level posture controlling global water coverage bias.
 *
 * Stage scope:
 * - Used by `morphology-coasts` stage only.
 *
 * Description:
 * - Sea level posture (land-heavy/earthlike/water-heavy). Applies as a deterministic delta to hypsometry targets (targetWaterPercent).
 */
export const MorphologySeaLevelKnobSchema = Type.Union(
  [Type.Literal("land-heavy"), Type.Literal("earthlike"), Type.Literal("water-heavy")],
  {
    default: "earthlike",
    description:
      "Sea level posture (land-heavy/earthlike/water-heavy). Applies as a deterministic delta to hypsometry targets (targetWaterPercent).",
  }
);

export type MorphologySeaLevelKnob = Static<typeof MorphologySeaLevelKnobSchema>;

/**
 * Morphology erosion knob (semantic intent).
 *
 * Meaning:
 * - Erosion strength posture controlling the overall intensity of geomorphic change.
 *
 * Stage scope:
 * - Used by `morphology-erosion` stage only.
 *
 * Description:
 * - Erosion posture (low/normal/high). Applies as a deterministic multiplier over geomorphology rates (no presence-gating).
 */
export const MorphologyErosionKnobSchema = Type.Union(
  [Type.Literal("low"), Type.Literal("normal"), Type.Literal("high")],
  {
    default: "normal",
    description:
      "Erosion posture (low/normal/high). Applies as a deterministic multiplier over geomorphology rates (no presence-gating).",
  }
);

export type MorphologyErosionKnob = Static<typeof MorphologyErosionKnobSchema>;

/**
 * Morphology coastline ruggedness knob (semantic intent).
 *
 * Meaning:
 * - Coastline carving posture for bays/fjords and plate-bias weights.
 *
 * Stage scope:
 * - Used by `morphology-coasts` stage only.
 *
 * Description:
 * - Coastline ruggedness posture (smooth/normal/rugged). Applies as deterministic multipliers over bay/fjord carving parameters.
 */
export const MorphologyCoastRuggednessKnobSchema = Type.Union(
  [Type.Literal("smooth"), Type.Literal("normal"), Type.Literal("rugged")],
  {
    default: "normal",
    description:
      "Coastline ruggedness posture (smooth/normal/rugged). Applies as deterministic multipliers over bay/fjord carving parameters.",
  }
);

export type MorphologyCoastRuggednessKnob = Static<typeof MorphologyCoastRuggednessKnobSchema>;

/**
 * Morphology shelf width knob (semantic intent).
 *
 * Meaning:
 * - Shelf width posture controlling how wide the shallow-water band can extend from shore.
 *
 * Stage scope:
 * - Used by `morphology-coasts` stage only.
 *
 * Description:
 * - Shelf width posture (narrow/normal/wide). Applies as deterministic multipliers over shelf classifier distance caps.
 */
export const MorphologyShelfWidthKnobSchema = Type.Union(
  [Type.Literal("narrow"), Type.Literal("normal"), Type.Literal("wide")],
  {
    default: "normal",
    description:
      "Shelf width posture (narrow/normal/wide). Applies as deterministic multipliers over shelf classifier distance caps.",
  }
);

export type MorphologyShelfWidthKnob = Static<typeof MorphologyShelfWidthKnobSchema>;

/**
 * Morphology volcanism knob (semantic intent).
 *
 * Meaning:
 * - Volcanism intensity posture controlling how frequently volcanoes are planned.
 *
 * Stage scope:
 * - Used by `morphology-features` stage only.
 *
 * Description:
 * - Volcanism posture (low/normal/high). Applies as deterministic transforms over volcano plan weights/density.
 */
export const MorphologyVolcanismKnobSchema = Type.Union(
  [Type.Literal("low"), Type.Literal("normal"), Type.Literal("high")],
  {
    default: "normal",
    description:
      "Volcanism posture (low/normal/high). Applies as deterministic transforms over volcano plan weights/density.",
  }
);

export type MorphologyVolcanismKnob = Static<typeof MorphologyVolcanismKnobSchema>;

/**
 * Morphology orogeny knob (semantic intent).
 *
 * Meaning:
 * - Orogeny posture controlling how strongly plate physics biases mountain planning.
 *
 * Stage scope:
 * - Used by `map-morphology` stage only.
 *
 * Description:
 * - Orogeny posture (low/normal/high). Applies as deterministic transforms over mountain planning thresholds/intensity.
 */
export const MorphologyOrogenyKnobSchema = Type.Union(
  [Type.Literal("low"), Type.Literal("normal"), Type.Literal("high")],
  {
    default: "normal",
    description:
      "Orogeny posture (low/normal/high). Applies as deterministic transforms over mountain planning thresholds/intensity.",
  }
);

export type MorphologyOrogenyKnob = Static<typeof MorphologyOrogenyKnobSchema>;
