import { createOp } from "@swooper/mapgen-core/authoring";
import contract from "./contract.js";
import strategies from "./strategies/index.js";
/** Executable metadata classifier for resolved basin bodies, actual principal edges, and external-DAG source counts. */
export default createOp(contract, { strategies });
