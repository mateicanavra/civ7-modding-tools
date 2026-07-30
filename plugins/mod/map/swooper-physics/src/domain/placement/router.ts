import { createDomainRouter } from "@swooper/mapgen-core/authoring";

import contract from "./contract.js";
import regions from "./modules/regions/router.js";
import starts from "./modules/starts/router.js";
import wonders from "./modules/wonders/router.js";

/**
 * Binds Placement's wonder, region, and start contracts to the executable planning chain consumed
 * by terminal recipe steps. Recipe runtime compilation consumes this router; step authoring
 * imports the contract-only domain.
 */
const placement = createDomainRouter(contract, {
  wonders,
  regions,
  starts,
});

export default placement;
