import { Type, createStage, type Static } from "@swooper/mapgen-core/authoring";
import { steps } from "../ecology/steps/index.js";

const publicSchema = Type.Object(
  {
    pedology: Type.Optional(steps.pedology.contract.schema),
    resourceBasins: Type.Optional(steps.resourceBasins.contract.schema),
  },
  { additionalProperties: false }
);

type EcologyPedologyStageConfig = Static<typeof publicSchema>;

export default createStage({
  id: "ecology-pedology",
  knobsSchema: Type.Object({}, { additionalProperties: false }),
  public: publicSchema,
  compile: ({ env, knobs, config }: { env: unknown; knobs: unknown; config: EcologyPedologyStageConfig }) => {
    void env;
    void knobs;
    return {
      pedology: config.pedology,
      "resource-basins": config.resourceBasins,
    };
  },
  steps: [steps.pedology, steps.resourceBasins],
} as const);

