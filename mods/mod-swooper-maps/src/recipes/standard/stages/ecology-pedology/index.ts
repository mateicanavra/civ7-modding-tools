import { Type, createStage } from "@swooper/mapgen-core/authoring";
import { steps } from "../ecology/steps/index.js";

export default createStage({
  id: "ecology-pedology",
  knobsSchema: Type.Object({}),
  public: Type.Object({
    pedology: Type.Optional(steps.pedology.contract.schema),
    resourceBasins: Type.Optional(steps.resourceBasins.contract.schema),
  }),
  compile: ({ config }) => ({
    pedology: config.pedology,
    "resource-basins": config.resourceBasins,
  }),
  steps: [steps.pedology, steps.resourceBasins],
} as const);
