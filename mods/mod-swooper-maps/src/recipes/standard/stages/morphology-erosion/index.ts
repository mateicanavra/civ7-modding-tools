import { Type, createStage } from "@swooper/mapgen-core/authoring";
import { geomorphology } from "./steps/index.js";
import { MorphologyErosionKnobSchema } from "@mapgen/domain/morphology/shared/knobs.js";

/**
 * Morphology-erosion knobs (erosion). Knobs apply after defaulted step config as deterministic transforms.
 */
const knobsSchema = Type.Object(
  {
    erosion: Type.Optional(MorphologyErosionKnobSchema),
  },
  {
    description:
      "Morphology-erosion knobs (erosion). Knobs apply after defaulted step config as deterministic transforms.",
  }
);

export default createStage({
  id: "morphology-erosion",
  knobsSchema,
  steps: [geomorphology],
} as const);
