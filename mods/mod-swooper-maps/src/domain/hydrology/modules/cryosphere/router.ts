import { createDomainSubdomainRouter } from "@swooper/mapgen-core/authoring";

import contract from "./contract.js";
import applyAlbedoFeedback from "./ops/apply-albedo-feedback/index.js";
import computeCryosphereState from "./ops/compute-cryosphere-state/index.js";

/**
 * Canonically binds the Cryosphere contract to frozen-state classification and bounded albedo
 * feedback used during climate refinement. The Hydrology router is the sole executable aggregate;
 * step authoring continues to reference the contract.
 */
const cryosphere = createDomainSubdomainRouter(contract, {
  computeCryosphereState,
  applyAlbedoFeedback,
});

export default cryosphere;
