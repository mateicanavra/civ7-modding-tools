import { createOp } from "@swooper/mapgen-core/authoring";

import ComputePlateTopologyContract from "./contract.js";
import strategies from "./strategies/index.js";

/** Executable plate-topology operation composed from one shared contract and its complete strategy tuple. */
export default createOp(ComputePlateTopologyContract, { strategies });
