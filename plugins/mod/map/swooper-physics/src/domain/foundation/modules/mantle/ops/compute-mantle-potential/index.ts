import { createOp } from "@swooper/mapgen-core/authoring";

import ComputeMantlePotentialContract from "./contract.js";
import strategies from "./strategies/index.js";

/** Executable mantle-potential operation composed from one shared contract and its complete strategy tuple. */
export default createOp(ComputeMantlePotentialContract, { strategies });
