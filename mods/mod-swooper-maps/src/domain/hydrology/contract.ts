import { defineDomain } from "@swooper/mapgen-core/authoring/contracts";

import climate from "./modules/climate/contract.js";
import cryosphere from "./modules/cryosphere/contract.js";
import hydrography from "./modules/hydrography/contract.js";
import ocean from "./modules/ocean/contract.js";

/** Hydrology contract composed by physical capability rather than recipe execution order. */
const hydrology = defineDomain("hydrology", {
  ocean,
  climate,
  cryosphere,
  hydrography,
});

export default hydrology;
