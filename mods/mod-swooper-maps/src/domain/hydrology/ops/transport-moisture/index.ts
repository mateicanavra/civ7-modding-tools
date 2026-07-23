import { createOp } from "@swooper/mapgen-core/authoring";

import TransportMoistureContract from "./contract.js";
import strategies from "./strategies/index.js";

/** Advects evaporation-sourced humidity through the admitted wind field while preserving bounded retention. */
export default createOp(TransportMoistureContract, { strategies });
