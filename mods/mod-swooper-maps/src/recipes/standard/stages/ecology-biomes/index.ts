import { Type, createStage } from "@swooper/mapgen-core/authoring";
import { steps } from "../ecology/steps/index.js";

export default createStage({
  id: "ecology-biomes",
  knobsSchema: Type.Object({}),
  public: Type.Object({
    biomes: Type.Optional(steps.biomes.contract.schema),
  }),
  compile: ({ config }) => ({ biomes: config.biomes }),
  steps: [steps.biomes],
} as const);
