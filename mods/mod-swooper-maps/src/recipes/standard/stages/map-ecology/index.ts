import { Type, createStage } from "@swooper/mapgen-core/authoring";
import { steps } from "./steps/index.js";

export default createStage({
  id: "map-ecology",
  knobsSchema: Type.Object({}),
  steps: [steps.plotBiomes, steps.featuresApply, steps.plotEffects],
} as const);
