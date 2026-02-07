import { Type, type Static } from "@swooper/mapgen-core/authoring";

/**
 * Foundation plate count knob (semantic intent).
 *
 * Meaning:
 * - Sets the authored plate count target (scales to runtime map size downstream).
 *
 * Stage scope:
 * - Used by `foundation` mesh + plate graph steps.
 *
 * Description:
 * - Plate count target (integer >= 2). Used as the authored baseline for plate discretization.
 */
export const FoundationPlateCountKnobSchema = Type.Integer({
  minimum: 2,
  maximum: 256,
  description:
    "Plate count target (integer >= 2). Used as the authored baseline for plate discretization.",
});

export type FoundationPlateCountKnob = Static<typeof FoundationPlateCountKnobSchema>;

/**
 * Foundation plate activity knob (semantic intent).
 *
 * Meaning:
 * - Scales kinematics + boundary influence posture for projected plate driver fields.
 *
 * Stage scope:
 * - Used by `foundation` projection step only.
 *
 * Description:
 * - Plate activity scalar in [0..1]. Applies as deterministic transforms over projection kinematics and boundary influence distance.
 */
export const FoundationPlateActivityKnobSchema = Type.Number({
  default: 0.5,
  minimum: 0,
  maximum: 1,
  description:
    "Plate activity scalar in [0..1]. Applies as deterministic transforms over projection kinematics and boundary influence distance.",
});

export type FoundationPlateActivityKnob = Static<typeof FoundationPlateActivityKnobSchema>;
