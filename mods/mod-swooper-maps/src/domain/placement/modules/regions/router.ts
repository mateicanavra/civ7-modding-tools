import { createDomainSubdomainRouter } from "@swooper/mapgen-core/authoring";
import contract from "./contract.js";
import projectLandmassRegions from "./ops/project-landmass-regions/index.js";

/**
 * Canonically binds the Regions contract to connected-landmass classification into gameplay
 * slots, which start planning consumes. The Placement router is the sole executable aggregate;
 * step authoring continues to reference the contract.
 */
const regions = createDomainSubdomainRouter(contract, {
  projectLandmassRegions,
});

export default regions;
