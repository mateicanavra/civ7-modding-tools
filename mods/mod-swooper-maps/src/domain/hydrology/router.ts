import { createDomainRouter } from "@swooper/mapgen-core/authoring";

import contract from "./contract.js";
import climate from "./modules/climate/router.js";
import cryosphere from "./modules/cryosphere/router.js";
import hydrography from "./modules/hydrography/router.js";
import ocean from "./modules/ocean/router.js";

/** Executable Hydrology router consumed by recipe compilation. */
const hydrology = createDomainRouter(contract, {
  ocean,
  climate,
  cryosphere,
  hydrography,
});

export default hydrology;
