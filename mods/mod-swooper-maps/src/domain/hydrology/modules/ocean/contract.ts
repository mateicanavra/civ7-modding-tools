import { defineDomainSubdomain } from "@swooper/mapgen-core/authoring/contracts";

import ops from "./ops/contract.js";

/** Ocean branch contract for basin geometry, surface currents, and thermal state. */
const ocean = defineDomainSubdomain({ id: "ocean", ops });

export default ocean;
