import { createOp } from "@swooper/mapgen-core/authoring";
import PlanVegetationContract from "./contract.js";
import { habitatConfidenceStrategy } from "./strategies/index.js";

const planVegetation = createOp(PlanVegetationContract, {
  strategies: {
    "habitat-confidence": habitatConfidenceStrategy,
  },
});

export type * from "./contract.js";
export type * from "./types.js";

export default planVegetation;
