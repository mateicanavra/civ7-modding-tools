import { createOp } from "@swooper/mapgen-core/authoring";

import ComputeCoastalAdjacencyContract from "./contract.js";
import strategies from "./strategies/index.js";

/** Labels land and water tiles that meet along the current wrapped-hex shoreline. */
const computeCoastalAdjacency = createOp(ComputeCoastalAdjacencyContract, { strategies });

export default computeCoastalAdjacency;
