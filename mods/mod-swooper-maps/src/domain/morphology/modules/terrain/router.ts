import { createDomainSubdomainRouter } from "@swooper/mapgen-core/authoring";
import contract from "./contract.js";
import computeBaseTopography from "./ops/compute-base-topography/index.js";
import computeBeltDrivers from "./ops/compute-belt-drivers/index.js";
import computeLandmask from "./ops/compute-landmask/index.js";
import computeSeaLevel from "./ops/compute-sea-level/index.js";
import computeSubstrate from "./ops/compute-substrate/index.js";

/** Executable Morphology terrain branch bound to its admitted operation implementations. */
const terrain = createDomainSubdomainRouter(contract, {
  computeBeltDrivers,
  computeBaseTopography,
  computeSeaLevel,
  computeLandmask,
  computeSubstrate,
});
export default terrain;
