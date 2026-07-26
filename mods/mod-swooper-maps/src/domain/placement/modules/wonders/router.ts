import { createDomainSubdomainRouter } from "@swooper/mapgen-core/authoring";

import contract from "./contract.js";
import planNaturalWonders from "./ops/plan-natural-wonders/index.js";
import planWonders from "./ops/plan-wonders/index.js";

/** Executable Placement wonders branch used by wonder-planning recipe steps. */
const wonders = createDomainSubdomainRouter(contract, {
  planWonders,
  planNaturalWonders,
});

export default wonders;
