import { createOp } from "@swooper/mapgen-core/authoring";

import ScoreLotusContract from "./contract.js";
import { defaultStrategy } from "./strategies/index.js";

const scoreLotus = createOp(ScoreLotusContract, {
  strategies: {
    default: defaultStrategy,
  },
});

export type * from "./contract.js";

export default scoreLotus;

