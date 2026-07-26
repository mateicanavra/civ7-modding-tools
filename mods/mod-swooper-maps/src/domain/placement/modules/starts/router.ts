import { createDomainSubdomainRouter } from "@swooper/mapgen-core/authoring";

import contract from "./contract.js";
import planStarts from "./ops/plan-starts/index.js";

/** Executable Placement starts branch used by start-assignment recipe steps. */
const starts = createDomainSubdomainRouter(contract, {
  planStarts,
});

export default starts;
