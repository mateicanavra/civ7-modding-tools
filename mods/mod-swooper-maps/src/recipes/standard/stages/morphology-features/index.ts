import { Type, createStage, type Static } from "@swooper/mapgen-core/authoring";
import { islands, landmasses, volcanoes } from "./steps/index.js";
import { MorphologyVolcanismKnobSchema } from "@mapgen/domain/morphology/shared/knobs.js";

/**
 * Advanced Morphology-features step config baseline.
 */
const publicSchema = Type.Object(
  {
    advanced: Type.Optional(
      Type.Object(
        {
          islands: Type.Optional(islands.contract.schema),
          volcanoes: Type.Optional(volcanoes.contract.schema),
          landmasses: Type.Optional(landmasses.contract.schema),
        },
        {
          additionalProperties: false,
          description: "Advanced Morphology-features step config baseline.",
        }
      )
    ),
  },
  { additionalProperties: false }
);

type MorphologyFeaturesStageConfig = Static<typeof publicSchema>;

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
  public: publicSchema,
  compile: ({ config }: { config: MorphologyFeaturesStageConfig }) => (config.advanced ? config.advanced : {}),
  steps: [islands, volcanoes, landmasses],
} as const);
