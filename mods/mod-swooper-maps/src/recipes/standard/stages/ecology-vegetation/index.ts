import { Type, createStage } from "@swooper/mapgen-core/authoring";
import { steps } from "../ecology/steps/index.js";

export default createStage({
  id: "ecology-vegetation",
  knobsSchema: Type.Object({}),
  public: Type.Object({
    featuresPlan: Type.Optional(steps.featuresPlan.contract.schema),
  }),
  compile: ({ config }) => ({ "features-plan": config.featuresPlan }),
  steps: [steps.featuresPlan],
} as const);
