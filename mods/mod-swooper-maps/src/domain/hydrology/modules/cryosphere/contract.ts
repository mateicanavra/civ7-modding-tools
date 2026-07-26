import { defineDomainSubdomain } from "@swooper/mapgen-core/authoring/contracts";

import ops from "./ops/contract.js";

/** Cryosphere branch contract for snow, ground ice, and albedo feedback. */
const cryosphere = defineDomainSubdomain({ id: "cryosphere", ops });

export default cryosphere;
