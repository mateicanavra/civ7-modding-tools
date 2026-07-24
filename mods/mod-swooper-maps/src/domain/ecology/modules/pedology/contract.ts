import { defineDomainSubdomain } from "@swooper/mapgen-core/authoring/contracts";

import ops from "./ops/contract.js";

/** Pedology branch contract for soil classification and grid-cell evidence. */
const pedology = defineDomainSubdomain({ id: "pedology", ops });

export default pedology;
