import { defineDomainSubdomain } from "@swooper/mapgen-core/authoring/contracts";

import ops from "./ops/contract.js";

/** Wonders branch contract for map-size demand and natural-wonder site planning. */
const wonders = defineDomainSubdomain({ id: "wonders", ops });

export default wonders;
