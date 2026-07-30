import { createOp } from "@swooper/mapgen-core/authoring";

import ApplyAlbedoFeedbackContract from "./contract.js";
import strategies from "./strategies/index.js";

/** Feeds snow-and-ice reflectivity back into surface temperature without allowing climate correction to run away. */
export default createOp(ApplyAlbedoFeedbackContract, { strategies });
