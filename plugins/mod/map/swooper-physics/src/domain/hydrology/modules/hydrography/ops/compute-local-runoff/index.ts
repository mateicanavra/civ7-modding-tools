import { createOp } from "@swooper/mapgen-core/authoring";
import contract from "./contract.js";
import strategies from "./strategies/index.js";

/** Preserves Number precision at the hydrology source boundary. */
export default createOp(contract, { strategies });
