import { createDomain } from "@swooper/mapgen-core/authoring";

import domain from "./index.js";
import implementations from "./ops/index.js";

export default createDomain(domain, implementations);

export { DEFAULT_ELEVATION_SCALE } from "./ops/compute-base-topography/rules/index.js";
export { GeomorphicCycleConfigSchema } from "./ops/compute-geomorphic-cycle/contract.js";
export { LandmaskConfigSchema } from "./ops/compute-landmask/contract.js";
export { ShelfMaskConfigSchema } from "./ops/compute-shelf-mask/contract.js";
export { SubstrateConfigSchema } from "./ops/compute-substrate/contract.js";
