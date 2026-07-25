import { createDomainSubdomainRouter } from "@swooper/mapgen-core/authoring";

import contract from "./contract.js";
import computeCrustEvolution from "./ops/compute-crust-evolution/index.js";

/** Executable Foundation orogeny branch. */
const orogeny = createDomainSubdomainRouter(contract, {
  computeCrustEvolution,
});

export default orogeny;
