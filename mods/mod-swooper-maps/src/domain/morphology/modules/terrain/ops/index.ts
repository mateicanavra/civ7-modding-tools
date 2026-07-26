import type { DomainOpImplementationsForContracts } from "@swooper/mapgen-core/authoring";
import computeBaseTopography from "./compute-base-topography/index.js";
import computeBeltDrivers from "./compute-belt-drivers/index.js";
import computeLandmask from "./compute-landmask/index.js";
import computeSeaLevel from "./compute-sea-level/index.js";
import computeSubstrate from "./compute-substrate/index.js";
type Contracts = typeof import("./contract.js").default;

/** Terrain implementations keyed exactly like the branch contract registry. */
const implementations = {
  computeBeltDrivers,
  computeBaseTopography,
  computeSeaLevel,
  computeLandmask,
  computeSubstrate,
} as const satisfies DomainOpImplementationsForContracts<Contracts>;
export default implementations;
