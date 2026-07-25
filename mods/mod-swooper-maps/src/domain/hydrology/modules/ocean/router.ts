import { createDomainSubdomainRouter } from "@swooper/mapgen-core/authoring";

import contract from "./contract.js";
import computeOceanGeometry from "./ops/compute-ocean-geometry/index.js";
import computeOceanSurfaceCurrents from "./ops/compute-ocean-surface-currents/index.js";
import computeOceanThermalState from "./ops/compute-ocean-thermal-state/index.js";

/** Executable Hydrology ocean branch. */
const ocean = createDomainSubdomainRouter(contract, {
  computeOceanGeometry,
  computeOceanSurfaceCurrents,
  computeOceanThermalState,
});

export default ocean;
