import { createOp } from "@swooper/mapgen-core/authoring";
import PlanFloodplainsContract from "./contract.js";
import { defaultStrategy } from "./strategies/default.js";

const planFloodplains = createOp(PlanFloodplainsContract, {
  strategies: {
    default: defaultStrategy,
  },
});

export default planFloodplains;
