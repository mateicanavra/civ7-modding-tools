import { createOp } from "@swooper/mapgen-core/authoring";
import ResourceScoreBalanceContract from "./contract.js";
import { confidenceCapStrategy } from "./strategies/index.js";

const scoreResourceBasins = createOp(ResourceScoreBalanceContract, {
  strategies: {
    "confidence-cap": confidenceCapStrategy,
  },
});

export type * from "./contract.js";
export type * from "./types.js";

export default scoreResourceBasins;
