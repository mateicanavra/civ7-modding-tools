import { defineDomainSubdomain } from "@swooper/mapgen-core/authoring/contracts";
import ComputeBaseTopographyContract from "./ops/compute-base-topography/contract.js";
import ComputeBeltDriversContract from "./ops/compute-belt-drivers/contract.js";
import ComputeLandmaskContract from "./ops/compute-landmask/contract.js";
import ComputeSeaLevelContract from "./ops/compute-sea-level/contract.js";
import ComputeSubstrateContract from "./ops/compute-substrate/contract.js";

/** Terrain branch contract for tectonic drivers, base relief, sea level, landmask, and substrate. */
const terrain = defineDomainSubdomain({
  id: "terrain",
  ops: {
    computeBeltDrivers: ComputeBeltDriversContract,
    computeBaseTopography: ComputeBaseTopographyContract,
    computeSeaLevel: ComputeSeaLevelContract,
    computeLandmask: ComputeLandmaskContract,
    computeSubstrate: ComputeSubstrateContract,
  },
});
export default terrain;
