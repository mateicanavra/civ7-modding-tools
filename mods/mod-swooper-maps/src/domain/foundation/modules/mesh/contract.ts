import { defineDomainSubdomain } from "@swooper/mapgen-core/authoring/contracts";

import ops from "./ops/contract.js";

/** Mesh branch contract for deterministic world-space discretization. */
const mesh = defineDomainSubdomain({ id: "mesh", ops });

export default mesh;
