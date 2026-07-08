import { createStage, Type } from "@swooper/mapgen-core/authoring";
import { orderStandardStageSteps } from "../../contract-manifest.js";
import {
  compileFoundationOrogenyPublicConfig,
  FoundationOrogenyPublicSchema,
} from "../foundation-public-config.js";
import { crustEvolution } from "./steps/index.js";

const FoundationContinentalAbundanceKnobSchema = Type.Number({
  minimum: 0,
  maximum: 1,
  description:
    "Continental abundance scalar in [0..1]. Couples survival-maturity (down) + breakup-resistance (up): 0.5 = earthlike, →1 pangaea, →0 archipelago. foundation-orogeny.",
});

const FoundationContinentalReliefKnobSchema = Type.Number({
  minimum: 0,
  maximum: 1,
  description:
    "Continental relief scalar in [0..1]. Couples freeboard (up) + shelf/basin depth (up) + abyssal depth (up): 0.5 = earthlike, →1 tall continents/deep shelves/deep ocean, →0 low/shallow. foundation-orogeny.",
});

export default createStage({
  id: "foundation-orogeny",
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
  public: FoundationOrogenyPublicSchema,
  compile: ({ config }: { config: Record<string, unknown> }) =>
    compileFoundationOrogenyPublicConfig(config),
  steps: orderStandardStageSteps("foundation-orogeny", {
    "crust-evolution": crustEvolution,
  }),
} as const);
