import { createDomainRouter } from "@swooper/mapgen-core/authoring";

import contract from "./contract.js";
import regions from "./modules/regions/router.js";
import starts from "./modules/starts/router.js";
import wonders from "./modules/wonders/router.js";

/** Executable Placement router consumed by the terminal recipe stages. */
const placement = createDomainRouter(contract, {
  wonders,
  regions,
  starts,
});

export default placement;
