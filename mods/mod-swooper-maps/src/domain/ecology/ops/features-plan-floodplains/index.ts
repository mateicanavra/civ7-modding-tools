import { createOp } from "@swooper/mapgen-core/authoring";
import PlanFloodplainsContract from "./contract.js";
import { highestConfidenceStrategy } from "./strategies/highest-confidence.js";

const planFloodplains = createOp(PlanFloodplainsContract, {
  strategies: {
    "highest-confidence": highestConfidenceStrategy,
  },
});

export default planFloodplains;
