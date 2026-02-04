import { createOp } from "@swooper/mapgen-core/authoring";

import ComputeBeltDriversContract from "./contract.js";
import { defaultStrategy } from "./strategies/index.js";

const computeBeltDrivers = createOp(ComputeBeltDriversContract, {
  strategies: {
    default: defaultStrategy,
  },
});

export type * from "./contract.js";
export type * from "./types.js";

export default computeBeltDrivers;

