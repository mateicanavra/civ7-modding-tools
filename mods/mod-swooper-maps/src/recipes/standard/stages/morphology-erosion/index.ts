import { Type, createStage, type Static } from "@swooper/mapgen-core/authoring";
import { geomorphology } from "./steps/index.js";
import { MorphologyErosionKnobSchema } from "@mapgen/domain/morphology/shared/knobs.js";

/**
 * Advanced Morphology-erosion step config baseline.
 */
const publicSchema = Type.Object(
  {
    advanced: Type.Optional(
      Type.Object(
        {
          geomorphology: Type.Optional(geomorphology.contract.schema),
        },
        {
          additionalProperties: false,
          description: "Advanced Morphology-erosion step config baseline.",
        }
      )
    ),
  },
  { additionalProperties: false }
);

type MorphologyErosionStageConfig = Static<typeof publicSchema>;

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
  public: publicSchema,
  compile: ({ config }: { config: MorphologyErosionStageConfig }) => (config.advanced ? config.advanced : {}),
  steps: [geomorphology],
} as const);
