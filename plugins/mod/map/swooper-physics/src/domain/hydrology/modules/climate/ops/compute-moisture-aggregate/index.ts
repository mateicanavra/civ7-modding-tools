import { createOp } from "@swooper/mapgen-core/authoring";
import contract from "./contract.js";
import strategies from "./strategies/index.js";

/** Executable moisture aggregation with contract-admitted weather and annual samples. */
export default createOp(contract, { strategies });
