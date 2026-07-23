import { defineDomainSubdomain } from "@swooper/mapgen-core/authoring/contracts";

import ops from "./ops/contract.js";

/** Mantle branch contract for potential and forcing fields over the Foundation mesh. */
const mantle = defineDomainSubdomain({ id: "mantle", ops });

export default mantle;
