import { createStage, Type } from "@swooper/mapgen-core/authoring";
import { orderStandardStageSteps } from "../../../contract-manifest.js";
import { GeomorphologyStep } from "./steps/geomorphology/step.js";

/** Authored erosion posture applied to all geomorphic process rates. */
export type MorphologyErosionKnob = "low" | "normal" | "high";

const knobsSchema = Type.Object(
  {
    erosion: Type.Union([Type.Literal("low"), Type.Literal("normal"), Type.Literal("high")], {
      default: "normal",
      description:
        "Controls terrain erosion posture by applying one deterministic multiplier over geomorphology rates.",
    }),
  },
  {
    additionalProperties: false,
    description:
      "Morphology erosion controls applied over ordinary geomorphology operation configuration.",
  }
);

/**
 * Applies the authored geomorphic-cycle operation after routing and before final landform planning.
 */
export default createStage({
  id: "morphology-erosion",
  knobsSchema,
  steps: orderStandardStageSteps("morphology-erosion", {
    geomorphology: GeomorphologyStep,
  }),
} as const);
