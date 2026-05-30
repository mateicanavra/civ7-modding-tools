import { Type, createStage } from "@swooper/mapgen-core/authoring";
import { lakes } from "./steps/index.js";

const knobsSchema = Type.Object(
  {},
  {
    description:
      "Map-hydrology knobs. Static water projection currently uses step-level config only.",
  }
);

export default createStage({
  id: "map-hydrology",
  knobsSchema,
  steps: [lakes],
} as const);
