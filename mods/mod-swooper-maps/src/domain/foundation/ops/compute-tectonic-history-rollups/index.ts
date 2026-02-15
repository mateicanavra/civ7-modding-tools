import { createOp } from "@swooper/mapgen-core/authoring";

import ComputeTectonicHistoryRollupsContract from "./contract.js";
import { defaultStrategy } from "./strategies/index.js";

const computeTectonicHistoryRollups = createOp(ComputeTectonicHistoryRollupsContract, {
  strategies: {
    default: defaultStrategy,
  },
});

export default computeTectonicHistoryRollups;
