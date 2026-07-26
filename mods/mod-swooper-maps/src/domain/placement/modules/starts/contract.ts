import { defineDomainSubdomain } from "@swooper/mapgen-core/authoring/contracts";

import ops from "./ops/contract.js";

/** Starts branch contract for viable, fair, player-aware start assignment. */
const starts = defineDomainSubdomain({ id: "starts", ops });

export default starts;
