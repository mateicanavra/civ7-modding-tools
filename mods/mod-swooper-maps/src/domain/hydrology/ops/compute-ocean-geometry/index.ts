import { createOp } from "@swooper/mapgen-core/authoring";

import ComputeOceanGeometryContract from "./contract.js";
import strategies from "./strategies/index.js";

/** Labels connected seas and derives coast proximity and orientation for ocean dynamics. */
export default createOp(ComputeOceanGeometryContract, { strategies });
