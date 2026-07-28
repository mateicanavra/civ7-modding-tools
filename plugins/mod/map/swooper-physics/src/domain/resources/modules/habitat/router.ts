import { createDomainSubdomainRouter } from "@swooper/mapgen-core/authoring";

import contract from "./contract.js";
import deriveHabitatFields from "./ops/derive-habitat-fields/index.js";

/**
 * Canonically binds the Habitat contract to derivation of physical resource-planning lanes from
 * admitted map evidence. The Resources router is the sole executable aggregate; step authoring
 * continues to reference the contract.
 */
const habitat = createDomainSubdomainRouter(contract, {
  deriveHabitatFields,
});

export default habitat;
