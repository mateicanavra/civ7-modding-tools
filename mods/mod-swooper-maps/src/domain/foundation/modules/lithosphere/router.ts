import { createDomainSubdomainRouter } from "@swooper/mapgen-core/authoring";

import contract from "./contract.js";
import computeCrust from "./ops/compute-crust/index.js";
import computePlateGraph from "./ops/compute-plate-graph/index.js";

/**
 * Canonically binds the Lithosphere contract to initial-crust and plate-graph construction, which
 * establishes the state evolved by tectonic history. The Foundation router is the sole executable
 * aggregate; step authoring continues to reference the contract.
 */
const lithosphere = createDomainSubdomainRouter(contract, {
  computeCrust,
  computePlateGraph,
});

export default lithosphere;
