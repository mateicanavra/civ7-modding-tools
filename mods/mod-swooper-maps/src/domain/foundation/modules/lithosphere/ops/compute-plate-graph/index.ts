import { createOp } from "@swooper/mapgen-core/authoring";

import ComputePlateGraphContract from "./contract.js";
import strategies from "./strategies/index.js";

/** Executable plate-partition operation composed from one shared contract and its complete strategy tuple. */
export default createOp(ComputePlateGraphContract, { strategies });
