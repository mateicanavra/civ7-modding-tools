import { Type, createStage, type Static } from "@swooper/mapgen-core/authoring";
import { landmassPlates, ruggedCoasts } from "./steps/index.js";
import {
  MorphologyCoastRuggednessKnobSchema,
  MorphologySeaLevelKnobSchema,
  MorphologyShelfWidthKnobSchema,
} from "@mapgen/domain/morphology/shared/knobs.js";

/**
 * Advanced Morphology-coasts step config baseline. Knobs apply last as deterministic transforms over this baseline.
 */
const publicSchema = Type.Object(
  {
    advanced: Type.Optional(
      Type.Object(
        {
          "landmass-plates": Type.Optional(landmassPlates.contract.schema),
          "rugged-coasts": Type.Optional(ruggedCoasts.contract.schema),
        },
        {
          additionalProperties: false,
          description:
            "Advanced Morphology-coasts step config baseline. Knobs apply last as deterministic transforms over this baseline.",
        }
      )
    ),
  },
  { additionalProperties: false }
);

type MorphologyCoastsStageConfig = Static<typeof publicSchema>;

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
  public: publicSchema,
  compile: ({ config }: { config: MorphologyCoastsStageConfig }) => (config.advanced ? config.advanced : {}),
  steps: [landmassPlates, ruggedCoasts],
} as const);
