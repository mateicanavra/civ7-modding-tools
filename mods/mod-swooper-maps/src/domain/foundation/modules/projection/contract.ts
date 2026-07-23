import { defineDomainSubdomain } from "@swooper/mapgen-core/authoring/contracts";

import ops from "./ops/contract.js";

/** Projection branch contract for tile-space tensors and plate topology. */
const projection = defineDomainSubdomain({ id: "projection", ops });

export default projection;
