import { createOp } from "@swooper/mapgen-core/authoring";

import ScoreAtollContract from "./contract.js";
import { warmOceanBankStrategy } from "./strategies/index.js";

const scoreAtoll = createOp(ScoreAtollContract, {
  strategies: {
    "warm-ocean-bank": warmOceanBankStrategy,
  },
});

export type * from "./contract.js";

export default scoreAtoll;
