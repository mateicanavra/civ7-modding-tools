import { createStage, Type } from "@swooper/mapgen-core/authoring";
import { orderStandardStageSteps } from "../../contract-manifest.js";
import { crustEvolution } from "./steps/index.js";

const FoundationContinentalAbundanceKnobSchema = Type.Number({
  default: 0.5,
  minimum: 0,
  maximum: 1,
  description:
    "Continental abundance scalar in [0..1]. Couples survival-maturity (down) + breakup-resistance (up): 0.5 = earthlike, →1 pangaea, →0 archipelago. foundation-orogeny.",
});

const FoundationContinentalReliefKnobSchema = Type.Number({
  default: 0.5,
  minimum: 0,
  maximum: 1,
  description:
    "Continental relief scalar in [0..1]. Couples freeboard (up) + shelf/basin depth (up) + abyssal depth (up): 0.5 = earthlike, →1 tall continents/deep shelves/deep ocean, →0 low/shallow. foundation-orogeny.",
});

/** Foundation / Orogeny — final crust from initial crust + tectonic history (the merge stage). */
export default createStage({
  id: "foundation-orogeny",
  // High-level coupled crust-character levers. Each expresses one author intent across coupled
  // compute-crust-evolution properties (abundance → survival + breakup-resistance; relief → freeboard
  // + shelf depth + abyssal depth). 0.5 = earthlike. Optional: unset ⇒ the raw op config (surfaced)
  // is left untouched; set ⇒ the lever overrides its coupled pair.
  knobsSchema: Type.Object(
    {
      continentalAbundance: Type.Optional(FoundationContinentalAbundanceKnobSchema),
      continentalRelief: Type.Optional(FoundationContinentalReliefKnobSchema),
    },
    {
      additionalProperties: false,
      description:
        "Crust-character levers: continentalAbundance (land vs ocean) and continentalRelief (continent/shelf drama).",
    }
  ),
  steps: orderStandardStageSteps("foundation-orogeny", {
    "crust-evolution": crustEvolution,
  }),
} as const);
