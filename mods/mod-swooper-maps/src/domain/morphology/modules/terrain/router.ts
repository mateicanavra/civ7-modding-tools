import { createDomainSubdomainRouter } from "@swooper/mapgen-core/authoring";
import contract from "./contract.js";
import computeBaseTopography from "./ops/compute-base-topography/index.js";
import computeBeltDrivers from "./ops/compute-belt-drivers/index.js";
import computeLandmask from "./ops/compute-landmask/index.js";
import computeSeaLevel from "./ops/compute-sea-level/index.js";
import computeSubstrate from "./ops/compute-substrate/index.js";

/**
 * Canonically binds the Terrain contract to belt-driver, base-relief, sea-level, landmask, and
 * substrate implementations that seed coastline carving. The Morphology router is the sole
 * executable aggregate; step authoring continues to reference the contract.
 */
const terrain = createDomainSubdomainRouter(contract, {
  computeBeltDrivers,
  computeBaseTopography,
  computeSeaLevel,
  computeLandmask,
  computeSubstrate,
});
export default terrain;
