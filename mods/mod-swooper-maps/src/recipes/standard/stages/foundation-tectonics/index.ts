import { createStage, Type } from "@swooper/mapgen-core/authoring";
import { orderStandardStageSteps } from "../../contract-manifest.js";
import {
  compileFoundationTectonicsPublicConfig,
  FoundationTectonicsPublicSchema,
} from "../foundation-public-config.js";
import { PlateMotionStep } from "./steps/plate-motion/step.js";
import { TectonicsStep } from "./steps/tectonics/step.js";

const FoundationPlateActivityKnobSchema = Type.Number({
  default: 0.5,
  minimum: 0,
  maximum: 1,
  description:
    "Plate activity scalar in [0..1]. Scales orogeny intensity (convergent uplift + subduction volcanism) post regime-classification in foundation-tectonics; 0.5 is neutral. Projection materializes the resulting tectonic truth faithfully.",
});

/** Foundation / Tectonics — plate kinematics + boundary regimes, multi-era history, provenance. */
export default createStage({
  id: "foundation-tectonics",
  knobsSchema: Type.Object(
    { plateActivity: FoundationPlateActivityKnobSchema },
    {
      additionalProperties: false,
      description:
        "Tectonics lever: plateActivity (scales orogeny intensity — convergent uplift + subduction volcanism — after regime classification, so the lever is smooth and never relocates land).",
    }
  ),
  public: FoundationTectonicsPublicSchema,
  compile: ({ config }: { config: Record<string, unknown> }) =>
    compileFoundationTectonicsPublicConfig(config),
  steps: orderStandardStageSteps("foundation-tectonics", {
    "plate-motion": PlateMotionStep,
    tectonics: TectonicsStep,
  }),
} as const);
