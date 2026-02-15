import { Type, createStage } from "@swooper/mapgen-core/authoring";
import { steps } from "../ecology/steps/index.js";

export default createStage({
  id: "ecology-biomes",
  knobsSchema: Type.Object({}),
  steps: [steps.biomes],
} as const);
