import { defineDomainSubdomain } from "@swooper/mapgen-core/authoring/contracts";

import ops from "./ops/contract.js";

/** Lithosphere branch contract for initial crust and plate partitioning. */
const lithosphere = defineDomainSubdomain({ id: "lithosphere", ops });

export default lithosphere;
