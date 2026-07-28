import { createOp } from "@swooper/mapgen-core/authoring";

import ComputePlatesTensorsContract from "./contract.js";
import strategies from "./strategies/index.js";

/** Executable plate-projection operation composed from one shared contract and its complete strategy tuple. */
export default createOp(ComputePlatesTensorsContract, { strategies });
