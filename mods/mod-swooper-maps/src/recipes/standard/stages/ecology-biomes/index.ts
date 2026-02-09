import { Type, createStage, type Static } from "@swooper/mapgen-core/authoring";
import { steps } from "../ecology/steps/index.js";

const publicSchema = Type.Object(
  {
    biomes: Type.Optional(steps.biomes.contract.schema),
  },
  { additionalProperties: false }
);

type EcologyBiomesStageConfig = Static<typeof publicSchema>;

export default createStage({
  id: "ecology-biomes",
  knobsSchema: Type.Object({}, { additionalProperties: false }),
  public: publicSchema,
  compile: ({ env, knobs, config }: { env: unknown; knobs: unknown; config: EcologyBiomesStageConfig }) => {
    void env;
    void knobs;
    return { biomes: config.biomes };
  },
  steps: [steps.biomes],
} as const);

