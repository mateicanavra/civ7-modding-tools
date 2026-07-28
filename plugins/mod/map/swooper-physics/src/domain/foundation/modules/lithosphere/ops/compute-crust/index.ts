import { createOp } from "@swooper/mapgen-core/authoring";

import ComputeCrustContract from "./contract.js";
import strategies from "./strategies/index.js";

/** Executable crust-initialization operation composed from one shared contract and its complete strategy tuple. */
export default createOp(ComputeCrustContract, { strategies });
