import { Type, createStage } from "@swooper/mapgen-core/authoring";
import { landmassPlates, ruggedCoasts } from "./steps/index.js";
import {
  MorphologyCoastRuggednessKnobSchema,
  MorphologySeaLevelKnobSchema,
  MorphologyShelfWidthKnobSchema,
} from "@mapgen/domain/morphology/shared/knobs.js";

/**
 * Morphology-coasts knobs (seaLevel/coastRuggedness/shelfWidth).
 * Knobs apply after defaulted step config as deterministic transforms.
 */
const knobsSchema = Type.Object(
  {
    seaLevel: Type.Optional(MorphologySeaLevelKnobSchema),
    coastRuggedness: Type.Optional(MorphologyCoastRuggednessKnobSchema),
    shelfWidth: Type.Optional(MorphologyShelfWidthKnobSchema),
  },
  {
    description:
      "Morphology-coasts knobs (seaLevel/coastRuggedness/shelfWidth). Knobs apply after defaulted step config as deterministic transforms.",
  }
);

export default createStage({
  id: "morphology-coasts",
  knobsSchema,
  steps: [landmassPlates, ruggedCoasts],
} as const);
