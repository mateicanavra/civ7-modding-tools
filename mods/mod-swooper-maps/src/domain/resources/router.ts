import { createDomainRouter } from "@swooper/mapgen-core/authoring";

import contract from "./contract.js";
import demand from "./modules/demand/router.js";
import habitat from "./modules/habitat/router.js";
import sites from "./modules/sites/router.js";
import support from "./modules/support/router.js";

/** Executable Resources router consumed by recipe compilation. */
const resources = createDomainRouter(contract, {
  demand,
  habitat,
  sites,
  support,
});

export default resources;
