import { createOp } from "@swooper/mapgen-core/authoring";
import AccumulateDischargeContract from "./contract.js";
import { topologicalRunoffStrategy } from "./strategies/index.js";

const accumulateDischarge = createOp(AccumulateDischargeContract, {
  strategies: { "topological-runoff": topologicalRunoffStrategy },
});

export type * from "./contract.js";
export type * from "./types.js";

export default accumulateDischarge;
