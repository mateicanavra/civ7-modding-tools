import { createOp } from "@swooper/mapgen-core/authoring";
import ComputePotentialDemandContract from "./contract.js";
import strategies from "./strategies/index.js";

/** Evaluates Climate's shared empirical demand law without moisture supply or river coupling. */
export default createOp(ComputePotentialDemandContract, { strategies });
