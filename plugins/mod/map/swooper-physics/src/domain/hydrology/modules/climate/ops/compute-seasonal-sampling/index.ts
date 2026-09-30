import { createOp } from "@swooper/mapgen-core/authoring";
import contract from "./contract.js";
import strategies from "./strategies/index.js";

/** Executable seasonal sampling with explicit legacy-snapshot and periodic-cycle strategies. */
export default createOp(contract, { strategies });
