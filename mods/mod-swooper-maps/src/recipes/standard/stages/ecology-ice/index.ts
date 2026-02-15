import { Type, createStage } from "@swooper/mapgen-core/authoring";
import { steps } from "./steps/index.js";

export default createStage({
  id: "ecology-ice",
  knobsSchema: Type.Object({}),
  steps: [steps.planIce],
} as const);
