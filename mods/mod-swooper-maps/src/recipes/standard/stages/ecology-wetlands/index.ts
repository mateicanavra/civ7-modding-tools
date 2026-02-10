import { Type, createStage } from "@swooper/mapgen-core/authoring";
import { steps } from "./steps/index.js";

export default createStage({
  id: "ecology-wetlands",
  knobsSchema: Type.Object({}),
  steps: [steps.planWetlands],
} as const);
