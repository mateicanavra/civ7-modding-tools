import { defineDomain } from "@swooper/mapgen-core/authoring/contracts";

import demand from "./modules/demand/contract.js";
import habitat from "./modules/habitat/contract.js";
import sites from "./modules/sites/contract.js";
import support from "./modules/support/contract.js";

/** Resources contract composed from demand, habitat, site-selection, and support branches. */
const resources = defineDomain("resources", {
  demand,
  habitat,
  sites,
  support,
});

export default resources;
