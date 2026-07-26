import { defineDomainSubdomain } from "@swooper/mapgen-core/authoring/contracts";

import ops from "./ops/contract.js";

/** Hydrography branch contract for routing, discharge, rivers, and lakes. */
const hydrography = defineDomainSubdomain({ id: "hydrography", ops });

export default hydrography;
