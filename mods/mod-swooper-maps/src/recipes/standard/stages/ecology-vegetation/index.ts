import { Type, createStage } from "@swooper/mapgen-core/authoring";
import { steps } from "./steps/index.js";

export default createStage({
  id: "ecology-vegetation",
  knobsSchema: Type.Object({}),
  steps: [steps.planVegetation],
} as const);
