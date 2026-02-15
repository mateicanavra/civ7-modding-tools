import { Type, createStage } from "@swooper/mapgen-core/authoring";
import { steps } from "./steps/index.js";

export default createStage({
  id: "ecology-reefs",
  knobsSchema: Type.Object({}),
  steps: [steps.planReefs],
} as const);
