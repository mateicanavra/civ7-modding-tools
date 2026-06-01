import { Type, createStage } from "@swooper/mapgen-core/authoring";
import { islands, landmasses, volcanoes } from "./steps/index.js";
import { MorphologyVolcanismKnobSchema } from "@mapgen/domain/morphology/shared/knobs.js";

/**
 * Morphology-features knobs (volcanism). Knobs apply after defaulted step config as deterministic transforms.
 */
const knobsSchema = Type.Object(
  {
    volcanism: Type.Optional(MorphologyVolcanismKnobSchema),
  },
  {
    description:
      "Morphology-features knobs (volcanism). Knobs apply after defaulted step config as deterministic transforms.",
  }
);

export default createStage({
  id: "morphology-features",
  knobsSchema,
  steps: [islands, volcanoes, landmasses],
} as const);
