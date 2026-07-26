import ComputeOceanGeometryContract from "./compute-ocean-geometry/contract.js";
import ComputeOceanSurfaceCurrentsContract from "./compute-ocean-surface-currents/contract.js";
import ComputeOceanThermalStateContract from "./compute-ocean-thermal-state/contract.js";

/** Ocean operation contracts keyed for exact branch composition. */
const contracts = {
  computeOceanGeometry: ComputeOceanGeometryContract,
  computeOceanSurfaceCurrents: ComputeOceanSurfaceCurrentsContract,
  computeOceanThermalState: ComputeOceanThermalStateContract,
} as const;

export default contracts;
