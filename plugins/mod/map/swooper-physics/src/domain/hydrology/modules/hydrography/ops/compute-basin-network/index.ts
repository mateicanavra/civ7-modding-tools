import { createOp } from "@swooper/mapgen-core/authoring";
import contract from "./contract.js";
import strategies from "./strategies/index.js";
/** Executable stationary basin network owner assembled from its contract and supported sill-spill strategy. */
export default createOp(contract, { strategies });
