import { createDomainRouter } from "@swooper/mapgen-core/authoring";

import contract from "./contract.js";
import starts from "./modules/starts/router.js";
import wonders from "./modules/wonders/router.js";

/** Executable Placement router consumed by the terminal recipe stages. */
const placement = createDomainRouter(contract, {
  wonders,
  starts,
});

export default placement;
