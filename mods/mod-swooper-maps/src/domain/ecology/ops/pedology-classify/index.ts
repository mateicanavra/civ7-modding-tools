import { createOp } from "@swooper/mapgen-core/authoring";
import PedologyClassifyContract from "./contract.js";
import {
  balancedStrategy,
  coastalShelfStrategy,
  orogenyBoostedStrategy,
} from "./strategies/index.js";

/** Pedology operation with balanced, coastal-shelf, and orogeny-weighted strategies. */
const classifyPedology = createOp(PedologyClassifyContract, {
  strategies: {
    balanced: balancedStrategy,
    "coastal-shelf": coastalShelfStrategy,
    "orogeny-boosted": orogenyBoostedStrategy,
  },
});

export type * from "./contract.js";
export type * from "./types.js";

export default classifyPedology;
