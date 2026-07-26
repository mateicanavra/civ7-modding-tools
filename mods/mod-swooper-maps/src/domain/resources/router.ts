import { createDomainRouter } from "@swooper/mapgen-core/authoring";

import contract from "./contract.js";
import demand from "./demand/router.js";
import habitat from "./habitat/router.js";
import sites from "./sites/router.js";
import support from "./support/router.js";

/** Executable Resources router consumed by recipe compilation. */
const resources = createDomainRouter(contract, {
  demand,
  habitat,
  sites,
  support,
});

export default resources;
