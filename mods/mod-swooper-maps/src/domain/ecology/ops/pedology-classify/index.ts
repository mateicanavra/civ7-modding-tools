import { createOp } from "@swooper/mapgen-core/authoring";

import PedologyClassifyContract from "./contract.js";
import strategies from "./strategies/index.js";

/** Derives soil class and fertility from climate, relief, sediment, and bedrock through one shared classifier boundary. */
export default createOp(PedologyClassifyContract, { strategies });
