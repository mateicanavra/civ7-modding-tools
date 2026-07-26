import { createOp } from "@swooper/mapgen-core/authoring";

import PlanVolcanoesContract from "./contract.js";
import { plateHotspotRankingStrategy } from "./strategies/index.js";

const planVolcanoes = createOp(PlanVolcanoesContract, {
  strategies: {
    "plate-hotspot-ranking": plateHotspotRankingStrategy,
  },
});

export type * from "./contract.js";
export type * from "./types.js";

export default planVolcanoes;
