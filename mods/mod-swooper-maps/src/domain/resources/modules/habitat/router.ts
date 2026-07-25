import { createDomainSubdomainRouter } from "@swooper/mapgen-core/authoring";

import contract from "./contract.js";
import deriveHabitatFields from "./ops/derive-habitat-fields/index.js";

/** Executable resource-habitat branch. */
const habitat = createDomainSubdomainRouter(contract, {
  deriveHabitatFields,
});

export default habitat;
