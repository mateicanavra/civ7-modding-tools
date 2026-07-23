import { createOp } from "@swooper/mapgen-core/authoring";

import AccumulateDischargeContract from "./contract.js";
import strategies from "./strategies/index.js";

/** Accumulates rainfall-derived runoff along drainage receivers into causal discharge, sink, and outlet evidence. */
export default createOp(AccumulateDischargeContract, { strategies });
