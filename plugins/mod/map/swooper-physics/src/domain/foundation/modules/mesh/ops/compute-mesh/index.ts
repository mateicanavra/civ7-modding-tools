import { createOp } from "@swooper/mapgen-core/authoring";

import ComputeMeshContract from "./contract.js";
import strategies from "./strategies/index.js";

/** Executable mesh operation composed from one shared input/output contract and its complete strategy tuple. */
export default createOp(ComputeMeshContract, { strategies });
