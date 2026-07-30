import { createDomainSubdomainRouter } from "@swooper/mapgen-core/authoring";

import contract from "./contract.js";
import computeOceanGeometry from "./ops/compute-ocean-geometry/index.js";
import computeOceanSurfaceCurrents from "./ops/compute-ocean-surface-currents/index.js";
import computeOceanThermalState from "./ops/compute-ocean-thermal-state/index.js";

/**
 * Canonically binds the Ocean contract to basin geometry, surface-current, and thermal-state
 * implementations that condition downstream climate. The Hydrology router is the sole executable
 * aggregate; step authoring continues to reference the contract.
 */
const ocean = createDomainSubdomainRouter(contract, {
  computeOceanGeometry,
  computeOceanSurfaceCurrents,
  computeOceanThermalState,
});

export default ocean;
