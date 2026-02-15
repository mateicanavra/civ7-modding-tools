import { Type, createStage } from "@swooper/mapgen-core/authoring";
import { steps } from "./steps/index.js";

export default createStage({
  id: "ecology-features-score",
  knobsSchema: Type.Object({}),
  steps: [steps.scoreLayers],
} as const);
