import { createDomainSubdomainRouter } from "@swooper/mapgen-core/authoring";

import contract from "./contract.js";
import computeMantleForcing from "./ops/compute-mantle-forcing/index.js";
import computeMantlePotential from "./ops/compute-mantle-potential/index.js";

/**
 * Canonically binds the Mantle contract to potential and forcing implementations that drive crust
 * initialization and tectonic motion. The Foundation router is the sole executable aggregate; step
 * authoring continues to reference the contract.
 */
const mantle = createDomainSubdomainRouter(contract, {
  computeMantlePotential,
  computeMantleForcing,
});

export default mantle;
