import ComputeBaseTopographyContract from "./compute-base-topography/contract.js";
import ComputeBeltDriversContract from "./compute-belt-drivers/contract.js";
import ComputeLandmaskContract from "./compute-landmask/contract.js";
import ComputeSeaLevelContract from "./compute-sea-level/contract.js";
import ComputeSubstrateContract from "./compute-substrate/contract.js";

/** Terrain operation contracts keyed in their causal base-surface order. */
const contracts = {
  computeBeltDrivers: ComputeBeltDriversContract,
  computeBaseTopography: ComputeBaseTopographyContract,
  computeSeaLevel: ComputeSeaLevelContract,
  computeLandmask: ComputeLandmaskContract,
  computeSubstrate: ComputeSubstrateContract,
} as const;
export default contracts;
