import { defineDomainSubdomain } from "@swooper/mapgen-core/authoring/contracts";

import ComputeOceanGeometryContract from "./ops/compute-ocean-geometry/contract.js";
import ComputeOceanSurfaceCurrentsContract from "./ops/compute-ocean-surface-currents/contract.js";
import ComputeOceanThermalStateContract from "./ops/compute-ocean-thermal-state/contract.js";

/** Ocean branch contract for basin geometry, surface currents, and thermal state. */
const ocean = defineDomainSubdomain({
  id: "ocean",
  ops: {
    computeOceanGeometry: ComputeOceanGeometryContract,
    computeOceanSurfaceCurrents: ComputeOceanSurfaceCurrentsContract,
    computeOceanThermalState: ComputeOceanThermalStateContract,
  },
});

export default ocean;
