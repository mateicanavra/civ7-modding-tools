import { createOp } from "@swooper/mapgen-core/authoring";
import PlanVegetationContract from "./contract.js";
import { defaultStrategy } from "./strategies/index.js";

const planVegetation = createOp(PlanVegetationContract, {
  strategies: {
    default: defaultStrategy,
  },
});

export type * from "./contract.js";
export type * from "./types.js";

export default planVegetation;

