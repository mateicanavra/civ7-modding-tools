import { createOp } from "@swooper/mapgen-core/authoring";

import SelectNavigableRiverTerrainContract from "./contract.js";
import strategies from "./strategies/index.js";

/** Ranks connected river chains and selects coherent terrain endpoints that the Civ7 projection can materialize. */
export default createOp(SelectNavigableRiverTerrainContract, { strategies });
