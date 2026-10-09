import { createOp } from "@swooper/mapgen-core/authoring";

import ComputeMoistureForcingContract from "./contract.js";
import strategies from "./strategies/index.js";

export default createOp(ComputeMoistureForcingContract, { strategies });
