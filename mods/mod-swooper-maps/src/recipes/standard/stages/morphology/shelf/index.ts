import { createStage, Type } from "@swooper/mapgen-core/authoring";
import { orderStandardStageSteps } from "../../../contract-manifest.js";
import { ComputeShelfStep } from "./steps/compute-shelf/step.js";

export type MorphologyShelfWidthKnob = "narrow" | "normal" | "wide";

const MorphologyShelfWidthKnobSchema = Type.Union(
  [Type.Literal("narrow"), Type.Literal("normal"), Type.Literal("wide")],
  {
    default: "normal",
    description:
      "Controls coastal shelf width posture (narrow/normal/wide) by applying deterministic multipliers over shelf classifier distance caps.",
  }
);

/**
 * Morphology-shelf computes the continental shelf AFTER islands/mountains, so the
 * shelf and the post-island coastline reflect final land. The shelfWidth knob lives
 * here (it drives the cap-free break-depth scale); coast ruggedness stays in
 * morphology-coasts with the carving step.
 */
const knobsSchema = Type.Object(
  {
    shelfWidth: MorphologyShelfWidthKnobSchema,
  },
  {
    additionalProperties: false,
    description:
      "Morphology-shelf control for shelf width, applied as a deterministic break-depth transform.",
  }
);

/**
 * Runs the post-feature physical-break classifier so shelves and coastline
 * metrics reflect the final island-bearing landmask.
 */
export default createStage({
  id: "morphology-shelf",
  knobsSchema,
  steps: orderStandardStageSteps("morphology-shelf", {
    "compute-shelf": ComputeShelfStep,
  }),
} as const);
