import { createStage, Type } from "@swooper/mapgen-core/authoring";
import { orderStandardStageSteps } from "../../../contract-manifest.js";
import { GeomorphologyStep } from "./steps/geomorphology/step.js";

/** Authored erosion posture applied to initial hillslope diffusion. */
export type MorphologyErosionKnob = "low" | "normal" | "high";

const knobsSchema = Type.Object(
  {
    erosion: Type.Union([Type.Literal("low"), Type.Literal("normal"), Type.Literal("high")], {
      default: "normal",
      description:
        "Controls initial hillslope diffusion posture through one deterministic rate multiplier.",
    }),
  },
  {
    additionalProperties: false,
    description:
      "Morphology erosion controls applied over ordinary geomorphology operation configuration.",
  }
);

/**
 * Applies initial hillslope shaping before Landforms publishes initial topography.
 */
export default createStage({
  id: "morphology-erosion",
  knobsSchema,
  steps: orderStandardStageSteps("morphology-erosion", {
    geomorphology: GeomorphologyStep,
  }),
} as const);
