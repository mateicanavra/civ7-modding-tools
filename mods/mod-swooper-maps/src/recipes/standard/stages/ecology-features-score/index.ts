import { Type, createStage } from "@swooper/mapgen-core/authoring";
import { steps } from "./steps/index.js";

export default createStage({
  id: "ecology-features-score",
  knobsSchema: Type.Object({}),
  public: Type.Object({
    scoreLayers: Type.Optional(steps.scoreLayers.contract.schema),
  }),
  compile: ({ config }) => ({ "score-layers": config.scoreLayers }),
  steps: [steps.scoreLayers],
} as const);
