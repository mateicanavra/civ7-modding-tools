import { type Static, Type } from "@swooper/mapgen-core/authoring/contracts";

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
 * - Scales orogeny INTENSITY (convergent uplift + subduction volcanism), applied
 *   AFTER boundary-regime classification. Higher activity = more vigorous mountain
 *   building and arc volcanism. Because regime topology is fixed, the lever is
 *   smooth and monotonic — it never relocates where land forms.
 *
 * Stage scope:
 * - Used by `foundation-tectonics` (the `tectonics` step injects it into the
 *   per-era `computeEraTectonicFields` emission as `orogenyActivityGain`).
 *
 * Description:
 * - Plate activity scalar in [0..1], mapped to an orogeny-intensity multiplier
 *   (0.0 -> 0.8, 0.5 -> 1.0, 1.0 -> 1.2) on convergent uplift + subduction volcanism.
 */
export const FoundationPlateActivityKnobSchema = Type.Number({
  default: 0.5,
  minimum: 0,
  maximum: 1,
  description:
    "Plate activity scalar in [0..1]. Scales orogeny intensity (convergent uplift + subduction volcanism) post regime-classification in foundation-tectonics; 0.5 is neutral. Projection materializes the resulting tectonic truth faithfully.",
});

export type FoundationPlateActivityKnob = Static<typeof FoundationPlateActivityKnobSchema>;
