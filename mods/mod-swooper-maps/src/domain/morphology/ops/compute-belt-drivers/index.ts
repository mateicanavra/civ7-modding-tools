import { createOp } from "@swooper/mapgen-core/authoring";

import ComputeBeltDriversContract from "./contract.js";
import { historyDerivedStrategy } from "./strategies/index.js";

const computeBeltDrivers = createOp(ComputeBeltDriversContract, {
  strategies: {
    "history-derived": historyDerivedStrategy,
  },
});

export type * from "./contract.js";
export type * from "./types.js";

export default computeBeltDrivers;
