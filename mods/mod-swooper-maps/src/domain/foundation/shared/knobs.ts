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

/**
 * Continental abundance knob (semantic intent) — a COUPLED author lever.
 *
 * Meaning:
 * - "How much of the world is continental." One physical intent — buoyant, abundant continental
 *   crust both survives foundering AND resists rifting — so the lever drives two coupled
 *   `compute-crust-evolution` properties together:
 *     • `continentalSurvivalMaturity` (DOWN as abundance rises — marginal crust survives), and
 *     • `hyperextensionBreakupBase`   (UP   as abundance rises — coherent crust resists breakup).
 * - 0.5 reproduces the earthlike op defaults; → 1 trends pangaea, → 0 trends archipelago/waterworld.
 *
 * Stage scope:
 * - `foundation-orogeny` (the `crust-evolution` step's `normalize` injects the resolved pair into the
 *   `computeCrustEvolution` config). Optional: when unset, the raw op config (abundance properties)
 *   is left untouched; when set, the lever overrides that coupled pair.
 */
export const FoundationContinentalAbundanceKnobSchema = Type.Number({
  default: 0.5,
  minimum: 0,
  maximum: 1,
  description:
    "Continental abundance scalar in [0..1]. Couples survival-maturity (down) + breakup-resistance (up): 0.5 = earthlike, →1 pangaea, →0 archipelago. foundation-orogeny.",
});

export type FoundationContinentalAbundanceKnob = Static<
  typeof FoundationContinentalAbundanceKnobSchema
>;

/**
 * Continental relief knob (semantic intent) — a COUPLED author lever.
 *
 * Meaning:
 * - "How dramatic the continent↔ocean transition stands." One physical intent — stronger isostatic
 *   differentiation makes continents ride higher AND their thinned margins subside deeper — so the
 *   lever drives two coupled `compute-crust-evolution` properties together:
 *     • `continentalFreeboard`    (UP as relief rises — continents stand higher), and
 *     • `thinningThicknessLoss`   (UP as relief rises — margins/basins subside deeper).
 * - 0.5 reproduces the earthlike op defaults; → 1 tall continents + deep shelves, → 0 low + shallow.
 *
 * Stage scope:
 * - `foundation-orogeny` (the `crust-evolution` step's `normalize` injects the resolved pair into the
 *   `computeCrustEvolution` config). Optional: when unset, the raw op config (relief properties) is
 *   left untouched; when set, the lever overrides that coupled pair.
 */
export const FoundationContinentalReliefKnobSchema = Type.Number({
  default: 0.5,
  minimum: 0,
  maximum: 1,
  description:
    "Continental relief scalar in [0..1]. Couples freeboard (up) + shelf/basin depth (up): 0.5 = earthlike, →1 tall continents/deep shelves, →0 low/shallow. foundation-orogeny.",
});

export type FoundationContinentalReliefKnob = Static<typeof FoundationContinentalReliefKnobSchema>;
