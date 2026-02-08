import { createOp } from "@swooper/mapgen-core/authoring";
import PlanReefEmbellishmentsReefContract from "./contract.js";
import { defaultStrategy } from "./strategies/index.js";

const planReefEmbellishmentsReef = createOp(PlanReefEmbellishmentsReefContract, {
  strategies: {
    default: defaultStrategy,
  },
});

export type * from "./contract.js";
export type * from "./types.js";

export default planReefEmbellishmentsReef;
