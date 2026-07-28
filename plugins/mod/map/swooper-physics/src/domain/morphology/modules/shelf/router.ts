import { createDomainSubdomainRouter } from "@swooper/mapgen-core/authoring";
import contract from "./contract.js";
import computeShelfMask from "./ops/compute-shelf-mask/index.js";

/**
 * Canonically binds the Shelf contract to post-island coastline and gradient-break shelf
 * derivation consumed by Hydrology and Ecology. The Morphology router is the sole executable
 * aggregate; step authoring continues to reference the contract.
 */
const shelf = createDomainSubdomainRouter(contract, {
  computeShelfMask,
});
export default shelf;
