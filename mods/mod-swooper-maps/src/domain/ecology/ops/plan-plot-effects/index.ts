import { createOp } from "@swooper/mapgen-core/authoring";
import PlanPlotEffectsContract from "./contract.js";
import { rankedCoverageStrategy } from "./strategies/index.js";

const planPlotEffects = createOp(PlanPlotEffectsContract, {
  strategies: {
    "ranked-coverage": rankedCoverageStrategy,
  },
});

export type * from "./contract.js";
export type * from "./types.js";

export default planPlotEffects;
