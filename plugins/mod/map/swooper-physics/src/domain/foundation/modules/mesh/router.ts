import { createDomainSubdomainRouter } from "@swooper/mapgen-core/authoring";

import contract from "./contract.js";
import computeMesh from "./ops/compute-mesh/index.js";

/**
 * Canonically binds the Mesh contract to construction of Foundation's shared neighborhood
 * substrate. The Foundation router is the sole executable aggregate; step authoring continues to
 * reference the contract.
 */
const mesh = createDomainSubdomainRouter(contract, {
  computeMesh,
});

export default mesh;
