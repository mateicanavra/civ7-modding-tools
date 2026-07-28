import { createDomainSubdomainRouter } from "@swooper/mapgen-core/authoring";
import contract from "./contract.js";
import computeGeomorphicCycle from "./ops/compute-geomorphic-cycle/index.js";

/**
 * Canonically binds the Erosion contract to the geomorphic cycle that evolves routed relief and
 * substrate before complete island formation and discrete landform planning. The Morphology
 * router is the sole executable aggregate; step authoring continues to reference the contract.
 */
const erosion = createDomainSubdomainRouter(contract, {
  computeGeomorphicCycle,
});
export default erosion;
