import { createOp } from "@swooper/mapgen-core/authoring";

import ScoreVegetationTaigaContract from "./contract.js";
import strategies from "./strategies/index.js";

/** Scores cold-forest opportunity from annual energy, atmospheric water, biomass, and plant stress. */
export default createOp(ScoreVegetationTaigaContract, { strategies });
