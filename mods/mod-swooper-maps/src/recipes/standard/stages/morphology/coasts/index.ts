import { createStage, Type } from "@swooper/mapgen-core/authoring";
import { orderStandardStageSteps } from "../../../contract-manifest.js";
import { CoastlineEvidenceStep } from "./steps/coastline-evidence/step.js";
import { LandmassPlatesStep } from "./steps/landmass-plates/step.js";

export type MorphologySeaLevelKnob = "land-heavy" | "earthlike" | "water-heavy";

const MorphologySeaLevelKnobSchema = Type.Union(
  [Type.Literal("land-heavy"), Type.Literal("earthlike"), Type.Literal("water-heavy")],
  {
    default: "earthlike",
    description:
      "Controls map water coverage posture (land-heavy/earthlike/water-heavy) by applying a deterministic delta to hypsometry targets.",
  }
);

const knobsSchema = Type.Object(
  {
    seaLevel: MorphologySeaLevelKnobSchema,
  },
  {
    additionalProperties: false,
    description: "Morphology-coasts control for the authored sea-level posture.",
  }
);

/** Orders landmass construction before base-coastline evidence derivation. */
export default createStage({
  id: "morphology-coasts",
  knobsSchema,
  steps: orderStandardStageSteps("morphology-coasts", {
    "landmass-plates": LandmassPlatesStep,
    "coastline-evidence": CoastlineEvidenceStep,
  }),
} as const);
