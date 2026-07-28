import { createOp } from "@swooper/mapgen-core/authoring";

import RefinePrecipitationContract from "./contract.js";
import strategies from "./strategies/index.js";

/** Applies bounded hydrographic wetness to an existing precipitation vintage. */
export default createOp(RefinePrecipitationContract, { strategies });
