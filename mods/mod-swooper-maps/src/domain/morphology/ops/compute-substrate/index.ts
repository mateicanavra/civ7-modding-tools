import { createOp } from "@swooper/mapgen-core/authoring";

import ComputeSubstrateContract from "./contract.js";
import strategies from "./strategies/index.js";

/** Derives terrain erodibility and sediment depth from crust and tectonic material signals. */
const computeSubstrate = createOp(ComputeSubstrateContract, { strategies });

export default computeSubstrate;
