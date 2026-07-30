import { createDomainRouter } from "@swooper/mapgen-core/authoring";

import contract from "./contract.js";
import climate from "./modules/climate/router.js";
import cryosphere from "./modules/cryosphere/router.js";
import hydrography from "./modules/hydrography/router.js";
import ocean from "./modules/ocean/router.js";

/**
 * Binds Hydrology's ocean, climate, cryosphere, and hydrography contracts to the executable chain
 * that produces climate, frozen-water, river, and lake evidence. Recipe runtime compilation
 * consumes this router; step authoring imports the contract-only domain.
 */
const hydrology = createDomainRouter(contract, {
  ocean,
  climate,
  cryosphere,
  hydrography,
});

export default hydrology;
