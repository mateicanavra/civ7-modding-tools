import { createStage, Type } from "@swooper/mapgen-core/authoring";
import { orderStandardStageSteps } from "../../../contract-manifest.js";
import { LandmassPlatesStep } from "./steps/landmass-plates/step.js";
import { RuggedCoastsStep } from "./steps/rugged-coasts/step.js";

export type MorphologySeaLevelKnob = "land-heavy" | "earthlike" | "water-heavy";

export type MorphologyCoastRuggednessKnob = "smooth" | "normal" | "rugged";

const MorphologySeaLevelKnobSchema = Type.Union(
  [Type.Literal("land-heavy"), Type.Literal("earthlike"), Type.Literal("water-heavy")],
  {
    default: "earthlike",
    description:
      "Controls map water coverage posture (land-heavy/earthlike/water-heavy) by applying a deterministic delta to hypsometry targets.",
  }
);

const MorphologyCoastRuggednessKnobSchema = Type.Union(
  [Type.Literal("smooth"), Type.Literal("normal"), Type.Literal("rugged")],
  {
    default: "normal",
    description:
      "Controls coastline shape posture (smooth/normal/rugged) by applying deterministic multipliers over bay/fjord carving parameters.",
  }
);

const knobsSchema = Type.Object(
  {
    seaLevel: MorphologySeaLevelKnobSchema,
    coastRuggedness: MorphologyCoastRuggednessKnobSchema,
  },
  {
    additionalProperties: false,
    description:
      "Morphology-coasts controls for sea level and coast ruggedness applied as deterministic transforms.",
  }
);

/** Orders landmass construction before rugged-coast reconciliation. */
export default createStage({
  id: "morphology-coasts",
  knobsSchema,
  steps: orderStandardStageSteps("morphology-coasts", {
    "landmass-plates": LandmassPlatesStep,
    "rugged-coasts": RuggedCoastsStep,
  }),
} as const);
