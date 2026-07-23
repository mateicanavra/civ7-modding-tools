import { defineDomain } from "@swooper/mapgen-core/authoring/contracts";

import demand from "./demand/contract.js";
import habitat from "./habitat/contract.js";
import sites from "./sites/contract.js";
import support from "./support/contract.js";

/** Resources contract composed from demand, habitat, site-selection, and support branches. */
const resources = defineDomain("resources", {
  demand,
  habitat,
  sites,
  support,
});

export default resources;
