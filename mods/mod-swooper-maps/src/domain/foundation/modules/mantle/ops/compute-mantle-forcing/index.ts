import { createOp } from "@swooper/mapgen-core/authoring";

import ComputeMantleForcingContract from "./contract.js";
import strategies from "./strategies/index.js";

/** Executable mantle-forcing operation composed from one shared contract and its complete strategy tuple. */
export default createOp(ComputeMantleForcingContract, { strategies });
