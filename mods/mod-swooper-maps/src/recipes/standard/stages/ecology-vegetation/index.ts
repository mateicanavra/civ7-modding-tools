import { Type, createStage } from "@swooper/mapgen-core/authoring";
import { steps } from "../ecology/steps/index.js";

export default createStage({
  id: "ecology-vegetation",
  knobsSchema: Type.Object({}),
  steps: [steps.featuresPlan],
} as const);
