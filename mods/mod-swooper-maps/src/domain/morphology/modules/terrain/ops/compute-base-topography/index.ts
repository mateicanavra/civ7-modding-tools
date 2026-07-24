import { createOp } from "@swooper/mapgen-core/authoring";

import ComputeBaseTopographyContract from "./contract.js";
import strategies from "./strategies/index.js";

/** Produces the initial elevation field from crust isostasy and tectonic relief signals. */
const computeBaseTopography = createOp(ComputeBaseTopographyContract, { strategies });

export default computeBaseTopography;
