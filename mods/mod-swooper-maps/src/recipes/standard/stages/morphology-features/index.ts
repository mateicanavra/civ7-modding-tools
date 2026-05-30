import { Type, createStage } from "@swooper/mapgen-core/authoring";
import { islands, landmasses, mountains, volcanoes } from "./steps/index.js";
import {
  MorphologyOrogenyKnobSchema,
  MorphologyVolcanismKnobSchema,
} from "@mapgen/domain/morphology/config.js";

/**
 * Morphology-features owns landform intent before map projection. Volcanism
 * tunes volcano intent; orogeny tunes ridge/foothill intent before
 * map-morphology stamps terrain.
 */
const knobsSchema = Type.Object(
  {
    orogeny: Type.Optional(MorphologyOrogenyKnobSchema),
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
  steps: [islands, mountains, volcanoes, landmasses],
} as const);
