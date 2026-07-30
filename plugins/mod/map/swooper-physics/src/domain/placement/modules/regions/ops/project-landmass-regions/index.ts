import { createOp } from "@swooper/mapgen-core/authoring";
import contract from "./contract.js";
import strategies from "./strategies/index.js";

/** Executable gameplay-region classification operation. */
export default createOp(contract, { strategies });
