import {
  FoundationContinentalAbundanceKnobSchema,
  FoundationContinentalReliefKnobSchema,
} from "@mapgen/domain/foundation/config.js";
import { createStage, Type } from "@swooper/mapgen-core/authoring";
import { orderStandardStageSteps } from "../../contract-manifest.js";
import { crustEvolution } from "./steps/index.js";

/** Foundation / Orogeny — final crust from initial crust + tectonic history (the merge stage). */
export default createStage({
  id: "foundation-orogeny",
  // High-level coupled crust-character levers. Each expresses one author intent across two coupled
  // compute-crust-evolution properties (abundance → survival + breakup-resistance; relief → freeboard
  // + shelf depth). 0.5 = earthlike. Optional: unset ⇒ the raw op config (surfaced through the step)
  // is left untouched; set ⇒ the lever overrides its coupled pair. See domain/foundation/shared/knobs.ts.
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
