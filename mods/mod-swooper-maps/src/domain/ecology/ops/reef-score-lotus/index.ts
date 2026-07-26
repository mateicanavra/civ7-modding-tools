import { createOp } from "@swooper/mapgen-core/authoring";

import ScoreLotusContract from "./contract.js";
import { warmShallowLakeStrategy } from "./strategies/index.js";

const scoreLotus = createOp(ScoreLotusContract, {
  strategies: {
    "warm-shallow-lake": warmShallowLakeStrategy,
  },
});

export type * from "./contract.js";

export default scoreLotus;
