import { Type, createStage } from "@swooper/mapgen-core/authoring";
import { steps } from "../ecology/steps/index.js";

export default createStage({
  id: "ecology-pedology",
  knobsSchema: Type.Object({}),
  steps: [steps.pedology, steps.resourceBasins],
} as const);
