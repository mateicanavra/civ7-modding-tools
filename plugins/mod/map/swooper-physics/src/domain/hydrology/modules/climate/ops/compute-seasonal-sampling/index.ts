import { createOp } from "@swooper/mapgen-core/authoring";
import contract from "./contract.js";
import strategies from "./strategies/index.js";

/** Executable periodic integration sampling with independent observation indices. */
export default createOp(contract, { strategies });
