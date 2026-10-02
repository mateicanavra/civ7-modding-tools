import { createOp } from "@swooper/mapgen-core/authoring";
import contract from "./contract.js";
import strategies from "./strategies/index.js";

/** Executable atmospheric aggregation with contract-admitted reduction inputs. */
export default createOp(contract, { strategies });
